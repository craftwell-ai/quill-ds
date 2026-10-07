/**
 * `npm run paper:daily`: the unattended daily Paper check, for one Mac.
 *
 * Each run, in its OWN copy of the repository (never the working checkout):
 *   1. bring that copy to origin/main
 *   2. if Paper is not open, stop quietly (and say so loudly after a week of that)
 *   3. `paper:sync` for what changed, then `paper:check`
 *   4. if the record changed, push it to the branch auto/paper-sync and open or update ONE
 *      pull request, "chore(paper): daily sync", whose body is the check's summary
 *
 * It commits only files under paper/, never merges, never pushes to main. A run that
 * breaks (a step exits non-zero, a summary is missing, the wrong GitHub account) is a
 * FAILED run: it pushes nothing and sends one macOS notification.
 *
 *   npm run paper:daily -- --dry-run     # plan only: says what a real run would re-draw. Not read-only:
 *                                        # it clones or resets the job's own copy, may install packages
 *                                        # there, and opens the Quill file as a tab in Paper
 *   npm run paper:daily -- --no-push     # the whole run for real (build, sync, check), but stop before
 *                                        # committing: print what would be pushed
 *
 * Environment (all optional):
 *   QUILL_PAPER_HOME     the job's folder        (~/Library/Application Support/quill-paper-sync)
 *   QUILL_PAPER_LOGS     where logs go           (~/Library/Logs/quill-paper-sync)
 *   QUILL_PAPER_REMOTE   what to clone           (this checkout's origin)
 * For testing only:
 *   QUILL_PAPER_REF          stand on something other than origin/main. Any other value turns --no-push on:
 *                            the job refuses to push or open a pull request from anything but main.
 *   QUILL_PAPER_TEST_BREAK   `sync` or `check`: make that step fail on purpose, to rehearse a FAILED run.
 */
