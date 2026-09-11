import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { readRegistryItems, planSync, applyPlan, checkVerdict, syncApps, staleness, run } from './library-sync.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// --- Reading the released registry ---

test('readRegistryItems returns every indexed item with writable files', () => {
  const items = readRegistryItems(root)
  const index = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8'))
  assert.equal(items.length, index.items.length, 'one built item per indexed item')
  for (const item of items) {
    assert.ok(item.name, 'item has a name')
    for (const f of item.files ?? []) {
      assert.equal(typeof f.target, 'string', `${item.name}: file has a target`)
      assert.equal(typeof f.content, 'string', `${item.name}: file carries content`)
    }
  }
})

// The sync's write surface, pinned. Downstream, craftwell-command-center's
// qa-review gate exempts `quill-sync/*` PRs only when every changed file is
// one of these (scripts/qaReviewCheck.ts, SYNC_PATHS). A new non-block target
// here therefore means the next sync PR there is refused — fail-closed by
// design, but silently so. This test makes the upstream change loud: add the
// new target to this list AND to the downstream SYNC_PATHS, in that order.
test('non-block registry targets are exactly the five the downstream gate knows', () => {
  const items = readRegistryItems(root)
  const targets = new Set()
  for (const item of items) for (const f of item.files ?? []) targets.add(f.target)
  const nonBlock = [...targets].filter((t) => !t.startsWith('components/quill/')).sort()
  assert.deepEqual(nonBlock, [
    'app/quill-theme.css',
    'components/ui/icon.tsx',
    'components/ui/icons.core.d.mts',
    'components/ui/icons.core.mjs',
    'components/ui/tone-badge.tsx',
  ])
})

// --- Planning ---

const ITEMS = [
  {
    name: 'icon',
    files: [
      { target: 'components/ui/icon.tsx', content: 'ICON' },
      { target: 'components/ui/icons.core.mjs', content: 'CORE' },
    ],
  },
  {
    name: 'quill',
    dependencies: ['some-pkg'],
    files: [{ target: 'app/quill-theme.css', content: 'THEME' }],
  },
  {
    name: 'login',
    files: [{ target: 'components/quill/login.tsx', content: 'LOGIN' }],
  },
]

test('planSync updates only installed items, at their plain-root paths', () => {
  const plan = planSync(ITEMS, ['components/ui/icon.tsx', 'components/ui/icons.core.mjs', 'app/quill-theme.css'])
  assert.deepEqual(plan.itemNames, ['icon', 'quill'])
  assert.deepEqual(
    plan.writes.map((w) => w.path),
    ['components/ui/icon.tsx', 'components/ui/icons.core.mjs', 'app/quill-theme.css'],
  )
  assert.deepEqual(plan.npmDeps, ['some-pkg'], 'npm deps collected from installed items only')
})

test('planSync follows a src/ root when that is where the app installed', () => {
  const plan = planSync(ITEMS, ['src/components/ui/icon.tsx', 'src/app/quill-theme.css'])
  assert.deepEqual(
    plan.writes.map((w) => w.path),
    // icons.core.mjs is missing in the app: a new file of an installed item
    // still arrives, following the root its sibling already uses.
    ['src/components/ui/icon.tsx', 'src/components/ui/icons.core.mjs', 'src/app/quill-theme.css'],
  )
})

test('planSync leaves an app with no Quill items entirely alone', () => {
  const plan = planSync(ITEMS, ['pages/index.tsx', 'README.md'])
  assert.deepEqual(plan.writes, [])
  assert.deepEqual(plan.itemNames, [])
})

// --- Applying ---

