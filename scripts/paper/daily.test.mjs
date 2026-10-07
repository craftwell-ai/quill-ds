import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import http from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterSkip, AUTHOR, BRANCH, changedPaths, foreignAuthors, judgeRun, KEEP_LOGS, logsToRemove, MAIN, notifyOnce, onlyPaper, paths, prBody, PR_TITLE, publicText, readSummary, repoChanges, repoSlug, resolveTools, SKIPS_BEFORE_ALARM, validateCloneTarget, validateJobFolder } from './daily.mjs'
import { publicText as recordText, removeArtboard, ensureArtboard } from './file.mjs'
import { agentPath, fillTemplate, installPlan, LABEL, parseTime, TEMPLATE } from './schedule.mjs'
import { serveStatic } from './storybook.mjs'

// The daily job's decisions, without gh, launchd or Paper. git is used for real, in a throwaway repository.

test('changed paths are read from NUL-separated status, so a leading space is never lost', () => {
  // ` M` (unstaged) starts with a space: the plain format, trimmed, turned paper/… into aper/…
  assert.deepEqual(changedPaths(' M paper/sync-state.json\0?? paper/visual-baseline.json\0'), ['paper/sync-state.json', 'paper/visual-baseline.json'])
  // a rename carries the path it came from as a second field: both count
  assert.deepEqual(changedPaths('R  docs/a.json\0paper/a.json\0 M paper/b.json\0'), ['docs/a.json', 'paper/a.json', 'paper/b.json'])
  assert.deepEqual(changedPaths(''), [])
  assert.deepEqual(onlyPaper(['paper/sync-state.json', 'paper/visual-baseline.json']), { ok: true, outside: [] })
  assert.deepEqual(onlyPaper(['paper/x.json', 'public/llms.txt', 'paperwork/x', 'scripts/paper/sync.mjs']).outside, ['public/llms.txt', 'paperwork/x', 'scripts/paper/sync.mjs'])
})

test('against a real repository: modified, added, untracked, renamed, and a file outside paper/', async () => {
  const repo = mkdtempSync(join(tmpdir(), 'quill-paper-guard-'))
  const git = (...args) => execFileSync('git', ['-C', repo, ...args], { stdio: 'pipe' })
  try {
    git('init', '--quiet')
    git('config', 'user.email', 'test@example.com')
    git('config', 'user.name', 'test')
    mkdirSync(join(repo, 'paper'))
    mkdirSync(join(repo, 'src'))
    for (const [file, text] of [['paper/sync-state.json', '{}\n'], ['paper/old name.json', '{"a":1}\n'], ['src/button.tsx', 'export {}\n']]) writeFileSync(join(repo, file), text)
    git('add', '.')
    git('commit', '--quiet', '-m', 'start')
    assert.deepEqual(await repoChanges(repo), [], 'a clean tree has no changes')

    writeFileSync(join(repo, 'paper/sync-state.json'), '{"changed":true}\n') // modified, unstaged: the ` M` case
    assert.deepEqual(await repoChanges(repo), ['paper/sync-state.json'], 'the first path keeps its first letter')
    assert.equal(onlyPaper(await repoChanges(repo)).ok, true)

    writeFileSync(join(repo, 'paper/visual-baseline.json'), '{}\n') // untracked
    writeFileSync(join(repo, 'paper/added.json'), '{}\n')
    git('add', 'paper/added.json') // added, staged
    renameSync(join(repo, 'paper/old name.json'), join(repo, 'paper/new name.json'))
    git('add', '-A', 'paper') // a staged rename, with a space in the name
    const inside = await repoChanges(repo)
    assert.deepEqual([...inside].sort(), ['paper/added.json', 'paper/new name.json', 'paper/old name.json', 'paper/sync-state.json', 'paper/visual-baseline.json'])
    assert.deepEqual(onlyPaper(inside), { ok: true, outside: [] })

    writeFileSync(join(repo, 'src/button.tsx'), 'export const changed = 1\n') // the thing the guard exists for
    writeFileSync(join(repo, 'paperwork.txt'), 'looks like paper\n')
    const guard = onlyPaper(await repoChanges(repo))
    assert.equal(guard.ok, false)
    assert.deepEqual([...guard.outside].sort(), ['paperwork.txt', 'src/button.tsx'])
  } finally {
    rmSync(repo, { recursive: true, force: true })
  }
})

test('a closed Paper is counted; the seventh skip in a row raises the alarm, once', () => {
  let state = {}
  const alarms = []
  for (let run = 1; run <= 9; run++) { const next = afterSkip(state); state = next.state; if (next.alarm) alarms.push(run) }
  assert.deepEqual(alarms, [SKIPS_BEFORE_ALARM])
  assert.equal(state.consecutiveSkips, 9)
})

