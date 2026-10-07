/**
 * `npm run paper:schedule -- install | uninstall | status`: turn the daily Paper check
 * on or off on this Mac.
 *
 * `install` writes a launchd agent (macOS's per-user scheduler) that runs the daily job
 * at a fixed local time, and records where node, npm, gh and git are, because launchd
 * starts a job without your shell profile and would not find them. It prints exactly what
 * it will write and where, and does nothing without --yes.
 *
 *   npm run paper:schedule -- install [--at 09:30] [--yes]
 *   npm run paper:schedule -- uninstall [--yes]
 *   npm run paper:schedule -- status
 */
import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir, userInfo } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { promisify } from 'node:util'
import { paths, resolveTools, SOURCE_REPO, validateCloneTarget } from './daily.mjs'

const run = promisify(execFile)
const here = dirname(fileURLToPath(import.meta.url))
export const LABEL = 'com.craftwell.quill-paper-sync'
export const TEMPLATE = join(here, 'schedule', `${LABEL}.plist.template`)
export const agentPath = (home = homedir()) => join(home, 'Library/LaunchAgents', `${LABEL}.plist`)

const xml = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** `09:30` → `{ hour: 9, minute: 30 }`; anything else is refused rather than guessed. */
export function parseTime(text = '09:30') {
  const match = String(text).match(/^(\d{1,2}):(\d{2})$/)
  const [hour, minute] = match ? [Number(match[1]), Number(match[2])] : [NaN, NaN]
  if (!(hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59)) throw new Error(`--at wants a 24-hour time like 09:30 (got ${text})`)
  return { hour, minute }
}

/** Fill the template's `{{SLOTS}}`. Every slot must be given and every value is XML-escaped; a leftover slot is an error. */
export function fillTemplate(template, values) {
  // the template's own comment explains the template; the installed file should not carry it
  const filled = template.replace(/<!--[\s\S]*?-->\n/g, '').replace(/\{\{(\w+)\}\}/g, (slot, name) => {
    if (values[name] === undefined || values[name] === null || values[name] === '') throw new Error(`no value for ${slot}`)
    return xml(values[name])
  })
  return filled
}

