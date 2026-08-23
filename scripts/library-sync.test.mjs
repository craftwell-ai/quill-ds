import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { readRegistryItems, planSync, applyPlan, checkVerdict } from './library-sync.mjs'

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