test('a notification is sent once per distinct message per day', () => {
  const first = notifyOnce({}, 'The daily Paper check FAILED: npm ci failed', '2026-10-08')
  assert.equal(first.send, true)
  assert.equal(notifyOnce(first.state, 'The daily Paper check FAILED: npm ci failed', '2026-10-08').send, false, 'the same failure, later the same day')
  assert.equal(notifyOnce(first.state, 'The daily Paper check FAILED: paper:check exited 2', '2026-10-08').send, true, 'a different failure')
  assert.equal(notifyOnce(first.state, 'The daily Paper check FAILED: npm ci failed', '2026-10-09').send, true, 'the same failure, the next day')
})

test('a step that crashes makes a FAILED run; a regression or an undrawable piece is a finding', () => {
  const sync = { ok: true, queue: ['button'], failed: [], removed: [] }
  const check = { ok: true, regressions: [], errors: [], markdown: '## Paper ↔ Storybook check' }
  assert.equal(judgeRun({ syncCode: 0, syncSummary: sync, checkCode: 0, checkSummary: check }).failed, null)
  // the reviewer's case: both scripts throw (no browser for a new Playwright), nothing is written, the record is unchanged
  assert.match(judgeRun({ syncCode: 1, syncSummary: null, checkCode: null, checkSummary: null }).failed, /paper:sync did not finish \(exit 1, no summary written\)/)
  assert.match(judgeRun({ syncCode: 0, syncSummary: sync, checkCode: 1, checkSummary: null }).failed, /paper:check did not finish/)
  assert.match(judgeRun({ syncCode: 2, syncSummary: sync, checkCode: 0, checkSummary: check }).failed, /paper:sync exited 2/)
  assert.match(judgeRun({ syncCode: 0, syncSummary: sync, checkCode: 1, checkSummary: check }).failed, /paper:check exited 1/, 'exit 1 with nothing to show for it is a crash')
  // findings: reported, the record still goes up
  const drawn = judgeRun({ syncCode: 1, syncSummary: { ...sync, failed: ['hero'] }, checkCode: 1, checkSummary: { ...check, regressions: [{ piece: 'button', story: 'Default', reasons: ['picture 14%'] }] } })
  assert.deepEqual([drawn.failed, drawn.drawFailures, drawn.regressions.length], [null, ['hero'], 1])
  // a summary is only believed when it parses and says ok: raw output is never taken for one
  assert.equal(readSummary('x', () => 'Error: browserType.launch: Executable does not exist at /Users/someone/Library/Caches/ms-playwright'), null)
  assert.equal(readSummary('x', () => '{"ok":false}'), null)
  assert.equal(readSummary('x', () => { throw new Error('ENOENT') }), null)
  assert.deepEqual(readSummary('x', () => '{"ok":true,"queue":[]}'), { ok: true, queue: [] })
})

test('the job folder is proven to be the job\'s own before anything is reset', () => {
  const good = { repo: '/Users/x/Library/Application Support/quill-paper-sync/repo', marker: { repo: '/Users/x/Library/Application Support/quill-paper-sync/repo', remote: 'https://github.com/craftwell-ai/quill-ds.git' }, origin: 'https://github.com/craftwell-ai/quill-ds', expectedRemote: 'https://github.com/craftwell-ai/quill-ds.git', sourceRepo: '/Users/x/projects/quill-ds' }
  assert.deepEqual(validateJobFolder(good), { ok: true })
  assert.match(validateJobFolder({ ...good, repo: 'relative/repo', marker: { repo: 'relative/repo' } }).reason, /absolute path/)
  assert.match(validateJobFolder({ ...good, marker: null }).reason, /was not created by this job/)
  assert.match(validateJobFolder({ ...good, marker: { repo: '/somewhere/else' } }).reason, /was not created by this job/)
  assert.match(validateJobFolder({ ...good, origin: 'https://github.com/someone/fork.git' }).reason, /origin is .* not the expected/)
  // QUILL_PAPER_HOME pointed at the working checkout's parent, the checkout itself, or a folder inside it
  const at = (repo) => validateJobFolder({ ...good, repo, marker: { repo } })
  assert.match(at('/Users/x/projects/quill-ds/tmp/repo').reason, /overlaps the repository this script runs from/)
  assert.match(at('/Users/x/projects').reason, /overlaps/)
  // launchd runs the script from inside the job's own marked clone: that is the one overlap that is the point
  assert.deepEqual(validateJobFolder({ ...good, sourceRepo: good.repo }), { ok: true })
  assert.match(validateJobFolder({ ...good, sourceRepo: good.repo, marker: null }).reason, /was not created by this job/, 'the working checkout itself, unmarked, is refused')
  // a first clone: never into or around the working checkout, never onto a folder that already exists
  assert.deepEqual(validateCloneTarget({ repo: good.repo, sourceRepo: good.sourceRepo, exists: false }), { ok: true })
  assert.match(validateCloneTarget({ repo: good.repo, sourceRepo: good.sourceRepo, exists: true }).reason, /already exists/)
  assert.match(validateCloneTarget({ repo: '/Users/x/projects/quill-ds/repo', sourceRepo: good.sourceRepo, exists: false }).reason, /overlaps/)
  assert.match(validateCloneTarget({ repo: 'repo', sourceRepo: good.sourceRepo, exists: false }).reason, /absolute/)
})

