/**
 * Release plumbing for the autonomous loop, kept in one testable place rather
 * than smeared across YAML.
 *
 *   node scripts/release.mjs notes <version>
 *     Print the CHANGELOG body for a version — used as the GitHub release notes.
 *     Exits 1 if that version has no entry, so a release can never be published
 *     with empty or wrong notes.
 *
 *   node scripts/release.mjs prepare
 *     Bump the patch version and write a CHANGELOG entry built from the commit
 *     subjects since the last tag. Prints the new version. Used when changes
 *     have accumulated on main (auto-merged dependency PRs, self-heal repairs)
 *     that nobody hand-versioned — without this the version, and the footer and
 *     llms.txt that read it, silently go stale.
 *
 * Nothing here talks to GitHub; the workflow owns tagging and publishing.
 */
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const CHANGELOG = join(root, 'CHANGELOG.md')
const PKG = join(root, 'package.json')

const readPkg = () => JSON.parse(readFileSync(PKG, 'utf8'))

/** The body of one `## [x.y.z] — date` section, up to the next `## [`. */
export function changelogSection(changelog, version) {
  const start = changelog.indexOf(`## [${version}]`)
  if (start === -1) return null
  const rest = changelog.slice(start)
  const nl = rest.indexOf('\n')
  if (nl === -1) return null
  const after = rest.slice(nl + 1)
  const next = after.indexOf('\n## [')
  return (next === -1 ? after : after.slice(0, next)).trim()
}

/** 0.2.19 -> 0.2.20. Pre-1.0, so patch is the right default for accumulated changes. */
export function nextPatch(version) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(version)
  if (!m) throw new Error(`unparseable version: ${version}`)
  return `${m[1]}.${m[2]}.${Number(m[3]) + 1}`
}

/**
 * Commit subjects since `sinceRef`, minus merge commits and minus the release
 * commits this script itself produces — otherwise every release entry would
 * list the previous release.
 */
export function commitSubjects(log) {
  return log
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/^Merge (pull request|branch|remote)/.test(l))
    .filter((l) => !/^chore\(release\)/.test(l))
}

export function renderEntry(version, date, subjects) {
  const lines = [`## [${version}] — ${date}`, '', '### Changed']
  if (subjects.length === 0) {
    lines.push('- Housekeeping; no user-facing changes.')
  } else {
    // Subjects are already conventional-commit prefixed, so they read as a
    // changelog on their own.
    for (const s of subjects) lines.push(`- ${s}`)
  }
  return lines.join('\n')
}

function git(cmd, fallback = '') {
  try {
    return execSync(cmd, { cwd: root, encoding: 'utf8' }).trim()
  } catch {
    return fallback
  }
}

function cmdNotes(version) {
  if (!version) throw new Error('usage: release.mjs notes <version>')
  const section = changelogSection(readFileSync(CHANGELOG, 'utf8'), version)
  if (!section) {
    process.stderr.write(`No CHANGELOG entry for ${version}\n`)
    process.exit(1)
  }
  process.stdout.write(section + '\n')
}

function cmdPrepare() {
  const pkg = readPkg()
  const current = pkg.version
  const version = nextPatch(current)
  const subjects = commitSubjects(git(`git log v${current}..HEAD --no-merges --format=%s`))

  if (subjects.length === 0) {
    process.stderr.write(`Nothing to release since v${current}\n`)
    process.exit(2) // distinct from a real failure; the workflow treats it as "no-op"
  }

  pkg.version = version
  writeFileSync(PKG, JSON.stringify(pkg, null, 2) + '\n')

  const changelog = readFileSync(CHANGELOG, 'utf8')
  const marker = `## [${current}]`
  const at = changelog.indexOf(marker)
  if (at === -1) throw new Error(`current version ${current} missing from CHANGELOG`)
  const entry = renderEntry(version, new Date().toISOString().slice(0, 10), subjects)
  writeFileSync(CHANGELOG, changelog.slice(0, at) + entry + '\n\n' + changelog.slice(at))

  process.stdout.write(version + '\n')
}

const [cmd, arg] = process.argv.slice(2)
if (cmd === 'notes') cmdNotes(arg)
else if (cmd === 'prepare') cmdPrepare()
else if (cmd) {
  process.stderr.write(`unknown command: ${cmd}\n`)
  process.exit(1)
}
