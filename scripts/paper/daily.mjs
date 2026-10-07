/**
 * `npm run paper:daily`: the unattended daily Paper check, for this Mac.
 *
 * Each run, in its OWN copy of the repository (never the working checkout):
 *   1. bring that copy to origin/main
 *   2. if Paper is not open, stop quietly (and say so loudly after a week of that)
 *   3. `paper:sync` for what changed, then `paper:check`
 *   4. if the record changed, push it to the branch auto/paper-sync and open or update ONE
 *      pull request, "chore(paper): daily sync", whose body is the check's summary
 *
 * It commits only files under paper/, never merges, never pushes to main.
 *
 *   npm run paper:daily -- --dry-run     # go as far as reading; print what a real run would push
 *
 * Environment (all optional):
 *   QUILL_PAPER_HOME     the job's folder        (~/Library/Application Support/quill-paper-sync)
 *   QUILL_PAPER_LOGS     where logs go           (~/Library/Logs/quill-paper-sync)
 *   QUILL_PAPER_REMOTE   what to clone           (this checkout's origin)
 *   QUILL_PAPER_REF      what to stand on        (origin/main)
 */
import { execFile, spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { delimiter, dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

const run = promisify(execFile)
const here = dirname(fileURLToPath(import.meta.url))

export const BRANCH = 'auto/paper-sync'
export const PR_TITLE = 'chore(paper): daily sync'
export const AUTHOR = { name: 'craftwell-ai', email: '301478407+craftwell-ai@users.noreply.github.com' }
export const SKIPS_BEFORE_ALARM = 7
export const KEEP_LOGS = 14
const TIMEOUT_MS = 45 * 60 * 1000
const STALE_LOCK_MS = 2 * 60 * 60 * 1000

export const paths = (env = process.env) => {
  const home = env.QUILL_PAPER_HOME || join(homedir(), 'Library/Application Support/quill-paper-sync')
  return { home, repo: join(home, 'repo'), state: join(home, 'state.json'), lock: join(home, 'run.lock'), tools: join(home, 'tools.json'), logs: env.QUILL_PAPER_LOGS || join(homedir(), 'Library/Logs/quill-paper-sync') }
}

// ------------------------------------------------------------------ pure pieces (unit-tested)

/** The job may commit the record and nothing else. `porcelain` is `git status --porcelain` output. */
export function changedPaths(porcelain) {
  return porcelain.split('\n').filter(Boolean).map((line) => line.slice(3).split(' -> ').at(-1).replace(/^"|"$/g, ''))
}
export function onlyPaper(pathsChanged) {
  const outside = pathsChanged.filter((path) => !path.startsWith('paper/'))
  return { ok: outside.length === 0, outside }
}

/** Count runs skipped because Paper was closed; the 7th in a row is worth interrupting someone for. */
export function afterSkip(state) {
  const skips = (state.consecutiveSkips ?? 0) + 1
  return { state: { ...state, consecutiveSkips: skips }, alarm: skips === SKIPS_BEFORE_ALARM, skips }
}

/** Log files to delete, oldest first, keeping the newest `keep` (names sort by date). */
export const logsToRemove = (names, keep = KEEP_LOGS) => names.filter((name) => /^\d{4}-\d{2}-\d{2}_\d{6}\.log$/.test(name)).sort().slice(0, -keep)

/** The pull request body: what was re-drawn and why, then the check's own summary. */
export function prBody({ synced = [], failed = [], reasons = {}, summary = '', regressions = 0, date }) {
  const lines = [`The daily Paper check on Ryan's Mac, ${date}. It re-drew what had changed in code and compared Paper with Storybook.`, '']
  if (synced.length) {
    lines.push(`### Re-drawn in Paper (${synced.length})`, '')
    for (const slug of synced) lines.push(`- \`${slug}\`: ${reasons[slug] ?? 'code changed'}`)
    lines.push('')
  } else lines.push('Nothing needed re-drawing.', '')
  if (failed.length) lines.push(`### Could not be drawn (${failed.length})`, '', ...failed.map((slug) => `- \`${slug}\`: the message is in \`paper/sync-state.json\``), '')
  lines.push(summary.trim() || '_The check did not run._', '')
  lines.push(regressions ? `**${regressions} regression${regressions === 1 ? '' : 's'}** above: Paper now differs from Storybook by more than was accepted. Merging this records what was drawn; it does not accept the difference. Look at the piece in Paper, fix the cause, or accept it with \`npm run paper:check -- --accept --only <name>\`.` : 'No regressions.')
  lines.push('', 'This PR only changes files under `paper/` (the record of what is in the Paper file). Nothing here ships to apps. It is safe to merge; it is never merged automatically.')
  return lines.join('\n')
}

// ------------------------------------------------------------------ the machinery

/** Where node, npm, gh and git live. Recorded at install time (launchd has no shell profile); searched for otherwise. */
export function resolveTools(file, env = process.env) {
  const recorded = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {}
  const folders = [...(env.PATH ?? '').split(delimiter), dirname(process.execPath), '/opt/homebrew/bin', '/usr/local/bin', '/usr/bin', '/bin'].filter(Boolean)
  const find = (name) => folders.map((folder) => join(folder, name)).find((candidate) => existsSync(candidate)) ?? null
  const tools = { node: recorded.node ?? process.execPath, npm: recorded.npm ?? find('npm'), gh: recorded.gh ?? find('gh'), git: recorded.git ?? find('git') }
  const missing = Object.entries(tools).filter(([, path]) => !path || !existsSync(path)).map(([name]) => name)
  // children find each other through PATH (npm is a node script; git calls its helpers)
  const PATH = [...new Set([...Object.values(tools).filter(Boolean).map((path) => dirname(path)), '/usr/bin', '/bin', '/usr/sbin', '/sbin'])].join(delimiter)
  return { tools, missing, PATH }
}

function logger(dir, { echo = true } = {}) {
  mkdirSync(dir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').slice(0, 15)
  const file = join(dir, `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}_${stamp.slice(9)}.log`)
  for (const old of logsToRemove(readdirSync(dir))) rmSync(join(dir, old))
  const log = (line = '') => { appendFileSync(file, `${new Date().toISOString().slice(11, 19)} ${line}\n`); if (echo) console.log(line) }
  return { log, file }
}

function takeLock(file) {
  mkdirSync(dirname(file), { recursive: true })
  if (existsSync(file)) {
    const { pid, at } = JSON.parse(readFileSync(file, 'utf8') || '{}')
    let alive = false
    try { process.kill(pid, 0); alive = true } catch { /* that run is gone */ }
    if (alive && Date.now() - at < STALE_LOCK_MS) return false
    rmSync(file)
  }
  closeSync(openSync(file, 'wx'))
  writeFileSync(file, JSON.stringify({ pid: process.pid, at: Date.now() }))
  return true
}

const notify = (message) => run('/usr/bin/osascript', ['-e', `display notification ${JSON.stringify(message)} with title "Quill Paper sync"`]).catch(() => {})
const readJson = (file, fallback) => (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback)

export async function daily({ dryRun = false, env = process.env } = {}) {
  const where = paths(env)
  const { log, file: logFile } = logger(where.logs)
  if (!takeLock(where.lock)) { log('another run is in progress: nothing done'); return { status: 'locked' } }
  const { tools, missing, PATH } = resolveTools(where.tools, env)
  const childEnv = { ...env, PATH, HOME: env.HOME ?? homedir(), CI: '' }
  const children = new Set()
  let state = readJson(where.state, {})
  const saveState = () => { mkdirSync(where.home, { recursive: true }); writeFileSync(where.state, JSON.stringify(state, null, 2) + '\n') }
  const git = async (...args) => (await run(tools.git, ['-C', where.repo, ...args], { env: childEnv, maxBuffer: 64 * 1024 * 1024 })).stdout.trim()
  /** A long step, streamed into the log; resolves with `{ code, output }`. */
  const step = (command, args, extraEnv = {}) => new Promise((resolve) => {
    const child = spawn(command, args, { cwd: where.repo, env: { ...childEnv, ...extraEnv }, stdio: ['ignore', 'pipe', 'pipe'] })
    children.add(child)
    let output = ''
    const take = (chunk) => { output += chunk; for (const line of String(chunk).split('\n')) if (line.trim()) log(`  | ${line}`) }
    child.stdout.on('data', take)
    child.stderr.on('data', take)
    child.on('close', (code) => { children.delete(child); resolve({ code, output }) })
  })
  let serving = null
  const timer = setTimeout(async () => {
    log(`STOPPED: still running after ${TIMEOUT_MS / 60000} minutes`)
    for (const child of children) child.kill('SIGTERM')
    // take Paper's "an agent is working here" markers off whatever was mid-write
    try { const { connect } = await import('./client.mjs'); const paper = await connect(); const record = readJson(join(where.repo, 'paper/sync-state.json'), {}); if (record.file?.id) await paper.call('finish_working_on_nodes', { fileId: record.file.id }) } catch { /* Paper is gone too */ }
    serving?.close()
    rmSync(where.lock, { force: true })
    process.exit(1)
  }, TIMEOUT_MS)

  try {
    log(`quill-paper-sync${dryRun ? ' (dry run: nothing is pushed, nothing is written to Paper)' : ''} · log ${logFile}`)
    if (missing.length) throw new Error(`cannot find ${missing.join(', ')}: run  npm run paper:schedule -- install  to record where they are`)

    // 1. the job's own copy, at origin/main
    const remote = env.QUILL_PAPER_REMOTE || (await run(tools.git, ['-C', join(here, '../..'), 'remote', 'get-url', 'origin'], { env: childEnv })).stdout.trim()
    const ref = env.QUILL_PAPER_REF || 'origin/main'
    if (!existsSync(join(where.repo, '.git'))) {
      log(`first run: cloning ${remote} into ${where.repo}`)
      mkdirSync(where.home, { recursive: true })
      await run(tools.git, ['clone', '--quiet', remote, where.repo], { env: childEnv })
    }
    await git('fetch', '--quiet', '--prune', 'origin')
    // a disposable copy: whatever a previous run left behind is thrown away
    await git('checkout', '--quiet', '--force', '-B', 'paper-sync-work', ref)
    await git('reset', '--quiet', '--hard', ref)
    await git('clean', '-fdq')
    await git('config', 'user.name', AUTHOR.name)
    await git('config', 'user.email', AUTHOR.email)
    const head = await git('rev-parse', '--short', 'HEAD')
    log(`at ${ref} (${head})`)
    if (!existsSync(join(where.repo, 'scripts/paper/sync.mjs'))) throw new Error(`${ref} has no scripts/paper yet: the Paper sync must be merged to main before the daily job can run`)

    const lockHash = createHash('sha256').update(readFileSync(join(where.repo, 'package-lock.json'))).digest('hex')
    if (state.lockHash !== lockHash || !existsSync(join(where.repo, 'node_modules'))) {
      log('installing packages (package-lock.json changed)')
      const installed = await step(tools.npm, ['ci', '--no-audit', '--no-fund'])
      if (installed.code !== 0) throw new Error('npm ci failed')
      state = { ...state, lockHash }
      saveState()
    }

    // 2. Paper: a closed app is not a failure
    const { connect } = await import(pathToFileURL(join(where.repo, 'scripts/paper/client.mjs')).href)
    const { openQuillFile, readState } = await import(pathToFileURL(join(where.repo, 'scripts/paper/file.mjs')).href)
    try {
      const paper = await connect()
      await openQuillFile(paper, { state: readState(join(where.repo, 'paper/sync-state.json')) })
    } catch (error) {
      const skipped = afterSkip(state)
      state = skipped.state
      saveState()
      log(`skipped: ${error.code === 'not-open' ? 'Paper is not open' : error.message} (${skipped.skips} run${skipped.skips === 1 ? '' : 's'} in a row)`)
      if (skipped.alarm) {
        log(`ATTENTION: the daily Paper check has not been able to run for ${SKIPS_BEFORE_ALARM} runs in a row. Open Paper, or turn the job off:  npm run paper:schedule -- uninstall`)
        await notify(`The daily Paper check has not run for ${SKIPS_BEFORE_ALARM} days: Paper was closed each time.`)
      }
      return { status: 'skipped', skips: skipped.skips }
    }
    state = { ...state, consecutiveSkips: 0 }
    saveState()

    // 3. what needs doing (read from files in the job's copy)
    const plan = await step(tools.node, ['scripts/paper/sync.mjs', '--dry-run'])
    const queued = plan.output.match(/pieces?: (.+)$/m)?.[1].split(', ').map((slug) => slug.trim()) ?? []
    const { statusOf, inventory } = await import(pathToFileURL(join(where.repo, 'scripts/paper/pieces.mjs')).href)
    const before = statusOf(readState(join(where.repo, 'paper/sync-state.json')), inventory())
    const reasons = Object.fromEntries(before.filter((entry) => queued.includes(entry.slug)).map((entry) => [entry.slug, entry.status === 'stale' ? `code changed since ${entry.syncedAt}` : entry.status === 'pending' ? 'new: not drawn before' : `failed last time: ${entry.reason ?? ''}`]))

    if (dryRun) {
      log('')
      log(`would re-draw ${queued.length} piece${queued.length === 1 ? '' : 's'}${queued.length ? `: ${queued.join(', ')}` : ''}`)
      log('would build a static Storybook in the job\'s copy, run paper:sync, then paper:check')
      log(queued.length ? `would commit paper/ to ${BRANCH}, push it with --force-with-lease, and open or update the pull request "${PR_TITLE}" with this body:` : 'if the check then found a regression, the pull request body would be:')
      log('')
      for (const line of prBody({ synced: queued, reasons, summary: '_(a dry run does not write to Paper, so the check has not run; its summary goes here)_', date: new Date().toISOString().slice(0, 10) }).split('\n')) log(`    ${line}`)
      return { status: 'dry-run', queued }
    }

    // a static Storybook, built in the job's copy and served from this process for both steps
    log('building Storybook')
    const built = await step(tools.npm, ['run', 'build-storybook', '--', '-o', '.paper/sb', '--quiet'])
    if (built.code !== 0) throw new Error('the Storybook build failed')
    const { serveStatic } = await import(pathToFileURL(join(where.repo, 'scripts/paper/storybook.mjs')).href)
    serving = await serveStatic(join(where.repo, '.paper/sb'))
    const storybookEnv = { PAPER_STORYBOOK_URL: serving.base }

    const synced = await step(tools.node, ['scripts/paper/sync.mjs'], storybookEnv)
    const failed = synced.output.match(/^failed: (.+?) \(/m)?.[1].split(', ') ?? []
    const checked = await step(tools.node, ['scripts/paper/check.mjs'], storybookEnv)
    const summary = checked.output.slice(Math.max(0, checked.output.indexOf('## Paper ↔ Storybook check')))
    const regressions = Number(summary.match(/· (\d+) regressions?/)?.[1] ?? 0)

    // 4. the record, and nothing but the record
    const changed = changedPaths(await git('status', '--porcelain'))
    const guard = onlyPaper(changed)
    if (!guard.ok) throw new Error(`the run changed files outside paper/, so nothing was committed: ${guard.outside.slice(0, 10).join(', ')}`)
    const body = prBody({ synced: queued.filter((slug) => !failed.includes(slug)), failed, reasons, summary, regressions, date: new Date().toISOString().slice(0, 10) })
    if (!changed.length) {
      log(regressions ? `${regressions} regression(s), and no change to the record: nothing to commit` : 'in step: nothing to commit')
      if (regressions) await notify(`Paper differs from Storybook in ${regressions} place${regressions === 1 ? '' : 's'}. See the log.`)
      return { status: regressions ? 'regressions' : 'in-step', regressions }
    }
    await git('checkout', '--quiet', '-B', BRANCH)
    await git('add', '--', 'paper')
    await git('commit', '--quiet', '-m', `${PR_TITLE}\n\n${queued.length} piece${queued.length === 1 ? '' : 's'} re-drawn in Paper${regressions ? `; ${regressions} regression${regressions === 1 ? '' : 's'} reported` : ''}.`)
    await git('push', '--quiet', '--force-with-lease', 'origin', BRANCH)
    const gh = async (...args) => (await run(tools.gh, args, { cwd: where.repo, env: childEnv })).stdout.trim()
    const bodyFile = join(where.home, 'pr-body.md')
    writeFileSync(bodyFile, body)
    const open = await gh('pr', 'list', '--head', BRANCH, '--state', 'open', '--json', 'number', '--jq', '.[0].number')
    const url = open ? (await gh('pr', 'edit', open, '--body-file', bodyFile), `#${open} (updated)`) : await gh('pr', 'create', '--base', 'main', '--head', BRANCH, '--title', PR_TITLE, '--body-file', bodyFile)
    log(`pull request: ${url}`)
    return { status: 'pushed', url, regressions }
  } catch (error) {
    log(`FAILED: ${error.message}`)
    return { status: 'failed', error: error.message }
  } finally {
    clearTimeout(timer)
    serving?.close()
    rmSync(where.lock, { force: true })
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await daily({ dryRun: process.argv.includes('--dry-run') })
  // a closed Paper is a normal day; only a broken run is a failure
  process.exit(result.status === 'failed' ? 1 : 0)
}