test('a commit on the job\'s branch that the job did not make stops the push', () => {
  assert.deepEqual(foreignAuthors([AUTHOR.email, AUTHOR.email, '']), [])
  assert.deepEqual(foreignAuthors([AUTHOR.email, 'someone@example.com', 'someone@example.com']), ['someone@example.com'])
  assert.equal(repoSlug('https://github.com/craftwell-ai/quill-ds.git'), 'craftwell-ai/quill-ds')
  assert.equal(repoSlug('git@github.com:craftwell-ai/quill-ds.git'), 'craftwell-ai/quill-ds')
  assert.equal(repoSlug('/tmp/some/local/clone'), null, 'not GitHub: the job cannot prove it may push, so it does not')
})

test('log rotation keeps the newest fourteen and never touches other files', () => {
  const names = Array.from({ length: 16 }, (_, day) => `2026-10-${String(day + 1).padStart(2, '0')}_093000.log`)
  assert.deepEqual(logsToRemove([...names, 'launchd.err.log', 'notes.txt']), ['2026-10-01_093000.log', '2026-10-02_093000.log'])
  assert.deepEqual(logsToRemove(names.slice(0, KEEP_LOGS)), [])
})

test('nothing that can reach a public pull request or the committed record names the user or their home folder', () => {
  const home = '/Users/someone'
  assert.equal(publicText('Executable does not exist at /Users/someone/Library/Caches/ms-playwright/chromium', home), 'Executable does not exist at ~/Library/Caches/ms-playwright/chromium')
  assert.equal(publicText('at file:///Users/another/x.mjs and /home/ci/y', home), 'at file://~/x.mjs and ~/y')
  assert.equal(recordText('page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:6150\n    at openStory (/Users/someone/projects/quill-ds/scripts/paper/convert.mjs:1108:14)', { home }), 'page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:6150', 'one line: never a stack')
  assert.equal(recordText('cannot read /Users/someone/Downloads/x.png', { home }), 'cannot read ~/Downloads/x.png')
  const body = prBody({ synced: ['button'], failed: ['hero'], removed: ['old-card'], reasons: { button: 'code changed since 2026-10-07' }, summary: `## Paper ↔ Storybook check: 310 stories in 125 pieces · 1 regression\nstrip: ${process.env.HOME}/x.png`, regressions: 1, date: '2026-10-08' })
  assert.equal(body.includes(process.env.HOME), false)
  assert.match(body, /on the maintainer's Mac/)
  assert.match(body, /### Re-drawn in Paper \(1\)\n\n- `button`: code changed since 2026-10-07/)
  assert.match(body, /### Removed from Paper \(1\)/)
  assert.match(body, /### Could not be drawn \(1\)/)
  assert.match(body, /\*\*1 regression\*\*/)
  assert.match(body, /only changes files under `paper\/`/)
  assert.match(body, /rewritten from `main` on every run\. Do not commit to it by hand/)
  assert.match(prBody({ summary: 'ok', date: '2026-10-08' }), /Nothing needed re-drawing\.[\s\S]*No regressions\./)
})

test('the job is named, branched and signed as the repo\'s other bots are; it only ever pushes from main', () => {
  assert.equal(BRANCH, 'auto/paper-sync')
  assert.equal(MAIN, 'origin/main')
  assert.equal(PR_TITLE, 'chore(paper): daily sync')
  assert.match(AUTHOR.email, /@users\.noreply\.github\.com$/)
  const source = readFileSync(new URL('./daily.mjs', import.meta.url), 'utf8')
  assert.equal(/Co-Authored-By/i.test(source), false)
  assert.equal(/'pr', 'merge'|pr merge|'push'[^\n]*'main'/.test(source), false, 'it never merges and never pushes to main')
  assert.match(source, /const pushAllowed = !noPush && ref === MAIN/, 'a test ref can never push')
  assert.equal(/\.stdout\.trim\(\)\)?\s*\)?;?\s*\n?.*changedPaths/.test(source), false)
  assert.equal(/status', '--porcelain'\]/.test(source), false, 'status is always read with -z')
})

test('paths and tools come from the environment, with the documented defaults', () => {
  const where = paths({ QUILL_PAPER_HOME: '/tmp/job', QUILL_PAPER_LOGS: '/tmp/logs' })
  assert.deepEqual([where.repo, where.marker, where.state, where.lock, where.tools, where.logs], ['/tmp/job/repo', '/tmp/job/clone.json', '/tmp/job/state.json', '/tmp/job/run.lock', '/tmp/job/tools.json', '/tmp/logs'])
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
  assert.equal(plist.includes('<!--'), false, 'the notes about being a template stay in the template')
  assert.match(plist, /<string>\/Users\/r&amp;d\/job\/repo\/scripts\/paper\/daily\.mjs<\/string>/)
  assert.match(plist, /<key>Hour<\/key>\s*<integer>9<\/integer>\s*<key>Minute<\/key>\s*<integer>30<\/integer>/)
  assert.match(plist, /<key>RunAtLoad<\/key>\s*<false\/>/)
  assert.match(plist, /<key>StandardOutPath<\/key>\s*<string>\/dev\/null<\/string>/, 'no second, unrotated copy of the job\'s log')
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

test('the static Storybook server answers a malformed address with 400 and stays up', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'quill-paper-static-'))
  writeFileSync(join(dir, 'index.json'), '{"entries":{}}')
  const server = await serveStatic(dir)
  const status = (path) => new Promise((resolve, reject) => { http.get(`${server.base}${path}`, (response) => { response.resume(); resolve(response.statusCode) }).on('error', reject) })
  try {
    assert.equal(await status('/%E0%A4%A'), 400)
    assert.equal(await status('/index.json'), 200, 'still serving after the bad request')
    assert.equal(await status('/../../etc/passwd'), 404)
  } finally {
    server.close()
    rmSync(dir, { recursive: true, force: true })
  }
})

// ------------------------------------------------------------------ what the sync may touch in the Paper file

const fakeFile = (nodes, artboards = []) => {
  const calls = []
  return { calls, data: async (tool, args) => { calls.push([tool, args]); if (tool === 'get_node_info') { if (!nodes[args.nodeId]) throw new Error('Node not found'); return nodes[args.nodeId] } if (tool === 'get_basic_info') return { artboards }; if (tool === 'create_artboard') return { id: 'new-0' }; if (tool === 'get_children') return { children: [{ id: 'c-1' }] }; return {} }, call: async (tool, args) => { calls.push([tool, args]); return {} } }
}

test('a removed piece\'s artboard is deleted only when Paper still holds it under the name the script gave it', async () => {
  const kept = fakeFile({ 'a-0': { name: 'My reworked card' } })
  assert.deepEqual(await removeArtboard(kept, { artboardId: 'a-0', name: 'Old Card' }), { result: 'kept', why: 'the layer with that id is now called "My reworked card", not "Old Card"' })
  assert.equal(kept.calls.some(([tool]) => tool === 'delete_nodes'), false)
  const gone = fakeFile({})
  assert.deepEqual(await removeArtboard(gone, { artboardId: 'a-0', name: 'Old Card' }), { result: 'gone' })
  const ours = fakeFile({ 'a-0': { name: 'Old Card' } })
  assert.deepEqual(await removeArtboard(ours, { artboardId: 'a-0', name: 'Old Card' }), { result: 'deleted' })
  assert.deepEqual(ours.calls.filter(([tool]) => tool === 'delete_nodes'), [['delete_nodes', { nodeIds: ['a-0'] }]], 'that one id and nothing else')
})

test('only the recorded artboard is emptied and reused; any other artboard on the page is left alone and named', async () => {
  // a page holding the recorded artboard, a person's sketch, and a same-named one drawn from an unmerged branch
  const page = [{ id: 'b-0', name: 'Button' }, { id: 'x-1', name: 'My sketch' }, { id: 'x-2', name: 'Button' }]
  const known = fakeFile({}, page)
  const reused = await ensureArtboard(known, { pageId: 'p-1', name: 'Button', styles: {}, knownId: 'b-0' })
  assert.deepEqual([reused.id, reused.created, reused.others], ['b-0', false, ['My sketch', 'Button']])
  assert.deepEqual(known.calls.filter(([tool]) => tool === 'delete_nodes'), [['delete_nodes', { nodeIds: ['c-1'] }]], 'only the recorded artboard\'s own children')
  // nothing recorded (the daily job on main meeting a branch's drawing): a same-named artboard is NOT adopted
  const unknown = fakeFile({}, page.slice(1))
  const fresh = await ensureArtboard(unknown, { pageId: 'p-1', name: 'Button', styles: {}, knownId: null })
  assert.deepEqual([fresh.id, fresh.created, fresh.others], ['new-0', true, ['My sketch', 'Button']])
  assert.equal(unknown.calls.some(([tool]) => tool === 'delete_nodes'), false)
})
