import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { afterSkip, AUTHOR, BRANCH, changedPaths, KEEP_LOGS, logsToRemove, onlyPaper, paths, prBody, PR_TITLE, resolveTools, SKIPS_BEFORE_ALARM } from './daily.mjs'
import { agentPath, fillTemplate, installPlan, LABEL, parseTime, TEMPLATE } from './schedule.mjs'

// The daily job's decisions, without git, gh, launchd or Paper.

test('the job may commit the record and nothing else', () => {
  const porcelain = ' M paper/sync-state.json\n?? paper/visual-baseline.json\n'
  assert.deepEqual(changedPaths(porcelain), ['paper/sync-state.json', 'paper/visual-baseline.json'])
  assert.deepEqual(onlyPaper(changedPaths(porcelain)), { ok: true, outside: [] })
  // a generator that rewrote something, a rename out of paper/, a look-alike folder
  const stray = onlyPaper(changedPaths(' M paper/sync-state.json\n M public/llms.txt\nR  paper/a.json -> docs/a.json\n?? paperwork/x\n M "scripts/paper/sync.mjs"\n'))
  assert.equal(stray.ok, false)
  assert.deepEqual(stray.outside, ['public/llms.txt', 'docs/a.json', 'paperwork/x', 'scripts/paper/sync.mjs'])
  assert.deepEqual(onlyPaper([]), { ok: true, outside: [] })
})

test('a closed Paper is counted; the seventh skip in a row raises the alarm, once', () => {
  let state = {}
  const alarms = []
  for (let run = 1; run <= 9; run++) { const next = afterSkip(state); state = next.state; if (next.alarm) alarms.push(run) }
  assert.deepEqual(alarms, [SKIPS_BEFORE_ALARM])
  assert.equal(state.consecutiveSkips, 9)
})

test('log rotation keeps the newest fourteen and never touches other files', () => {
  const names = Array.from({ length: 16 }, (_, day) => `2026-10-${String(day + 1).padStart(2, '0')}_093000.log`)
  assert.deepEqual(logsToRemove([...names, 'launchd.out.log', 'notes.txt']), ['2026-10-01_093000.log', '2026-10-02_093000.log'])
  assert.deepEqual(logsToRemove(names.slice(0, KEEP_LOGS)), [])
})

test('the pull request body says what was re-drawn and why, and what a regression means', () => {
  const body = prBody({ synced: ['button', 'faq'], failed: ['hero'], reasons: { button: 'code changed since 2026-10-07', faq: 'new: not drawn before' }, summary: '## Paper ↔ Storybook check: 310 stories in 125 pieces · 1 regression', regressions: 1, date: '2026-10-08' })
  assert.match(body, /### Re-drawn in Paper \(2\)/)
  assert.match(body, /- `button`: code changed since 2026-10-07/)
  assert.match(body, /- `faq`: new: not drawn before/)
  assert.match(body, /### Could not be drawn \(1\)/)
  assert.match(body, /\*\*1 regression\*\*/)
  assert.match(body, /only changes files under `paper\/`/)
  assert.match(prBody({ summary: 'ok', date: '2026-10-08' }), /Nothing needed re-drawing\.[\s\S]*No regressions\./)
})

test('the job is named, branched and signed as the repo\'s other bots are: no AI co-author, no real address', () => {
  assert.equal(BRANCH, 'auto/paper-sync')
  assert.equal(PR_TITLE, 'chore(paper): daily sync')
  assert.match(AUTHOR.email, /@users\.noreply\.github\.com$/)
  const source = readFileSync(new URL('./daily.mjs', import.meta.url), 'utf8')
  assert.equal(/Co-Authored-By/i.test(source), false)
  assert.equal(/gh', 'pr', 'merge|pr merge|push.*origin', 'main/.test(source), false, 'it never merges and never pushes to main')
})

test('paths and tools come from the environment, with the documented defaults', () => {
  const where = paths({ QUILL_PAPER_HOME: '/tmp/job', QUILL_PAPER_LOGS: '/tmp/logs' })
  assert.deepEqual([where.repo, where.state, where.lock, where.tools, where.logs], ['/tmp/job/repo', '/tmp/job/state.json', '/tmp/job/run.lock', '/tmp/job/tools.json', '/tmp/logs'])
  assert.match(paths({}).home, /Library\/Application Support\/quill-paper-sync$/)
  assert.match(paths({}).logs, /Library\/Logs\/quill-paper-sync$/)
  const { tools, PATH } = resolveTools('/nonexistent/tools.json', { PATH: '' })
  assert.equal(tools.node, process.execPath, 'node is the one running this')
  assert.ok(PATH.split(':').includes('/usr/bin'))
})

test('the launchd template fills completely, escapes its values and refuses a missing one', () => {
  const template = readFileSync(TEMPLATE, 'utf8')
  const values = { LABEL, NODE: '/usr/local/bin/node', SCRIPT: '/Users/r&d/job/repo/scripts/paper/daily.mjs', WORKDIR: '/Users/r&d/job/repo', PATH: '/usr/local/bin:/usr/bin', HOME: '/Users/r&d', JOB_HOME: '/Users/r&d/job', HOUR: 9, MINUTE: 30, LOG_DIR: '/Users/r&d/Library/Logs/quill-paper-sync' }
  const plist = fillTemplate(template, values)
  assert.equal(/\{\{\w+\}\}/.test(plist), false)
  assert.equal(plist.includes('<!--'), false, 'the note about being a template stays in the template')
  assert.match(plist, /<string>\/Users\/r&amp;d\/job\/repo\/scripts\/paper\/daily\.mjs<\/string>/)
  assert.match(plist, /<key>Hour<\/key>\s*<integer>9<\/integer>\s*<key>Minute<\/key>\s*<integer>30<\/integer>/)
  assert.match(plist, /<key>RunAtLoad<\/key>\s*<false\/>/)
  assert.match(plist, /launchd\.out\.log/)
  assert.throws(() => fillTemplate(template, { ...values, NODE: undefined }), /no value for \{\{NODE\}\}/)
  assert.throws(() => fillTemplate('<a>{{NEW_SLOT}}</a>', values), /no value for \{\{NEW_SLOT\}\}/)
})

test('the install plan points the agent at the job\'s own copy, never the working checkout', () => {
  const plan = installPlan({ at: '7:05', env: { QUILL_PAPER_HOME: '/tmp/job', QUILL_PAPER_LOGS: '/tmp/logs', PATH: process.env.PATH }, home: '/Users/someone' })
  assert.equal(plan.values.SCRIPT, '/tmp/job/repo/scripts/paper/daily.mjs')
  assert.equal(plan.values.WORKDIR, '/tmp/job/repo')
  assert.equal(plan.at, '07:05')
  assert.equal(plan.agent, '/Users/someone/Library/LaunchAgents/com.craftwell.quill-paper-sync.plist')
  assert.equal(agentPath('/Users/x'), `/Users/x/Library/LaunchAgents/${LABEL}.plist`)
  assert.match(plan.values.NODE, /^\//, 'an absolute path: launchd has no PATH to search')
})

test('a schedule time is a 24-hour HH:MM or it is refused', () => {
  assert.deepEqual(parseTime('09:30'), { hour: 9, minute: 30 })
  assert.deepEqual(parseTime(), { hour: 9, minute: 30 })
  for (const bad of ['24:00', '9', '09:60', 'noon', '9:5']) assert.throws(() => parseTime(bad), /24-hour time/)
})