/** Everything `install` will write, worked out without writing it. */
export function installPlan({ at = '09:30', env = process.env, home = homedir() } = {}) {
  const where = paths(env)
  const { tools, missing, PATH } = resolveTools('/nonexistent', env)
  const { hour, minute } = parseTime(at)
  const values = { LABEL, NODE: tools.node, SCRIPT: join(where.repo, 'scripts/paper/daily.mjs'), WORKDIR: where.repo, PATH, HOME: home, JOB_HOME: where.home, HOUR: hour, MINUTE: minute, LOG_DIR: where.logs }
  return { where, tools, missing, values, plist: fillTemplate(readFileSync(TEMPLATE, 'utf8'), values), agent: agentPath(home), at: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` }
}

const domain = () => `gui/${userInfo().uid}`
/** Unload the agent and wait until launchd has really let go of it: loading again while it is still going fails. */
async function unload() {
  if (!(await loaded())) return
  await run('/bin/launchctl', ['bootout', `${domain()}/${LABEL}`]).catch(() => {})
  for (let attempt = 0; attempt < 50 && (await loaded()); attempt++) await new Promise((resolve) => setTimeout(resolve, 200))
  if (await loaded()) throw new Error('launchd did not unload the agent within 10 seconds: try again in a moment')
}
const loaded = async () => { try { return (await run('/bin/launchctl', ['print', `${domain()}/${LABEL}`])).stdout } catch { return null } }

async function main(args) {
  const command = args.find((arg) => !arg.startsWith('--') && !/^\d{1,2}:\d{2}$/.test(arg))
  const yes = args.includes('--yes')
  const at = args.includes('--at') ? args[args.indexOf('--at') + 1] : '09:30'
  if (command === 'status') {
    const plan = installPlan({ at })
    const state = existsSync(plan.where.state) ? JSON.parse(readFileSync(plan.where.state, 'utf8')) : {}
    const print = await loaded()
    console.log(`agent file   ${existsSync(plan.agent) ? plan.agent : 'not installed'}`)
    console.log(`loaded       ${print ? 'yes' : 'no'}${print ? ` (last exit code ${print.match(/last exit code = (\S+)/)?.[1] ?? 'n/a'})` : ''}`)
    console.log(`job's copy   ${existsSync(join(plan.where.repo, '.git')) ? plan.where.repo : 'not cloned yet (the first run clones it)'}`)
    console.log(`logs         ${plan.where.logs}`)
    console.log(`skipped runs ${state.consecutiveSkips ?? 0} in a row (Paper closed)`)
    return 0
  }
  if (command === 'install') {
    const plan = installPlan({ at })
    if (plan.missing.length) { console.error(`cannot find ${plan.missing.join(', ')} on this machine: install them first`); return 1 }
    const remote = process.env.QUILL_PAPER_REMOTE || (await run(plan.tools.git, ['-C', join(here, '../..'), 'remote', 'get-url', 'origin'])).stdout.trim()
    console.log(`This will:\n\n1. write the tool locations to ${plan.where.tools}:\n${JSON.stringify(plan.tools, null, 2)}\n\n2. write the launchd agent to ${plan.agent} (runs daily at ${plan.at}, local time):\n\n${plan.plist}\n3. ${existsSync(join(plan.where.repo, '.git')) ? `use the job's existing copy of the repository in ${plan.where.repo}` : `clone ${remote} into ${plan.where.repo} (the job's own copy; the agent runs the script from there, never from this checkout)`}\n\n4. load the agent:  launchctl bootstrap ${domain()} ${plan.agent}\n\nLogs go to ${plan.where.logs}.\nIt needs the Paper Sync scripts to be on origin/main, and the Mac to be on with Paper open at ${plan.at}.`)
    if (!yes) { console.log('\nNothing was written. Run again with --yes to do it.'); return 0 }
    mkdirSync(plan.where.home, { recursive: true })
    mkdirSync(plan.where.logs, { recursive: true })
    mkdirSync(dirname(plan.agent), { recursive: true })
    writeFileSync(plan.where.tools, JSON.stringify(plan.tools, null, 2) + '\n')
    if (!existsSync(join(plan.where.repo, '.git'))) {
      const target = validateCloneTarget({ repo: plan.where.repo, sourceRepo: SOURCE_REPO, exists: existsSync(plan.where.repo) })
      if (!target.ok) throw new Error(target.reason)
      await run(plan.tools.git, ['clone', '--quiet', remote, plan.where.repo])
      // the marker is what later lets the job prove this folder is its own before it resets it
      writeFileSync(plan.where.marker, JSON.stringify({ repo: plan.where.repo, remote, createdAt: new Date().toISOString() }, null, 2) + '\n')
    }
    if (!existsSync(plan.values.SCRIPT)) console.log(`\nNote: ${plan.values.SCRIPT} does not exist yet: the Paper sync is not on origin/main. The agent will fail until it is merged and the job's copy is updated (git -C "${plan.where.repo}" pull).`)
    await unload()
    // only launchd's own complaints land here (the job logs to dated files); start it empty each install
    writeFileSync(join(plan.where.logs, 'launchd.err.log'), '')
    writeFileSync(plan.agent, plan.plist)
    await run('/bin/launchctl', ['bootstrap', domain(), plan.agent])
    console.log(`\nInstalled and loaded. Run it once now:  launchctl kickstart ${domain()}/${LABEL}   (or  npm run paper:daily)`)
    return 0
  }
  if (command === 'uninstall') {
    const agent = agentPath()
    console.log(`This will unload the agent (launchctl bootout ${domain()}/${LABEL}) and delete ${agent}.\nThe job's copy of the repository and its logs are left in place.`)
    if (!yes) { console.log('\nNothing was changed. Run again with --yes to do it.'); return 0 }
    await unload()
    rmSync(agent, { force: true })
    console.log('\nUninstalled.')
    return 0
  }
  console.error('usage: npm run paper:schedule -- install [--at 09:30] [--yes] | uninstall [--yes] | status')
  return 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { process.exit(await main(process.argv.slice(2))) } catch (error) { console.error(error.message); process.exit(1) }
}
