/**
 * Quill cross-app pattern scan — the outward-looking half of the drift system.
 *
 * The drift audit only ever looks inward at Quill's own health. This looks at the
 * apps STYLED with Quill and reports two things nobody currently notices: a
 * pattern hand-built in two or more of them that Quill doesn't ship, and a block
 * Quill already ships that got rebuilt from scratch anyway (a findability
 * problem, not a gap).
 *
 * Read-only and deterministic — plain text matching, no AI. It reports evidence
 * and never promotes anything, because name matching genuinely cannot tell
 * whether three same-named components are one pattern: Quill's three consumer
 * apps each have an "agent avatar" and the three implementations share a name and
 * almost nothing else. Promotion stays a manual call.
 *
 * Deliberately NOT here: structural/AST comparison (needs a parser dependency for
 * a weekly report) and AI judgement (the failure mode scripts/DRIFT-AUDIT.md
 * fences off — a confident wrong answer looks exactly like a confident right one).
 *
 * Exit code: 0 with candidates and 0 with none. Non-zero ONLY when the scan
 * itself broke, so a red run here means the same thing it means everywhere else
 * in this repo — something to fix, never "there is news".
 *
 * Run locally with:
 *   PATTERN_SCAN_DIRS="../app-a,../app-b" npm run pattern-scan
 */
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync, mkdtempSync, rmSync, appendFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

import { STOCK_COMPONENTS, STRUCTURAL_STOPWORDS } from './pattern-scan-vocab.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ORG = 'craftwell-ai'
const API = 'https://api.github.com'
const MIN_APPS = 2 // The repetition rule: built independently in two apps or it isn't a pattern.

// --- Naming ---