import { execFile, spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { delimiter, dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

const run = promisify(execFile)
const here = dirname(fileURLToPath(import.meta.url))
/** The repository this script file sits in (the working checkout, or the job's own copy when launchd runs it). */
export const SOURCE_REPO = resolve(here, '../..')

export const BRANCH = 'auto/paper-sync'
export const MAIN = 'origin/main'
export const PR_TITLE = 'chore(paper): daily sync'
export const AUTHOR = { name: 'craftwell-ai', email: '301478407+craftwell-ai@users.noreply.github.com' }
export const SKIPS_BEFORE_ALARM = 7
export const KEEP_LOGS = 14
export const MARKER = 'clone.json'
const TIMEOUT_MS = 45 * 60 * 1000
const STALE_LOCK_MS = 2 * 60 * 60 * 1000

export const paths = (env = process.env) => {
  const home = env.QUILL_PAPER_HOME || join(homedir(), 'Library/Application Support/quill-paper-sync')
  return { home, repo: join(home, 'repo'), marker: join(home, MARKER), state: join(home, 'state.json'), lock: join(home, 'run.lock'), tools: join(home, 'tools.json'), logs: env.QUILL_PAPER_LOGS || join(homedir(), 'Library/Logs/quill-paper-sync') }
}

// ------------------------------------------------------------------ pure pieces (unit-tested)

/**
 * The paths a `git status --porcelain -z` output names. NUL-separated on purpose: the plain form starts
 * with a space for an unstaged change, which any trim would eat (and then every path loses its first letter).
 * A rename or copy record is followed by a second field, the path it came from: both count as changed.
 */
export function changedPaths(porcelainZ) {
  const fields = porcelainZ.split('\0')
  const found = []
  for (let index = 0; index < fields.length; index++) {
    const field = fields[index]
    if (field.length < 4) continue
    const status = field.slice(0, 2)
    found.push(field.slice(3))
    if (/[RC]/.test(status)) found.push(fields[++index])
  }
  return found.filter(Boolean)
}

/** Everything that differs from HEAD in a repository, by asking git itself. */
export async function repoChanges(repo, git = 'git', env = process.env) {
  // no trim anywhere: the output's exact bytes are the data
  return changedPaths((await run(git, ['-C', repo, 'status', '--porcelain', '-z', '--untracked-files=all'], { env, maxBuffer: 64 * 1024 * 1024 })).stdout)
}

/** The job may commit the record and nothing else. */
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

/** Should this notification be sent? Once per distinct message per day, so a job failing every morning does not nag hourly reruns. */
export function notifyOnce(state, message, date) {
  const key = createHash('sha256').update(message).digest('hex').slice(0, 12)
  const sent = state.notified?.date === date ? state.notified.keys : []
  if (sent.includes(key)) return { state, send: false }
  return { state: { ...state, notified: { date, keys: [...sent, key] } }, send: true }
}

/** Text that may be published (a pull request body on a public repository): no home directory, no user name. */
export function publicText(text, home = homedir()) {
  const user = home.split('/').filter(Boolean).at(-1)
  let clean = String(text ?? '').split(home).join('~').replace(/\/(?:Users|home)\/[^/\s:'"`)]+/g, '~')
  if (user) clean = clean.split(user).join('…')
  return clean
}

const sameRemote = (a, b) => String(a ?? '').replace(/\.git$/, '').replace(/\/$/, '') === String(b ?? '').replace(/\.git$/, '').replace(/\/$/, '')
const within = (parent, child) => { const path = relative(parent, child); return path === '' || (!path.startsWith('..') && !isAbsolute(path)) }

/**
 * Is this folder really the job's own disposable clone? Asked before every run, because the next commands
 * are `checkout --force`, `reset --hard` and `clean -fd`. All of these must hold:
 *   the path is absolute · the job's marker file (written when the job made the clone) names this path ·
 *   the clone's `origin` is the remote the job expects · it is not the repository this script is running
 *   from, nor inside it, nor around it (unless it IS the job's marked clone running its own copy of the script).
 */
export function validateJobFolder({ repo, marker, origin, expectedRemote, sourceRepo }) {
  if (!repo || !isAbsolute(repo)) return { ok: false, reason: `the job folder must be an absolute path (got "${repo}")` }
  if (!marker || marker.repo !== repo) return { ok: false, reason: `"${repo}" was not created by this job (its marker file is missing or names another folder): refusing to reset it. Delete the folder yourself if it is safe to, and the job will clone afresh` }
  if (!sameRemote(origin, expectedRemote)) return { ok: false, reason: `the clone's origin is "${origin}", not the expected "${expectedRemote}": refusing to reset it` }
  const selfHosted = resolve(sourceRepo) === resolve(repo)
  if (!selfHosted && (within(sourceRepo, repo) || within(repo, sourceRepo))) return { ok: false, reason: `the job folder "${repo}" overlaps the repository this script runs from ("${sourceRepo}"): refusing, a reset there would destroy work` }
  return { ok: true }
}

/** May a fresh clone be made here? (Same overlap rule; the folder must not already hold something else.) */
export function validateCloneTarget({ repo, sourceRepo, exists }) {
  if (!repo || !isAbsolute(repo)) return { ok: false, reason: `the job folder must be an absolute path (got "${repo}")` }
  if (within(sourceRepo, repo) || within(repo, sourceRepo)) return { ok: false, reason: `the job folder "${repo}" overlaps the repository this script runs from ("${sourceRepo}")` }
  if (exists) return { ok: false, reason: `"${repo}" already exists and was not created by this job: refusing to use it` }
  return { ok: true }
}

/** Commits on the job's branch that the job did not make. `--force-with-lease` would not save them: the job fetches first. */
export const foreignAuthors = (emails) => [...new Set(emails.filter((email) => email && email !== AUTHOR.email))]

/** `https://github.com/owner/name.git` or `git@github.com:owner/name.git` → `owner/name`; null for anything else (a local path). */
export const repoSlug = (remote) => String(remote ?? '').match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?\/?$/)?.[1] ?? null

/** The pull request body: what was re-drawn and why, then the check's own summary. Public text only. */
export function prBody({ synced = [], failed = [], removed = [], reasons = {}, summary = '', regressions = 0, date }) {
  const lines = [`The daily Paper check on the maintainer's Mac, ${date}. It re-drew what had changed in code and compared Paper with Storybook.`, '']
  if (synced.length) {
    lines.push(`### Re-drawn in Paper (${synced.length})`, '')
    for (const slug of synced) lines.push(`- \`${slug}\`: ${reasons[slug] ?? 'code changed'}`)
    lines.push('')
  } else lines.push('Nothing needed re-drawing.', '')
  if (removed.length) lines.push(`### Removed from Paper (${removed.length})`, '', ...removed.map((slug) => `- \`${slug}\`: its code is gone`), '')
  if (failed.length) lines.push(`### Could not be drawn (${failed.length})`, '', ...failed.map((slug) => `- \`${slug}\`: the message is in \`paper/sync-state.json\``), '')
  lines.push(publicText(summary).trim() || '_The check did not run._', '')
  lines.push(regressions ? `**${regressions} regression${regressions === 1 ? '' : 's'}** above: Paper now differs from Storybook by more than was accepted. Merging this records what was drawn; it does not accept the difference. Look at the piece in Paper, fix the cause, or accept it with \`npm run paper:check -- --accept --only <name>\`.` : 'No regressions.')
  lines.push('', 'This PR only changes files under `paper/` (the record of what is in the Paper file). Nothing here ships to apps. It is safe to merge; it is never merged automatically.')
  lines.push('', `The branch \`${BRANCH}\` is rewritten from \`main\` on every run. Do not commit to it by hand: the job stops, and says so, if it finds a commit it did not make. Until this is merged, each daily run starts from this branch's record, so it only re-draws what changed since.`)
  return lines.join('\n')
}

/** Read a JSON summary a step wrote; null when the step did not get that far (which makes the run a failure). */
export function readSummary(file, read = (path) => readFileSync(path, 'utf8')) {
  try { const parsed = JSON.parse(read(file)); return parsed?.ok === true ? parsed : null } catch { return null }
}

/** What a finished sync + check add up to. `failed` is a broken RUN (push nothing); regressions and pieces in error are findings (report them). */
export function judgeRun({ syncCode, syncSummary, checkCode, checkSummary }) {
  if (!syncSummary) return { failed: `paper:sync did not finish (exit ${syncCode}, no summary written)` }
  // sync exits 1 when a piece could not be drawn (a finding); anything else non-zero is a crash
  if (syncCode !== 0 && !(syncCode === 1 && syncSummary.failed.length)) return { failed: `paper:sync exited ${syncCode}` }
  if (!checkSummary) return { failed: `paper:check did not finish (exit ${checkCode}, no summary written)` }
  if (checkCode !== 0 && !(checkCode === 1 && (checkSummary.regressions.length || checkSummary.errors.length))) return { failed: `paper:check exited ${checkCode}` }
  return { failed: null, regressions: checkSummary.regressions, errors: checkSummary.errors, drawFailures: syncSummary.failed }
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

const readJson = (file, fallback) => { try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return fallback } }
class Stop extends Error {}

export async function daily({ dryRun = false, noPush = false, env = process.env } = {}) {
  const where = paths(env)
  const { log, file: logFile } = logger(where.logs)
  if (!takeLock(where.lock)) { log('another run is in progress: nothing done'); return { status: 'locked' } }
  const { tools, missing, PATH } = resolveTools(where.tools, env)
  const childEnv = { ...env, PATH, HOME: env.HOME ?? homedir(), CI: '' }
  const children = new Set()
  let state = readJson(where.state, {})
  const saveState = () => { mkdirSync(where.home, { recursive: true }); writeFileSync(where.state, JSON.stringify(state, null, 2) + '\n') }
  const today = new Date().toISOString().slice(0, 10)
  const sent = []
  /** One macOS notification, at most once per distinct message per day. Always logged. */
  const notify = async (message) => {
    log(`NOTIFY: ${message}`)
    sent.push(message)
    const once = notifyOnce(state, message, today)
    state = once.state
    saveState()
    if (once.send && !env.QUILL_PAPER_NO_NOTIFY) await run('/usr/bin/osascript', ['-e', `display notification ${JSON.stringify(message)} with title "Quill Paper sync"`]).catch(() => {})
  }
  const git = async (...args) => (await run(tools.git, ['-C', where.repo, ...args], { env: childEnv, maxBuffer: 64 * 1024 * 1024 })).stdout.trim()

  let aborted = null
  let serving = null
  /** Called after every step: a run that has been told to stop goes no further (no check after a killed sync, no push). */
  const alive = () => { if (aborted) throw new Stop(aborted) }
  /** A long step, streamed into the log; resolves with its exit code. Started in its own process group so it can be stopped whole. */
  const step = (command, args, extraEnv = {}) => new Promise((resolveStep) => {
    const child = spawn(command, args, { cwd: where.repo, env: { ...childEnv, ...extraEnv }, stdio: ['ignore', 'pipe', 'pipe'], detached: true })
    children.add(child)
    const take = (chunk) => { for (const line of String(chunk).split('\n')) if (line.trim()) log(`  | ${line}`) }
    child.stdout.on('data', take)
    child.stderr.on('data', take)
    child.on('close', (code, signal) => { children.delete(child); resolveStep(code ?? (signal ? 143 : 1)) })
  })
  /** Take Paper's "an agent is working here" markers off whatever was mid-write, stop children, free the lock. */
  const release = async () => {
    for (const child of children) { try { process.kill(-child.pid, 'SIGTERM') } catch { /* already gone */ } }
    try {
      const { connect } = await import(pathToFileURL(join(where.repo, 'scripts/paper/client.mjs')).href)
      const record = readJson(join(where.repo, 'paper/sync-state.json'), {})
      if (record.file?.id) await (await connect()).call('finish_working_on_nodes', { fileId: record.file.id })
    } catch { /* Paper is closed, or the clone is not there yet: nothing to release */ }
    serving?.close()
    rmSync(where.lock, { force: true })
  }
  const stop = async (why, code) => { if (aborted) return; aborted = why; log(`STOPPED: ${why}`); await release(); process.exit(code) }
  const timer = setTimeout(() => stop(`still running after ${TIMEOUT_MS / 60000} minutes`, 1), TIMEOUT_MS)
  const onSignal = (signal) => stop(`received ${signal}`, 130)
  process.once('SIGINT', onSignal)
  process.once('SIGTERM', onSignal)

  try {
    log(`quill-paper-sync${dryRun ? ' (dry run: plans only; nothing is written to Paper, nothing is pushed)' : ''} · log ${logFile}`)
    if (missing.length) throw new Error(`cannot find ${missing.join(', ')}: run  npm run paper:schedule -- install  to record where they are`)

    // 1. the job's own copy, proven to be the job's own before anything destructive
    const ref = env.QUILL_PAPER_REF || MAIN
    const pushAllowed = !noPush && ref === MAIN
    const marker = readJson(where.marker, null)
    const remote = env.QUILL_PAPER_REMOTE || marker?.remote || (await run(tools.git, ['-C', SOURCE_REPO, 'remote', 'get-url', 'origin'], { env: childEnv })).stdout.trim()
    if (!existsSync(join(where.repo, '.git'))) {
      const target = validateCloneTarget({ repo: where.repo, sourceRepo: SOURCE_REPO, exists: existsSync(where.repo) })
      if (!target.ok) throw new Error(target.reason)
      log(`first run: cloning into the job's folder`)
      mkdirSync(where.home, { recursive: true })
      await run(tools.git, ['clone', '--quiet', remote, where.repo], { env: childEnv })
      writeFileSync(where.marker, JSON.stringify({ repo: where.repo, remote, createdAt: new Date().toISOString() }, null, 2) + '\n')
    }
    const folder = validateJobFolder({ repo: where.repo, marker: readJson(where.marker, null), origin: await git('remote', 'get-url', 'origin').catch(() => null), expectedRemote: remote, sourceRepo: SOURCE_REPO })
    if (!folder.ok) throw new Error(folder.reason)
    await git('fetch', '--quiet', '--prune', 'origin')
    // a disposable copy: whatever a previous run left behind is thrown away
    await git('checkout', '--quiet', '--force', '-B', 'paper-sync-work', ref)
    await git('reset', '--quiet', '--hard', ref)
    await git('clean', '-fdq')
    await git('config', 'user.name', AUTHOR.name)
    await git('config', 'user.email', AUTHOR.email)
    log(`at ${ref} (${await git('rev-parse', '--short', 'HEAD')})${ref === MAIN ? '' : ' · not main, so this run will not push or open a pull request'}`)
    if (!existsSync(join(where.repo, 'scripts/paper/sync.mjs'))) throw new Error(`${ref} has no scripts/paper yet: the Paper sync must be merged to main before the daily job can run`)
    alive()

    const lockHash = createHash('sha256').update(readFileSync(join(where.repo, 'package-lock.json'))).digest('hex')
    if (state.lockHash !== lockHash || !existsSync(join(where.repo, 'node_modules'))) {
      log('installing packages (package-lock.json changed)')
      if ((await step(tools.npm, ['ci', '--no-audit', '--no-fund'])) !== 0) throw new Error('npm ci failed in the job\'s copy')
      alive()
      // a new Playwright needs its own browser build; without it every story fails to open
      log('installing the browser Playwright needs')
      if ((await step(tools.npm, ['exec', '--', 'playwright', 'install', 'chromium'])) !== 0) throw new Error('could not install Playwright\'s browser in the job\'s copy: run  npx playwright install chromium  there once, by hand')
      alive()
      state = { ...state, lockHash }
      saveState()
    }

    // an open pull request from an earlier run: start from its record, so only what changed since is re-drawn
    const branchExists = (await git('branch', '--remotes', '--list', `origin/${BRANCH}`)).length > 0
    if (branchExists && ref === MAIN) {
      const strangers = foreignAuthors((await git('log', '--format=%ae', `${MAIN}..origin/${BRANCH}`)).split('\n'))
      if (strangers.length) throw new Error(`the branch ${BRANCH} holds commits the job did not make (by ${strangers.join(', ')}). The job rewrites that branch on every run, so it has stopped rather than discard them. Move those commits elsewhere, or delete the branch`)
      await git('checkout', `origin/${BRANCH}`, '--', 'paper')
      log(`an unmerged ${BRANCH} exists: starting from its record`)
    }

    // 2. Paper. A closed app is a normal day; anything else that stops the file opening is a failure worth knowing about.
    const { connect } = await import(pathToFileURL(join(where.repo, 'scripts/paper/client.mjs')).href)
    const { openQuillFile, readState } = await import(pathToFileURL(join(where.repo, 'scripts/paper/file.mjs')).href)
    const recordPath = join(where.repo, 'paper/sync-state.json')
    let paper
    try {
      paper = await connect()
    } catch (error) {
      if (error.code !== 'not-open') throw error
      const skipped = afterSkip(state)
      state = skipped.state
      saveState()
      log(`skipped: Paper is not open (${skipped.skips} run${skipped.skips === 1 ? '' : 's'} in a row)`)
      if (skipped.alarm) await notify(`The daily Paper check has been skipped ${SKIPS_BEFORE_ALARM} times in a row because the Paper app was not open. Open Paper, or turn the job off: npm run paper:schedule -- uninstall`)
      return { status: 'skipped', skips: skipped.skips }
    }
    state = { ...state, consecutiveSkips: 0 }
    saveState()
    await openQuillFile(paper, { state: readState(recordPath) })
    alive()

    // 3. what needs doing, as data (never parsed from a step's prose)
    const summaries = { plan: join(where.home, 'plan.json'), sync: join(where.home, 'sync.json'), check: join(where.home, 'check.json') }
    for (const file of Object.values(summaries)) rmSync(file, { force: true })
    const planCode = await step(tools.node, ['scripts/paper/sync.mjs', '--dry-run', '--summary', summaries.plan])
    const plan = readSummary(summaries.plan)
    if (planCode !== 0 || !plan) throw new Error(`could not work out what needs syncing (exit ${planCode})`)
    alive()
    const queued = plan.queue
    const { statusOf, inventory } = await import(pathToFileURL(join(where.repo, 'scripts/paper/pieces.mjs')).href)
    const before = statusOf(readState(recordPath), inventory())
    const reasons = Object.fromEntries(before.filter((entry) => queued.includes(entry.slug)).map((entry) => [entry.slug, entry.status === 'stale' ? `code changed since ${entry.syncedAt}` : entry.status === 'pending' ? 'new, or waiting to be drawn' : 'failed last time']))

    if (dryRun) {
      log('')
      log(`would re-draw ${queued.length} piece${queued.length === 1 ? '' : 's'}${queued.length ? `: ${queued.join(', ')}` : ''}`)
      log('would build a static Storybook in the job\'s copy, run paper:sync, then paper:check')
      log(queued.length ? `would commit paper/ to ${BRANCH}, push it, and open or update the pull request "${PR_TITLE}" with this body:` : 'if the check then found a regression, it would be reported by a notification; with a changed record, the pull request body would be:')
      log('')
      for (const line of prBody({ synced: queued, reasons, summary: '_(a dry run does not write to Paper, so the check has not run; its summary goes here)_', date: today }).split('\n')) log(`    ${line}`)
      return { status: 'dry-run', queued }
    }

    // a static Storybook, built in the job's copy and served from this process for both steps
    log('building Storybook')
    if ((await step(tools.npm, ['run', 'build-storybook', '--', '-o', '.paper/sb', '--quiet'])) !== 0) throw new Error('the Storybook build failed in the job\'s copy')
    alive()
    const { serveStatic } = await import(pathToFileURL(join(where.repo, 'scripts/paper/storybook.mjs')).href)
    serving = await serveStatic(join(where.repo, '.paper/sb'))
    const storybookEnv = { PAPER_STORYBOOK_URL: serving.base }
    // building regenerates tracked files; they must come out as committed, or the record's guard below will (rightly) refuse
    await git('checkout', '--quiet', '--', '.')
    if (branchExists && ref === MAIN) await git('checkout', `origin/${BRANCH}`, '--', 'paper')

    const broken = env.QUILL_PAPER_TEST_BREAK
    const syncCode = await step(tools.node, ['scripts/paper/sync.mjs', '--summary', summaries.sync, ...(broken === 'sync' ? ['--only', 'broken-on-purpose-for-a-test'] : [])], storybookEnv)
    alive()
    const syncSummary = readSummary(summaries.sync)
    const checkCode = syncSummary ? await step(tools.node, ['scripts/paper/check.mjs', '--summary', summaries.check, ...(broken === 'check' ? ['--only', 'broken-on-purpose-for-a-test'] : [])], storybookEnv) : null
    alive()
    const verdict = judgeRun({ syncCode, syncSummary, checkCode, checkSummary: readSummary(summaries.check) })
    if (verdict.failed) throw new Error(verdict.failed)
    const regressions = verdict.regressions.length
    const regressed = [...new Set(verdict.regressions.map((entry) => entry.piece))]

    // 4. the record, and nothing but the record
    const changed = await repoChanges(where.repo, tools.git, childEnv)
    const guard = onlyPaper(changed)
    if (!guard.ok) throw new Error(`the run changed files outside paper/, so nothing was committed: ${guard.outside.slice(0, 10).join(', ')}`)
    const body = prBody({ synced: syncSummary.queue.filter((slug) => !syncSummary.failed.includes(slug)), failed: syncSummary.failed, removed: syncSummary.removed, reasons, summary: readSummary(summaries.check).markdown, regressions, date: today })
    if (regressions) await notify(`Paper differs from Storybook in ${regressed.length} piece${regressed.length === 1 ? '' : 's'}: ${regressed.slice(0, 8).join(', ')}${regressed.length > 8 ? '…' : ''}. See the pull request "${PR_TITLE}", or the log.`)
    if (!changed.length) {
      log(regressions ? `${regressions} regression(s), and no change to the record: nothing to commit` : 'in step: nothing to commit')
      return { status: regressions ? 'regressions' : 'in-step', regressions, notifications: sent }
    }
    // the same record the open pull request already holds: leave the pull request as it is
    if (branchExists && ref === MAIN && !(await run(tools.git, ['-C', where.repo, 'diff', '--quiet', `origin/${BRANCH}`, '--', 'paper'], { env: childEnv }).then(() => false, () => true))) {
      log(`the open pull request already holds this record: nothing new to push`)
      return { status: 'unchanged-pr', regressions, notifications: sent }
    }
    if (!pushAllowed) {
      log('')
      log(`would commit ${changed.length} file${changed.length === 1 ? '' : 's'} under paper/ (${changed.join(', ')}) to ${BRANCH}, push it, and open or update the pull request "${PR_TITLE}" with this body:`)
      log('')
      for (const line of body.split('\n')) log(`    ${line}`)
      return { status: 'would-push', changed, regressions, notifications: sent }
    }

    // the right GitHub account, checked before anything is pushed (this Mac has two; the wrong one gets a 403)
    const gh = async (...args) => (await run(tools.gh, args, { cwd: where.repo, env: childEnv })).stdout.trim()
    const slug = repoSlug(remote)
    const login = await gh('api', 'user', '--jq', '.login').catch(() => null)
    const canPush = slug && login ? await gh('api', `repos/${slug}`, '--jq', '.permissions.push').catch(() => 'false') : 'false'
    if (canPush !== 'true') throw new Error(`cannot push to ${slug ?? 'the remote'}: the GitHub account active in gh is "${login ?? 'none'}", which has no write access. The craftwell-ai account is needed: run  gh auth switch  yourself, then run the job again`)

    await git('checkout', '--quiet', '-B', BRANCH)
    await git('add', '--', 'paper')
    await git('commit', '--quiet', '-m', `${PR_TITLE}\n\n${syncSummary.queue.length} piece${syncSummary.queue.length === 1 ? '' : 's'} re-drawn in Paper${regressions ? `; ${regressions} regression${regressions === 1 ? '' : 's'} reported` : ''}.`)
    alive()
    await git('push', '--quiet', '--force-with-lease', 'origin', BRANCH)
    const bodyFile = join(where.home, 'pr-body.md')
    writeFileSync(bodyFile, body)
    const open = await gh('pr', 'list', '--head', BRANCH, '--state', 'open', '--json', 'number', '--jq', '.[0].number')
    const url = open ? (await gh('pr', 'edit', open, '--body-file', bodyFile), `#${open} (updated)`) : await gh('pr', 'create', '--base', 'main', '--head', BRANCH, '--title', PR_TITLE, '--body-file', bodyFile)
    log(`pull request: ${url}`)
    return { status: 'pushed', url, regressions, notifications: sent }
  } catch (error) {
    if (error instanceof Stop) return { status: 'stopped', error: error.message }
    const message = String(error.message ?? error).split('\n')[0]
    log(`FAILED: ${message}`)
    // a failed run is never silent, and never called a skip: say what failed and where the detail is
    await notify(`The daily Paper check FAILED: ${publicText(message).slice(0, 180)} Log: ${logFile.replace(homedir(), '~')}`)
    return { status: 'failed', error: message, notifications: sent }
  } finally {
    clearTimeout(timer)
    process.off('SIGINT', onSignal)
    process.off('SIGTERM', onSignal)
    serving?.close()
    rmSync(where.lock, { force: true })
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await daily({ dryRun: process.argv.includes('--dry-run'), noPush: process.argv.includes('--no-push') })
  // a closed Paper is a normal day; only a broken run is a failure
  process.exit(result.status === 'failed' ? 1 : 0)
}
