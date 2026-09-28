/**
 * Agent-selection eval: does an AI agent working in an app pick the Quill
 * component the usage guides say is right?
 *
 * Each case in agent-selection-cases.mjs is asked of a fresh, headless Claude
 * Code session in a throwaway app, twice:
 *   - before: the rules file as of BEFORE_REF (block names only, no skill)
 *   - after:  the rules file and quill-components skill in this checkout
 * The session sees only the app's project files (`--setting-sources project`,
 * no MCP servers), so the maintainer's own instructions and plugins cannot
 * help or hurt it, and it may only read files, never write them.
 *
 * Not part of CI: every run is a paid model call. Run it on demand:
 *   npm run eval:selection                       both arms, all cases
 *   npm run eval:selection -- --arm after --only kpis,cmd-k
 *   npm run eval:selection -- --model sonnet --concurrency 2
 * A full run writes docs/audits/<date>-agent-selection-eval.md and a .json of
 * every answer beside it.
 */
import { spawn, execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, cpSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { parseArgs } from 'node:util'

import { CASES, acceptedPicks } from './agent-selection-cases.mjs'
import { SKILL_SRC } from './build-agent-rules.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
// The last release before the skill shipped: the rules file then listed block names only.
export const BEFORE_REF = 'v0.13.2'
const RULES_SRC = 'registry/agent-rules/quill.md'

export function promptFor(c) {
  return `${c.request}

Which Quill component should I use for this? Don't write or change any code. End your reply with one line in exactly this form: \`PICK: <name>\`, the single Quill block or primitive you would use, or \`PICK: none\` if nothing in Quill fits.`
}

/** The agent's final pick, normalised: `@quill/login` and `Login` both read as `login`. */
export function parsePick(text) {
  const matches = [...String(text ?? '').matchAll(/PICK:\s*`?(?:@quill\/)?([A-Za-z0-9-]+)`?/g)]
  return matches.length ? matches.at(-1)[1].toLowerCase() : null
}

/** A throwaway app holding only what an app receives from `@quill/agent-rules` in that arm. */
function makeApp(arm) {
  const dir = mkdtempSync(join(tmpdir(), `quill-eval-${arm}-`))
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'eval-app', private: true }, null, 2))
  mkdirSync(join(dir, '.claude/rules'), { recursive: true })
  const rules = arm === 'before'
    ? execFileSync('git', ['show', `${BEFORE_REF}:${RULES_SRC}`], { cwd: root, encoding: 'utf8' })
    : readFileSync(join(root, RULES_SRC), 'utf8')
  writeFileSync(join(dir, '.claude/rules/quill.md'), rules)
  if (arm === 'after') cpSync(join(root, SKILL_SRC), join(dir, '.claude/skills/quill-components'), { recursive: true })
  return dir
}

/** One headless session. Resolves with what it picked and what it read on the way. */
function ask(c, appDir, { model, budget }) {
  const args = [
    '-p', promptFor(c),
    '--setting-sources', 'project',
    '--strict-mcp-config',
    '--no-session-persistence',
    '--output-format', 'stream-json', '--verbose',
    '--allowedTools', 'Skill,Read,Glob,Grep',
    '--max-budget-usd', String(budget),
  ]
  if (model) args.push('--model', model)
  return new Promise((resolve) => {
    const child = spawn('claude', args, { cwd: appDir, stdio: ['ignore', 'pipe', 'pipe'] })
    let buffer = ''
    const run = { skills: [], guidesRead: [], text: '', cost: 0, model: null, error: null }
    const handle = (line) => {
      if (!line.trim()) return
      let event
      try { event = JSON.parse(line) } catch { return }
      if (event.type === 'system' && event.subtype === 'init') run.model = event.model
      if (event.type === 'assistant') {
        for (const part of event.message?.content ?? []) {
          if (part.type !== 'tool_use') continue
          if (part.name === 'Skill') run.skills.push(part.input?.skill ?? part.input?.command ?? '?')
          const guide = /\/reference\/([a-z0-9-]+)\.md$/.exec(part.input?.file_path ?? '')
          if (part.name === 'Read' && guide) run.guidesRead.push(guide[1])
        }
      }
      if (event.type === 'result') {
        run.text = event.result ?? ''
        run.cost = event.total_cost_usd ?? 0
        if (event.is_error) run.error = event.subtype
      }
    }
    child.stdout.on('data', (chunk) => {
      buffer += chunk
      const lines = buffer.split('\n')
      buffer = lines.pop()
      lines.forEach(handle)
    })
    child.on('error', (err) => { run.error = err.message })
    child.on('close', () => {
      handle(buffer)
      const pick = parsePick(run.text)
      resolve({ ...run, pick, pass: acceptedPicks(c).includes(pick) })
    })
  })
}