/** Filename → one stable key, so AgentAvatar and agent-avatar are the same thing. */
export function normalizeName(filename) {
  const base = filename.split('/').pop().replace(/\.[jt]sx?$/, '')
  return base
    // Runs of capitals are one word (QAReviewer → QA|Reviewer), so acronyms
    // survive instead of shattering into single letters.
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** The distinctive words in a name — what two differently-named components can share. */
export function nameTokens(filename) {
  return normalizeName(filename)
    .split('-')
    .filter((t) => t && !STRUCTURAL_STOPWORDS.includes(t))
}

// --- Classification ---

/**
 * Which bucket a component file falls in.
 *
 * `installed` is checked first and matters most. Quill's registry declares where
 * every item lands — `components/ui/<name>.tsx` for components,
 * `components/quill/<name>.tsx` for blocks — so a file sitting AT its declared
 * target is the installed Quill item, not a rebuild of it. Without this the first
 * real run reported Craftwell's correctly-installed `ui/tone-badge.tsx` and
 * `ui/icon.tsx` as things it had rebuilt, which is precisely the weekly false
 * alarm this repo's audit design exists to avoid. Reading Quill's own declared
 * targets keeps that honest by construction rather than by a path guess.
 *
 * Quill then beats stock: `tone-badge` is a Quill item and `badge` is stock, and a
 * Quill match must win or Quill's own components read as off-the-shelf ones.
 */
export function classifyComponent(filename, quillNames, quillTargets = []) {
  const name = normalizeName(filename)
  // Suffix match so an app using a `src/` root still resolves to the same target.
  if (quillTargets.some((t) => filename === t || filename.endsWith(`/${t}`))) return 'installed'
  if (quillNames.includes(name)) return 'quill-duplicate'
  if (STOCK_COMPONENTS.includes(name)) return 'stock'
  return 'candidate'
}

// --- Clustering ---

/** Group members by a key, counting DISTINCT apps — two files in one app is still one app. */
function clusterBy(byApp, keysFor) {
  const clusters = new Map()
  for (const [app, components] of Object.entries(byApp)) {
    for (const comp of components) {
      for (const key of keysFor(comp)) {
        if (!clusters.has(key)) clusters.set(key, { key, apps: new Set(), members: [] })
        const cluster = clusters.get(key)
        cluster.apps.add(app)
        cluster.members.push({ app, path: comp.path, lines: comp.lines, imports: comp.imports })
      }
    }
  }
  return [...clusters.values()]
    .filter((c) => c.apps.size >= MIN_APPS)
    .map((c) => ({ ...c, apps: [...c.apps] }))
    .sort((a, b) => b.apps.length - a.apps.length || a.key.localeCompare(b.key))
}

/**
 * Two tiers, because the confidence genuinely differs. Confirmed = the same
 * normalised name in two or more apps. Possible = different names sharing a
 * distinctive word, which MIGHT be the same idea. A confirmed cluster's members
 * are withheld from the possible tier so one finding never appears twice.
 */
export function clusterCandidates(byApp) {
  const confirmed = clusterBy(byApp, (c) => [normalizeName(c.path)])
  const claimed = new Set(confirmed.flatMap((c) => c.members.map((m) => `${m.app}:${m.path}`)))
  const remaining = Object.fromEntries(
    Object.entries(byApp).map(([app, comps]) => [
      app,
      comps.filter((c) => !claimed.has(`${app}:${c.path}`)),
    ]),
  )
  const possible = clusterBy(remaining, (c) => nameTokens(c.path))
  return { confirmed, possible }
}

// --- Report ---

/**
 * The report. Every candidate carries its file path, line count and imports in
 * each app, because that is what lets a human judge whether there is really one
 * component there — the whole reason this scan reports instead of promoting.
 */
export function buildReport({ apps, clusters, duplicates, decided, unreadable }) {
  const out = []
  const p = (s = '') => out.push(s)
  const decidedKeys = new Set(decided.map((d) => d.pattern))
  const fresh = (list) => list.filter((c) => !decidedKeys.has(c.key))
  const freshConfirmed = fresh(clusters.confirmed)
  const freshPossible = fresh(clusters.possible)

  p('# Quill cross-app pattern scan')
  p()
  p('## Apps scanned')
  p()
  if (apps.length === 0) p('None — no repo in the organisation carries the Quill token layer.')
  for (const a of apps) p(`- \`${a.name}\` — identified by \`${a.marker}\``)
  p()

  const showCluster = (c) => {
    p(`**\`${c.key}\`** — ${c.apps.length} apps`)
    p()
    p('| App | File | Lines | Built from |')
    p('|---|---|---|---|')
    for (const m of c.members) {
      const imports = m.imports.length ? m.imports.map((i) => `\`${i}\``).join(', ') : '—'
      p(`| ${m.app} | \`${m.path}\` | ${m.lines} | ${imports} |`)
    }
    p()
  }

  p('## Candidates')
  p()
  if (freshConfirmed.length === 0 && freshPossible.length === 0) {
    p('No new candidates this week.')
    p()
  }
  if (freshConfirmed.length) {
    p('### Confirmed repeats — same name in two or more apps')
    p()
    freshConfirmed.forEach(showCluster)
  }
  if (freshPossible.length) {
    p('### Possible repeats — related names, read with more suspicion')
    p()
    freshPossible.forEach(showCluster)
  }

  if (decided.length) {
    p('## Already decided')
    p()
    p('| Pattern | Decision | When | Why |')
    p('|---|---|---|---|')
    for (const d of decided) p(`| \`${d.pattern}\` | ${d.decision} | ${d.date ?? '—'} | ${d.why ?? '—'} |`)
    p()
  }

  p('## Already in Quill but rebuilt')
  p()
  if (duplicates.length === 0) {
    p('Nothing — no app rebuilt a block Quill already ships.')
  } else {
    p('A findability problem, not a gap: the block existed.')
    p()
    p('| App | Rebuilt as | Quill already ships |')
    p('|---|---|---|')
    for (const d of duplicates) p(`| ${d.app} | \`${d.path}\` | \`${d.quill}\` |`)
  }
  p()
  // Stated in every report, because an incomplete list that looks complete is
  // worse than no list. This scan matches on names; a rebuild under a DIFFERENT
  // name is invisible to it. Real examples from the first run that it cannot see:
  // `update-feed` (Quill ships `activity-feed`), `vitals-strip` (`stat-cards`),
  // `OpsCharts` (`analytics-charts`), `auth-form` (`login`).
  p(
    '> Name matching only. A block rebuilt under a different name — `update-feed` for ' +
      '`activity-feed`, `vitals-strip` for `stat-cards` — will not appear above. ' +
      'This list is a floor, not a total.',
  )
  p()

  if (unreadable.length) {
    p("## Couldn't read")
    p()
    for (const u of unreadable) p(`- \`${u.app}/${u.path}\` — ${u.reason}`)
    p()
  }

  return out.join('\n')
}

// --- Reading an app ---

/**
 * The marker that makes an app Quill-styled. This IS the origination rule,
 * mechanised: an app without the token layer is never scanned, so nothing from
 * it can ever be suggested. It also correctly excludes repos that merely mention
 * Quill — `retail-ds` and `scaffold` carry its script lineage but no styling.
 */
const QUILL_MARKERS = ['app/quill-theme.css', 'src/app/quill-theme.css']

export function hasQuillMarker(fileList) {
  for (const m of QUILL_MARKERS) if (fileList.includes(m)) return m
  return null
}

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'build'])

