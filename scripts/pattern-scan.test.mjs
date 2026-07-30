import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { STOCK_COMPONENTS, STRUCTURAL_STOPWORDS } from './pattern-scan-vocab.mjs'
import {
  normalizeName,
  nameTokens,
  classifyComponent,
  clusterCandidates,
  buildReport,
  readComponents,
  hasQuillMarker,
  readDecided,
  quillItemNames,
  quillTargetPaths,
} from './pattern-scan.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// --- Task 1: vocabulary ---

test('stock component vocabulary is well-formed', () => {
  assert.ok(STOCK_COMPONENTS.length >= 40, `expected the stock catalog, saw ${STOCK_COMPONENTS.length}`)
  assert.equal(new Set(STOCK_COMPONENTS).size, STOCK_COMPONENTS.length, 'duplicate entries')
  for (const n of STOCK_COMPONENTS) {
    assert.match(n, /^[a-z0-9-]+$/, `'${n}' must be lowercase kebab-case`)
  }
  for (const expected of ['button', 'dialog', 'tooltip', 'avatar', 'dropdown-menu']) {
    assert.ok(STOCK_COMPONENTS.includes(expected), `missing known stock component '${expected}'`)
  }
})

test('structural stopwords are the generic shape words only', () => {
  for (const w of ['card', 'panel', 'view', 'row', 'list']) {
    assert.ok(STRUCTURAL_STOPWORDS.includes(w), `missing stopword '${w}'`)
  }
  // A stopword that is also a real pattern name would erase that pattern.
  for (const w of STRUCTURAL_STOPWORDS) {
    assert.ok(
      !['avatar', 'ladder', 'queue', 'roster', 'feed'].includes(w),
      `'${w}' is too meaningful to be a stopword`,
    )
  }
})

// --- Task 2: normalisation ---

test('normalizeName collapses naming styles to one key', () => {
  assert.equal(normalizeName('AgentAvatar.tsx'), 'agent-avatar')
  assert.equal(normalizeName('agent-avatar.tsx'), 'agent-avatar')
  assert.equal(normalizeName('agent_avatar.tsx'), 'agent-avatar')
  assert.equal(normalizeName('components/deck/agent-avatar.tsx'), 'agent-avatar')
  assert.equal(normalizeName('OpsCharts.tsx'), 'ops-charts')
  // Consecutive capitals are one word, not one letter each.
  assert.equal(normalizeName('QAReviewer.tsx'), 'qa-reviewer')
})

test('nameTokens keeps distinctive words and drops shape words', () => {
  assert.deepEqual(nameTokens('AgentAvatar.tsx'), ['agent', 'avatar'])
  assert.deepEqual(nameTokens('QueueCard.tsx'), ['queue'])
  assert.deepEqual(nameTokens('crew-rail.tsx'), ['crew', 'rail'])
  // All-stopword names yield nothing, so they can never cluster with anything.
  assert.deepEqual(nameTokens('ListItem.tsx'), [])
})

// --- Task 3: classification ---

const QUILL = ['activity-feed', 'empty-state', 'page-header', 'theme-selector', 'login', 'tone-badge']

test('classifyComponent sorts into the three buckets', () => {
  // Quill already ships it → findability problem, not a gap.
  assert.equal(classifyComponent('ActivityFeed.tsx', QUILL), 'quill-duplicate')
  assert.equal(classifyComponent('empty-state.tsx', QUILL), 'quill-duplicate')
  // Installed off-the-shelf, not hand-built.
  assert.equal(classifyComponent('ui/button.tsx', QUILL), 'stock')
  assert.equal(classifyComponent('DropdownMenu.tsx', QUILL), 'stock')
  // Neither → possible candidate.
  assert.equal(classifyComponent('AutonomyLadder.tsx', QUILL), 'candidate')
  assert.equal(classifyComponent('deck/crew-rail.tsx', QUILL), 'candidate')
})

test('a Quill name wins over a stock name', () => {
  // tone-badge is a Quill registry:ui item AND 'badge' is stock. The Quill match
  // must win, or Quill's own components look like off-the-shelf ones.
  assert.equal(classifyComponent('tone-badge.tsx', QUILL), 'quill-duplicate')
})

const TARGETS = ['components/ui/tone-badge.tsx', 'components/quill/empty-state.tsx']