test('applyPlan writes changed files, skips identical ones, and dry-run touches nothing', () => {
  const dir = mkdtempSync(join(tmpdir(), 'library-sync-test-'))
  try {
    mkdirSync(join(dir, 'components/ui'), { recursive: true })
    writeFileSync(join(dir, 'components/ui/icon.tsx'), 'OLD')
    writeFileSync(join(dir, 'components/ui/icons.core.mjs'), 'CORE') // already current

    const writes = [
      { path: 'components/ui/icon.tsx', content: 'NEW' },
      { path: 'components/ui/icons.core.mjs', content: 'CORE' },
      { path: 'components/ui/brand-new.tsx', content: 'FRESH' },
    ]

    const dry = applyPlan(dir, writes, { dryRun: true })
    assert.deepEqual(dry, ['components/ui/icon.tsx', 'components/ui/brand-new.tsx'])
    assert.equal(readFileSync(join(dir, 'components/ui/icon.tsx'), 'utf8'), 'OLD', 'dry run leaves files untouched')
    assert.ok(!existsSync(join(dir, 'components/ui/brand-new.tsx')), 'dry run creates nothing')

    const changed = applyPlan(dir, writes)
    assert.deepEqual(changed, ['components/ui/icon.tsx', 'components/ui/brand-new.tsx'])
    assert.equal(readFileSync(join(dir, 'components/ui/icon.tsx'), 'utf8'), 'NEW')
    assert.equal(readFileSync(join(dir, 'components/ui/brand-new.tsx'), 'utf8'), 'FRESH')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

// --- Merge verdicts ---

test('checkVerdict: the four outcomes', () => {
  assert.equal(checkVerdict([]), 'none', 'no checks at all is green-by-absence, not pending')
  assert.equal(checkVerdict(null), 'none')
  assert.equal(
    checkVerdict([{ conclusion: 'SUCCESS' }, { state: 'SUCCESS' }, { conclusion: 'SKIPPED' }]),
    'pass',
  )
  assert.equal(checkVerdict([{ conclusion: 'SUCCESS' }, { status: 'IN_PROGRESS' }]), 'pending')
  assert.equal(checkVerdict([{ state: 'PENDING' }]), 'pending')
  assert.equal(
    checkVerdict([{ conclusion: 'SUCCESS' }, { conclusion: 'FAILURE' }]),
    'fail',
    'one red check blocks regardless of the rest',
  )
  assert.equal(checkVerdict([{ state: 'ERROR' }]), 'fail')
})

// The regression that cost 16 days of releases: the per-app body sat bare inside
// the outer try, so the first throw unwound the whole loop. LIBRARY_SYNC_TOKEN
// lost Checks: read, app #1 threw, and apps #2-4 were never attempted — while
// the summary still said "4 Quill-styled repos examined".
test('syncApps: one app failing does not stop the others', async () => {
  const attempted = []
  const said = []
  const apps = [{ name: 'alpha' }, { name: 'bravo' }, { name: 'charlie' }, { name: 'delta' }]
  const failed = await syncApps(
    apps,
    async (app) => {
      attempted.push(app.name)
      if (app.name === 'alpha') throw new Error('cannot read check status\nstderr: stale info')
      if (app.name === 'charlie') throw new Error('clone refused')
    },
    (line) => said.push(line),
  )
  assert.deepEqual(
    attempted,
    ['alpha', 'bravo', 'charlie', 'delta'],
    'every app must be attempted even when an earlier one throws',
  )
  assert.deepEqual(failed, ['alpha', 'charlie'])
  // The WHOLE message, newlines collapsed. Truncating to line 1 threw away the
  // stderr run() captures, which is exactly how a "stale info" push rejection
  // got reported as a bare "Command failed: git … push" with no reason.
  assert.ok(said.some((l) => l.includes('alpha') && l.includes('SYNC FAILED: cannot read check status')))
  assert.ok(
    said.some((l) => l.includes('stderr: stale info')),
    'the reason lives in stderr on later lines — it must survive into the summary',
  )
  assert.ok(said.some((l) => l.includes('cannot read check status · stderr: stale info')))
})

test('syncApps: an all-clean run reports no failures', async () => {
  const failed = await syncApps([{ name: 'alpha' }, { name: 'bravo' }], async () => {})
  assert.deepEqual(failed, [], 'a clean run must not fabricate failures')
})

test('syncApps: a non-Error throw is still recorded, not swallowed', async () => {
  const failed = await syncApps([{ name: 'alpha' }], async () => {
    throw 'a bare string'
  })
  assert.deepEqual(failed, ['alpha'])
})

// run() used to throw execFileSync's bare message — the command line and nothing
// else — so "push rejected: stale info" and "push rejected: permission denied"
// were indistinguishable in the per-app summary. That cost a debugging cycle on
// 2026-09-09, when a force-with-lease rejection read as a credentials problem.
test('run() attaches stderr to the thrown error', () => {
  let msg = ''
  try {
    // `git -C <missing dir> status` fails and writes the reason to stderr.
    run('git', ['-C', join(tmpdir(), 'library-sync-does-not-exist-' + Date.now()), 'status'])
  } catch (err) {
    msg = String(err.message)
  }
  assert.ok(msg, 'expected the command to fail')
  assert.ok(
    /cannot change to|No such file|not a git repository/i.test(msg),
    `error message should carry git's stderr, got: ${msg}`,
  )
})

// --- Staleness: how far behind an app is, read from its own sync PRs ---

const pr = (v, merged) => ({ head: { ref: `quill-sync/v${v}` }, merged_at: merged ? '2026-01-01' : null })

test('an app that merged the previous release is not behind', () => {
  const { lastMerged, missed } = staleness([pr('0.9.9', false), pr('0.9.8', true)], '0.9.9')
  assert.equal(lastMerged, '0.9.8')
  assert.deepEqual(missed, [])
})

test('the release being delivered right now never counts as missed', () => {
  // Otherwise every run would report itself behind before the PR could merge.
  const { missed } = staleness([pr('0.9.9', false)], '0.9.9')
  assert.deepEqual(missed, [])
})

test('one skipped release stays quiet; two is the pattern worth shouting about', () => {
  const one = staleness([pr('0.9.9', false), pr('0.9.8', false), pr('0.9.7', true)], '0.9.9')
  assert.deepEqual(one.missed, ['0.9.8'])

  // The real tech-careers case: six delivered, none taken.
  const many = staleness(
    ['0.9.4', '0.9.3', '0.9.2', '0.9.1', '0.9.0', '0.8.30'].map((v) => pr(v, false)).concat(pr('0.8.29', true)),
    '0.9.4',
  )
  assert.equal(many.lastMerged, '0.8.29')
  assert.deepEqual(many.missed, ['0.9.3', '0.9.2', '0.9.1', '0.9.0', '0.8.30'])
})

test('an app that has never merged a sync is reported, not crashed on', () => {
  const { lastMerged, missed } = staleness([pr('0.9.9', false), pr('0.9.8', false)], '0.9.9')
  assert.equal(lastMerged, null)
  assert.deepEqual(missed, ['0.9.8'])
})

test('unrelated pull requests in the app are ignored', () => {
  const noise = [{ head: { ref: 'feature/whatever' }, merged_at: null }, { head: {}, merged_at: null }]
  const { lastMerged, missed } = staleness([...noise, pr('0.9.8', true)], '0.9.9')
  assert.equal(lastMerged, '0.9.8')
  assert.deepEqual(missed, [])
})
