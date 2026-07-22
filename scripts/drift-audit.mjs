/**
 * Quill drift audit — the "watch" step of the self-healing loop, kept
 * deliberately narrow and deterministic (no AI judgment, so no noise).
 *
 * Reports the time-based drift that per-PR CI can't catch: dependency freshness,
 * security advisories, and release housekeeping. Read-only — it never edits
 * anything. Run locally with `npm run drift-audit`, or weekly via the
 * drift-audit GitHub Actions workflow.
 *
 * Exit code: 0 normally; 1 only when there is an *actionable* HIGH or CRITICAL
 * security advisory — one with a real, non-major fix available. So a scheduled
 * run turns red (and notifies) on security drift we can actually act on, but
 * stays quiet for routine outdatedness and for upstream advisories whose only
 * "fix" is a breaking major we've deliberately held (weekly false alarms are
 * exactly the noise this design avoids). The invariant checks that CAN be
 * deterministic (intent tags, accent copy, generated-file sync, changelog,
 * registry file paths) live in the test suite and run on every PR instead.
 *
 * Figma↔code parity is intentionally NOT here: it needs interactive Figma MCP
 * auth a headless run doesn't have. See scripts/DRIFT-AUDIT.md for the
 * on-demand procedure.
 */
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

// npm outdated / audit exit non-zero by design; capture output regardless.
function jsonCmd(cmd) {
  try {
    return JSON.parse(execSync(cmd, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }) || '{}')
  } catch (e) {
    try {
      return JSON.parse(e.stdout?.toString() || '{}')
    } catch {
      return {}
    }
  }
}

const out = []
const p = (s = '') => out.push(s)

p('# Quill drift audit')
p()
p(`Version \`${pkg.version}\`.`)
p()

// --- Dependencies ---
const outdated = jsonCmd('npm outdated --json')
const names = Object.keys(outdated)
p('## Dependencies')
p()
if (names.length === 0) {
  p('All dependencies current.')
} else {
  const major = names.filter((n) => outdated[n].current?.split('.')[0] !== outdated[n].latest?.split('.')[0])
  p(`${names.length} package(s) behind latest (${major.length} major):`)
  p()
  for (const n of names) {
    const o = outdated[n]
    const isMajor = o.current?.split('.')[0] !== o.latest?.split('.')[0]
    p(`- \`${n}\` ${o.current} → ${o.latest}${isMajor ? ' **(major)**' : ''}`)
  }
}
p()

// --- Security ---
const audit = jsonCmd('npm audit --json')
const vulns = audit.metadata?.vulnerabilities ?? {}
const total = vulns.total ?? 0

// A high/critical advisory is *actionable* if npm offers a real fix that isn't a
// breaking major (major "fixes" are usually a nonsensical downgrade or a held
// upgrade). Only actionable advisories fail the run.
const actionable = []
const held = []
for (const [name, adv] of Object.entries(audit.vulnerabilities ?? {})) {
  if (adv.severity !== 'high' && adv.severity !== 'critical') continue
  const fix = adv.fixAvailable
  const isActionable = fix === true || (fix && typeof fix === 'object' && !fix.isSemVerMajor)
  ;(isActionable ? actionable : held).push(name)
}

p('## Security')
p()
if (total === 0) {
  p('No known advisories.')
} else {
  p(`${total} advisory/advisories: ` + ['critical', 'high', 'moderate', 'low', 'info'].filter((s) => vulns[s]).map((s) => `${vulns[s]} ${s}`).join(', ') + '.')
  if (actionable.length) p(`\n**${actionable.length} actionable high/critical (${actionable.join(', ')}) — this run fails.**`)
  if (held.length) p(`\n${held.length} high/critical with no non-major fix (${held.join(', ')}) — reported, not failing; held pending upstream.`)
}
p()

// --- Housekeeping ---
p('## Housekeeping')
p()
const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8')
const hasChangelog = changelog.includes(`## [${pkg.version}]`)
let hasTag = null
try {
  hasTag = execSync(`git tag -l v${pkg.version}`, { cwd: root, encoding: 'utf8' }).trim() === `v${pkg.version}`
} catch {
  hasTag = null // git/tags unavailable — don't assert
}
p(`- CHANGELOG entry for v${pkg.version}: ${hasChangelog ? '✓' : '✗ missing'}`)
p(`- git tag v${pkg.version}: ${hasTag === null ? '— (tags not available)' : hasTag ? '✓' : '✗ missing'}`)
p()

const report = out.join('\n')
console.log(report)

// Mirror to the GitHub Actions step summary when present.
if (process.env.GITHUB_STEP_SUMMARY) {
  try {
    execSync(`cat >> "${process.env.GITHUB_STEP_SUMMARY}"`, { input: report + '\n', stdio: ['pipe', 'ignore', 'ignore'] })
  } catch {
    /* best-effort */
  }
}

process.exit(actionable.length > 0 ? 1 : 0)