test('a file at its declared Quill target is installed, not rebuilt', () => {
  // The first real run reported Craftwell's correctly-installed ui/tone-badge.tsx
  // as something it had rebuilt. That is a weekly false alarm, and the registry's
  // own declared targets are what rule it out.
  assert.equal(classifyComponent('components/ui/tone-badge.tsx', QUILL, TARGETS), 'installed')
  assert.equal(classifyComponent('components/quill/empty-state.tsx', QUILL, TARGETS), 'installed')
  // An app rooted at src/ resolves to the same target.
  assert.equal(classifyComponent('src/components/ui/tone-badge.tsx', QUILL, TARGETS), 'installed')
  // The same name ANYWHERE else is a genuine rebuild.
  assert.equal(classifyComponent('components/EmptyState.tsx', QUILL, TARGETS), 'quill-duplicate')
  assert.equal(classifyComponent('components/app/tone-badge.tsx', QUILL, TARGETS), 'quill-duplicate')
})

test('quillTargetPaths reads the registry, and only component files', () => {
  const targets = quillTargetPaths({
    items: [
      { name: 'quill', type: 'registry:base', files: [{ path: 'registry/themes/quill.css' }] },
      { name: 'icon', type: 'registry:ui', files: [
        { path: 'src/components/ui/icon.tsx', target: 'components/ui/icon.tsx' },
        { path: 'src/components/ui/icons.core.mjs', target: 'components/ui/icons.core.mjs' },
      ] },
    ],
  })
  assert.deepEqual(targets, ['components/ui/icon.tsx'], 'only .tsx/.jsx targets, and never the theme')
})

test('generic shape words added after the first run do not cluster', () => {
  // `app` clustered app-shell with AppBar; `button` clustered SignOutButton with
  // google-button. Both were noise, and `app` put app-shell in two clusters.
  assert.deepEqual(nameTokens('AppBar.tsx'), [])
  assert.deepEqual(nameTokens('SignOutButton.tsx'), ['sign', 'out'])
  assert.deepEqual(nameTokens('app-shell.tsx'), ['shell'])
})

// --- Task 4: clustering ---

const c = (path, lines = 10, imports = []) => ({ path, name: path, lines, imports })

test('a pattern in only one app is never a candidate', () => {
  const { confirmed, possible } = clusterCandidates({
    'command-deck': [c('deck/daily-brief.tsx')],
  })
  assert.deepEqual(confirmed, [])
  assert.deepEqual(possible, [])
})

test('the same name in two apps is a confirmed repeat', () => {
  const { confirmed } = clusterCandidates({
    'command-deck': [c('deck/autonomy-ladder.tsx', 44)],
    'craftwell-cc': [c('AutonomyLadder.tsx', 78)],
  })
  assert.equal(confirmed.length, 1)
  assert.equal(confirmed[0].key, 'autonomy-ladder')
  assert.deepEqual(confirmed[0].apps.sort(), ['command-deck', 'craftwell-cc'])
  assert.deepEqual(confirmed[0].members.map((m) => m.lines).sort((a, b) => a - b), [44, 78])
})

test('different names sharing a distinctive word are a possible repeat', () => {
  const { confirmed, possible } = clusterCandidates({
    'command-deck': [c('deck/crew-rail.tsx')],
    'craftwell-cc': [c('CrewMap.tsx')],
  })
  assert.deepEqual(confirmed, [])
  assert.equal(possible.length, 1)
  assert.equal(possible[0].key, 'crew')
})

test('two unrelated components sharing only a shape word do not cluster', () => {
  const { confirmed, possible } = clusterCandidates({
    'command-deck': [c('approval-card.tsx')],
    'craftwell-cc': [c('WeatherCard.tsx')],
  })
  assert.deepEqual(confirmed, [])
  assert.deepEqual(possible, [], 'card is a stopword and must not cluster these')
})

test('a name repeated inside ONE app does not reach the threshold', () => {
  // Two files, same normalised name, same app — that is one app, not two.
  const { confirmed } = clusterCandidates({
    'command-deck': [c('a/agent-avatar.tsx'), c('b/AgentAvatar.tsx')],
  })
  assert.deepEqual(confirmed, [])
})

test('a confirmed repeat is not also reported as possible', () => {
  const { confirmed, possible } = clusterCandidates({
    'command-deck': [c('agent-avatar.tsx')],
    'craftwell-cc': [c('AgentAvatar.tsx')],
  })
  assert.equal(confirmed.length, 1)
  assert.equal(possible.length, 0, 'the same finding must not appear in both tiers')
})