function walk(dir, base, found = []) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return found
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue
      walk(join(dir, e.name), base, found)
    } else if (/\.tsx$/.test(e.name) && !/\.(test|spec|stories)\.tsx$/.test(e.name)) {
      found.push(relative(base, join(dir, e.name)))
    }
  }
  return found
}

/**
 * Every component in an app, with the evidence a human needs to judge it: how
 * long it is and what it is built from. Third-party imports only — a local `@/`
 * alias says nothing about the implementation. A file that cannot be read is
 * COUNTED, never silently dropped: "kept out" must not become "vanished".
 */
export function readComponents(appDir) {
  const components = []
  const unreadable = []
  let paths = []
  try {
    if (!statSync(join(appDir, 'components')).isDirectory()) return { components, unreadable }
    paths = walk(join(appDir, 'components'), appDir)
  } catch {
    return { components, unreadable }
  }
  for (const path of paths.sort()) {
    try {
      const source = readFileSync(join(appDir, path), 'utf8')
      const imports = [...source.matchAll(/^\s*import\s[^'"]*['"]([^'"]+)['"]/gm)]
        .map((m) => m[1])
        .filter((s) => !s.startsWith('.') && !s.startsWith('@/'))
      const lines = source.split('\n')
      components.push({
        path,
        // A trailing newline is not a line of code.
        lines: lines.length && lines[lines.length - 1] === '' ? lines.length - 1 : lines.length,
        imports: [...new Set(imports)],
      })
    } catch (err) {
      unreadable.push({ path, reason: err.code ?? String(err) })
    }
  }
  return { components, unreadable }
}

// --- Decisions and Quill's own catalog ---

/**
 * Candidates already ruled on. They move to the report's "Already decided"
 * section rather than being dropped, so the weekly report never re-litigates the
 * same patterns and never hides them either. A missing, empty or unparseable
 * file means "nothing decided yet" — this file must never be able to break the
 * scan, because the scan is the thing that would tell you it broke.
 */
export function readDecided(path) {
  let raw
  try {
    raw = readFileSync(path, 'utf8')
  } catch {
    return []
  }
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []
  return parsed.filter((d) => d && typeof d.pattern === 'string' && typeof d.decision === 'string')
}

/** Every installable Quill item name. The theme is not a component, so it is excluded. */
export function quillItemNames(registry) {
  return (registry.items ?? []).filter((i) => i.type !== 'registry:base').map((i) => i.name)
}

/**
 * Where Quill's own items install to, straight from the registry's declared
 * targets. A file at one of these paths is Quill's, not a rebuild of Quill's.
 */
export function quillTargetPaths(registry) {
  return (registry.items ?? [])
    .filter((i) => i.type !== 'registry:base')
    .flatMap((i) => (i.files ?? []).map((f) => f.target ?? f.path))
    .filter((t) => typeof t === 'string' && /\.[jt]sx$/.test(t))
}

// --- I/O shell ---

async function gh(path, token) {
  const res = await fetch(`${API}${path}`, {
    headers: {
      accept: 'application/vnd.github+json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) throw new Error(`GitHub ${res.status} on ${path}`)
  return res.json()
}

/**
 * Which repos in the org are Quill-styled. One cheap tree call per repo — no
 * clone needed to rule one out. A repo whose tree cannot be listed is skipped
 * rather than assumed clean, and quill-ds itself is never scanned.
 */
async function discoverApps(token) {
  const repos = await gh(`/orgs/${ORG}/repos?per_page=100&type=all`, token)
  const apps = []
  for (const repo of repos) {
    if (repo.name === 'quill-ds' || repo.archived) continue
    let paths = []
    try {
      const tree = await gh(
        `/repos/${ORG}/${repo.name}/git/trees/${repo.default_branch}?recursive=1`,
        token,
      )
      paths = (tree.tree ?? []).map((t) => t.path)
    } catch {
      continue
    }
    const marker = hasQuillMarker(paths)
    if (marker) apps.push({ name: repo.name, marker, cloneUrl: repo.clone_url })
  }
  return apps
}

function cloneShallow(app, token, into) {
  const dest = join(into, app.name)
  const url = token
    ? app.cloneUrl.replace('https://', `https://x-access-token:${token}@`)
    : app.cloneUrl
  execFileSync('git', ['clone', '--depth', '1', '--quiet', url, dest], { stdio: 'pipe' })
  return dest
}

/**
 * Post the report as a comment on the one long-lived tracking issue, creating it
 * if absent. A passing scheduled workflow emails nobody, so this — not the exit
 * code — is how the weekly report reaches a human. One issue with many comments
 * rather than many issues: one chronological thread, one notification stream.
 */
async function postToTrackingIssue(report, token) {
  const label = 'pattern-scan'
  const issues = await gh(`/repos/${ORG}/quill-ds/issues?labels=${label}&state=open`, token)
  let number = issues[0]?.number
  const headers = {
    accept: 'application/vnd.github+json',
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  }
  if (!number) {
    const created = await fetch(`${API}/repos/${ORG}/quill-ds/issues`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Weekly cross-app pattern scan',
        labels: [label],
        assignees: ['phillipsry'],
        body:
          'The weekly scan posts here. Assigned so every comment notifies.\n\n' +
          'Design: `docs/superpowers/specs/2026-07-29-cross-app-pattern-scan-design.md`',
      }),
    })
    if (!created.ok) throw new Error(`could not create tracking issue: ${created.status}`)
    number = (await created.json()).number
  }
  const commented = await fetch(`${API}/repos/${ORG}/quill-ds/issues/${number}/comments`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ body: report }),
  })
  if (!commented.ok) throw new Error(`could not comment on issue #${number}: ${commented.status}`)
}