/** Runs jobs a few at a time: enough to finish in minutes, few enough not to trip rate limits. */
async function pool(jobs, size) {
  const results = new Array(jobs.length)
  let next = 0
  const worker = async () => {
    while (next < jobs.length) {
      const index = next++
      results[index] = await jobs[index]()
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, jobs.length) }, worker))
  return results
}

function report(rows, arms, meta) {
  const score = (arm) => rows.filter((r) => r[arm]?.pass).length
  const loaded = rows.filter((r) => r.after?.skills.includes('quill-components')).length
  const L = []
  L.push(`# Agent-selection eval — ${meta.date}`)
  L.push('')
  L.push(`Model: ${meta.model ?? 'default'} · Cases: ${rows.length} · Before = rules file at ${BEFORE_REF} (names only, no skill) · After = this checkout (rules + quill-components skill) · Cost: $${meta.cost.toFixed(2)}`)
  L.push('')
  for (const arm of arms) L.push(`- **${arm}:** ${score(arm)}/${rows.length} correct`)
  if (arms.includes('after')) L.push(`- **Skill loaded (after):** ${loaded}/${rows.length}`)
  L.push('')
  L.push(`| Case | Right answer | ${arms.map((a) => `${a} pick`).join(' | ')}${arms.includes('after') ? ' | Guides read (after)' : ''} |`)
  L.push(`|---|---|${arms.map(() => '---|').join('')}${arms.includes('after') ? '---|' : ''}`)
  for (const r of rows) {
    const right = [r.case.expect, ...(r.case.accept ?? []).map((a) => `(${a})`)].join(' ')
    const cells = arms.map((a) => `${r[a].pass ? '✓' : '✗'} ${r[a].pick ?? '—'}${r[a].error ? ` [${r[a].error}]` : ''}`)
    const guides = arms.includes('after') ? ` | ${r.after.guidesRead.join(', ') || '—'}` : ''
    L.push(`| ${r.case.id} | ${right} | ${cells.join(' | ')}${guides} |`)
  }
  return L.join('\n') + '\n'
}

async function main() {
  const { values } = parseArgs({
    options: {
      arm: { type: 'string', default: 'both' },
      only: { type: 'string' },
      model: { type: 'string' },
      concurrency: { type: 'string', default: '4' },
      budget: { type: 'string', default: '1' },
    },
  })
  const arms = values.arm === 'both' ? ['before', 'after'] : [values.arm]
  const only = values.only?.split(',')
  const cases = only ? CASES.filter((c) => only.includes(c.id)) : CASES
  const apps = Object.fromEntries(arms.map((arm) => [arm, makeApp(arm)]))
  const options = { model: values.model, budget: Number(values.budget) }

  console.log(`asking ${cases.length} cases × ${arms.join(' + ')} (${cases.length * arms.length} sessions)…`)
  const jobs = cases.flatMap((c) => arms.map((arm) => async () => {
    const result = await ask(c, apps[arm], options)
    console.log(`  ${result.pass ? '✓' : '✗'} ${arm.padEnd(6)} ${c.id.padEnd(20)} picked ${result.pick ?? '—'} (right: ${acceptedPicks(c).join(' / ')})${result.error ? ` [${result.error}]` : ''}`)
    return { id: c.id, arm, result }
  }))
  const flat = await pool(jobs, Number(values.concurrency))
  for (const dir of Object.values(apps)) rmSync(dir, { recursive: true, force: true })

  const rows = cases.map((c) => Object.fromEntries([
    ['case', c],
    ...arms.map((arm) => [arm, flat.find((f) => f.id === c.id && f.arm === arm).result]),
  ]))
  const meta = {
    date: new Date().toISOString().slice(0, 10),
    model: flat.find((f) => f.result.model)?.result.model,
    cost: flat.reduce((sum, f) => sum + f.result.cost, 0),
  }
  const markdown = report(rows, arms, meta)
  console.log(`\n${markdown}`)
  // Partial runs are for poking at one case; only a full run is worth keeping.
  if (!only && arms.length === 2) {
    const base = join(root, 'docs/audits', `${meta.date}-agent-selection-eval`)
    writeFileSync(`${base}.md`, markdown)
    writeFileSync(`${base}.json`, JSON.stringify({ meta, rows }, null, 2) + '\n')
    console.log(`wrote docs/audits/${meta.date}-agent-selection-eval.md (+ .json)`)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main()