// --- Task 5: the report ---

const BASE = {
  apps: [{ name: 'command-deck', marker: 'app/quill-theme.css' }],
  clusters: { confirmed: [], possible: [] },
  duplicates: [],
  decided: [],
  unreadable: [],
}

test('the report names every app scanned and how it was identified', () => {
  const r = buildReport(BASE)
  assert.match(r, /command-deck/)
  assert.match(r, /app\/quill-theme\.css/)
})

test('a week with nothing new still says so in one line', () => {
  const r = buildReport(BASE)
  assert.match(r, /No new candidates/i, 'silence is indistinguishable from a broken scan')
})

test('a confirmed candidate shows its evidence side by side', () => {
  const r = buildReport({
    ...BASE,
    clusters: {
      confirmed: [{
        key: 'agent-avatar',
        apps: ['command-deck', 'craftwell-cc'],
        members: [
          { app: 'command-deck', path: 'deck/agent-avatar.tsx', lines: 44, imports: ['lucide-react'] },
          { app: 'craftwell-cc', path: 'AgentAvatar.tsx', lines: 78, imports: ['next/image', 'node:fs'] },
        ],
      }],
      possible: [],
    },
  })
  assert.match(r, /agent-avatar/)
  assert.match(r, /44/)
  assert.match(r, /78/)
  assert.match(r, /lucide-react/)
  assert.match(r, /node:fs/)
})

test('a decided candidate moves to its own section and out of the fresh list', () => {
  const cluster = {
    key: 'agent-avatar',
    apps: ['a', 'b'],
    members: [
      { app: 'a', path: 'x.tsx', lines: 1, imports: [] },
      { app: 'b', path: 'y.tsx', lines: 2, imports: [] },
    ],
  }
  const r = buildReport({
    ...BASE,
    clusters: { confirmed: [cluster], possible: [] },
    decided: [{ pattern: 'agent-avatar', decision: 'declined', date: '2026-07-29', why: 'three impls share a name only' }],
  })
  assert.match(r, /Already decided/)
  assert.match(r, /three impls share a name only/)
  // It must still be visible, just not presented as fresh.
  const fresh = r.split('Already decided')[0]
  assert.doesNotMatch(fresh, /agent-avatar/, 'a decided pattern must not re-litigate as a new candidate')
})

test('rebuilt blocks name the Quill block that already covers them', () => {
  const r = buildReport({
    ...BASE,
    duplicates: [{ app: 'craftwell-cc', path: 'EmptyState.tsx', quill: 'empty-state' }],
  })
  assert.match(r, /EmptyState\.tsx/)
  assert.match(r, /empty-state/)
})

test('unreadable files are counted, never inferred by subtraction', () => {
  const r = buildReport({ ...BASE, unreadable: [{ app: 'a', path: 'weird.tsx', reason: 'EACCES' }] })
  assert.match(r, /weird\.tsx/)
  assert.match(r, /EACCES/)
})

// --- Task 6: reading an app ---