export async function main() {
  // Two tokens, two jobs, and they are NOT interchangeable. Reading the other
  // repos needs a PAT that spans the org (Contents: read) — which cannot create
  // an issue. Commenting on the tracking issue is a write to THIS repo, which the
  // workflow's own GITHUB_TOKEN covers — and which cannot read the other repos.
  // Collapsing them into one variable meant whichever was set lost half the job.
  const readToken = process.env.PATTERN_SCAN_TOKEN || process.env.GITHUB_TOKEN
  const writeToken = process.env.GITHUB_TOKEN || process.env.PATTERN_SCAN_TOKEN
  const localDirs = (process.env.PATTERN_SCAN_DIRS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const registry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8'))
  const quillNames = quillItemNames(registry)
  const quillTargets = quillTargetPaths(registry)
  const decided = readDecided(join(root, 'scripts/pattern-scan.decided.json'))

  let apps = []
  let tmp = null
  try {
    if (localDirs.length) {
      apps = localDirs.map((dir) => ({
        name: dir.split('/').filter(Boolean).pop(),
        dir,
        marker: 'local path',
      }))
    } else {
      if (!readToken) throw new Error('no PATTERN_SCAN_TOKEN — cannot list the organisation')
      tmp = mkdtempSync(join(tmpdir(), 'pattern-scan-'))
      for (const app of await discoverApps(readToken)) {
        apps.push({ ...app, dir: cloneShallow(app, readToken, tmp) })
      }
    }

    const byApp = {}
    const duplicates = []
    const unreadable = []
    for (const app of apps) {
      const { components, unreadable: bad } = readComponents(app.dir)
      byApp[app.name] = []
      for (const comp of components) {
        const bucket = classifyComponent(comp.path, quillNames, quillTargets)
        if (bucket === 'quill-duplicate') {
          duplicates.push({ app: app.name, path: comp.path, quill: normalizeName(comp.path) })
        } else if (bucket === 'candidate') {
          byApp[app.name].push(comp)
        }
      }
      for (const b of bad) unreadable.push({ app: app.name, ...b })
    }

    const report = buildReport({
      apps: apps.map((a) => ({ name: a.name, marker: a.marker })),
      clusters: clusterCandidates(byApp),
      duplicates,
      decided,
      unreadable,
    })

    console.log(report)
    if (process.env.GITHUB_STEP_SUMMARY) {
      try {
        appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + '\n')
      } catch {
        /* best-effort */
      }
    }
    // Only post from CI. A local run prints and stops — it must never notify.
    if (process.env.GITHUB_ACTIONS && writeToken) await postToTrackingIssue(report, writeToken)
  } catch (err) {
    // Non-zero means the scan is broken, never "there is news".
    console.error(`pattern scan failed: ${err.message}`)
    process.exitCode = 1
  } finally {
    if (tmp) rmSync(tmp, { recursive: true, force: true })
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main()