test('readComponents finds components recursively and skips tests and stories', () => {
  const dir = mkdtempSync(join(tmpdir(), 'scan-'))
  try {
    mkdirSync(join(dir, 'components/deck'), { recursive: true })
    mkdirSync(join(dir, 'node_modules/pkg'), { recursive: true })
    writeFileSync(
      join(dir, 'components/deck/agent-avatar.tsx'),
      "import { Mail } from 'lucide-react'\nimport { cn } from '@/lib/utils'\nexport const A = 1\n",
    )
    writeFileSync(join(dir, 'components/AgentAvatar.stories.tsx'), 'export default {}\n')
    writeFileSync(join(dir, 'components/AgentAvatar.test.tsx'), 'test()\n')
    writeFileSync(join(dir, 'node_modules/pkg/thing.tsx'), 'export const x = 1\n')

    const { components } = readComponents(dir)
    assert.deepEqual(components.map((x) => x.path), ['components/deck/agent-avatar.tsx'])
    assert.equal(components[0].lines, 3)
    // Local aliases say nothing about how it is built; third-party imports do.
    assert.deepEqual(components[0].imports, ['lucide-react'])
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('an app with no components directory yields nothing rather than throwing', () => {
  const dir = mkdtempSync(join(tmpdir(), 'scan-'))
  try {
    const { components, unreadable } = readComponents(dir)
    assert.deepEqual(components, [])
    assert.deepEqual(unreadable, [])
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('hasQuillMarker recognises the token layer and rejects template lineage', () => {
  // The real Quill-styled apps all carry this file.
  assert.equal(hasQuillMarker(['app/quill-theme.css', 'package.json']), 'app/quill-theme.css')
  assert.equal(hasQuillMarker(['components.json']), null)
  // retail-ds and scaffold mention Quill only because they share its script
  // lineage — no token layer, so they must never be scanned.
  assert.equal(hasQuillMarker(['scripts/build-tokens.mjs', 'scripts/drift-audit.mjs']), null)
  assert.equal(hasQuillMarker([]), null)
})

// --- Task 7: decided list and Quill's own names ---

test('a missing or empty decided list means nothing decided yet, never an error', () => {
  assert.deepEqual(readDecided('/nope/does-not-exist.json'), [])
  const dir = mkdtempSync(join(tmpdir(), 'scan-'))
  try {
    const f = join(dir, 'd.json')
    writeFileSync(f, '[]\n')
    assert.deepEqual(readDecided(f), [])
    writeFileSync(f, 'not json at all')
    assert.deepEqual(readDecided(f), [], 'unparseable is treated as empty, not fatal')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('readDecided keeps only well-formed entries', () => {
  const dir = mkdtempSync(join(tmpdir(), 'scan-'))
  try {
    const f = join(dir, 'd.json')
    writeFileSync(f, JSON.stringify([
      { pattern: 'agent-avatar', decision: 'declined', date: '2026-07-29', why: 'shares a name only' },
      { pattern: 'no-decision-field' },
      { decision: 'promoted' },
    ]))
    const got = readDecided(f)
    assert.equal(got.length, 1)
    assert.equal(got[0].pattern, 'agent-avatar')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('quillItemNames lists every registry item, blocks and components alike', () => {
  const names = quillItemNames({
    items: [
      { name: 'quill', type: 'registry:base' },
      { name: 'tone-badge', type: 'registry:ui' },
      { name: 'empty-state', type: 'registry:block' },
    ],
  })
  assert.ok(names.includes('tone-badge'))
  assert.ok(names.includes('empty-state'))
  // The theme itself is not a component and must not match one.
  assert.ok(!names.includes('quill'))
})

test('the shipped decided list is valid', () => {
  // It starts empty; this guards a hand-edit that would silently disable the file.
  const shipped = readDecided(join(root, 'scripts/pattern-scan.decided.json'))
  assert.ok(Array.isArray(shipped))
})

// --- Task 8: wiring ---

test('main is exported and the file guards its own execution', () => {
  const source = readFileSync(join(root, 'scripts/pattern-scan.mjs'), 'utf8')
  assert.match(source, /export async function main\(/)
  assert.match(
    source,
    /import\.meta\.url === `file:\/\/\$\{process\.argv\[1\]\}`/,
    'must only run main() when invoked directly, or importing it in tests runs the scan',
  )
})

test('package.json exposes the scan', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  assert.equal(pkg.scripts['pattern-scan'], 'node scripts/pattern-scan.mjs')
})

test('the read token and the write token stay separate', () => {
  // They are not interchangeable: the org PAT is Contents:read and cannot create
  // an issue; GITHUB_TOKEN can comment here but cannot read the other repos.
  // Collapsing them into one variable silently loses half the job.
  const source = readFileSync(join(root, 'scripts/pattern-scan.mjs'), 'utf8')
  assert.match(source, /const readToken = process\.env\.PATTERN_SCAN_TOKEN \|\| process\.env\.GITHUB_TOKEN/)
  assert.match(source, /const writeToken = process\.env\.GITHUB_TOKEN \|\| process\.env\.PATTERN_SCAN_TOKEN/)
  assert.match(source, /postToTrackingIssue\(report, writeToken\)/)
  assert.match(source, /discoverApps\(readToken\)/)
})

test('the workflow grants exactly the permissions the scan needs', () => {
  const wf = readFileSync(join(root, '.github/workflows/pattern-scan.yml'), 'utf8')
  assert.match(wf, /contents: read/, 'the scan never writes code')
  assert.match(wf, /issues: write/, 'needed for the tracking-issue comment')
  assert.match(wf, /PATTERN_SCAN_TOKEN/)
  assert.match(wf, /GITHUB_TOKEN/)
  assert.doesNotMatch(wf, /pull-requests: write/, 'the scan opens no PRs')
})
