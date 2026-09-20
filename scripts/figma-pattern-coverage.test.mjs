import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { loadState, checkPatterns } from './figma-drift.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// Does every block have a declared Figma status?
//
// The block folder grew to 51 while Figma held pattern pages for 23 of them,
// and nothing said so: the daily parity bot watches atoms, and the only record
// of the pattern pages was a build log. `patterns` in figma/sync-state.json is
// now the record. A block is `mirrored` (page + frame ids the daily check reads
// live), `missing` (not built yet — visible, never silent) or `declined` with
// the reason written down.

const blocks = readdirSync(join(root, 'registry/blocks'))
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => f.replace(/\.tsx$/, ''))
const { patterns, templates = [] } = loadState()
const examples = readdirSync(join(root, 'registry/examples'))
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => f.replace(/\.tsx$/, ''))

test('every block has exactly one entry in the pattern map', () => {
  const names = patterns.map((p) => p.block)
  assert.deepEqual(
    [...names].sort(),
    [...blocks].sort(),
    'figma/sync-state.json `patterns` does not match registry/blocks — add an entry for each new block (mirrored, missing or declined) and drop entries for deleted ones.',
  )
})

test('every template (registry/examples) has exactly one entry in the template map', () => {
  assert.deepEqual(
    [...templates.map((t) => t.block)].sort(),
    [...examples].sort(),
    'figma/sync-state.json `templates` does not match registry/examples — one entry per example page (mirrored, missing or declined).',
  )
})

test('a mirrored entry names its page and frame; every other entry says why', () => {
  for (const p of [...patterns, ...templates]) {
    if (p.status === 'mirrored') {
      assert.ok(p.page?.startsWith('❖ '), `${p.block}: a mirrored entry names its ❖ page`)
      assert.match(p.pageId ?? '', /^\d+:\d+$/, `${p.block}: a mirrored entry carries the page id`)
      assert.match(p.frameId ?? '', /^\d+:\d+$/, `${p.block}: a mirrored entry carries the pattern frame id`)
    } else {
      assert.ok(['missing', 'declined'].includes(p.status), `${p.block}: status must be mirrored, missing or declined (got ${p.status})`)
      assert.ok(p.reason?.trim(), `${p.block}: a ${p.status} entry needs a reason`)
    }
  }
})

test('no two blocks claim the same Figma page', () => {
  const ids = [...patterns, ...templates].filter((p) => p.status === 'mirrored').map((p) => p.pageId)
  assert.equal(new Set(ids).size, ids.length, 'duplicate pageId in the pattern map')
})

// The live half: given the map and a REST nodes response fetched at depth 1
// (page node + its direct children), what has moved?

const map = [
  { block: 'login', status: 'mirrored', page: '❖ Login', pageId: '103:2', frameId: '103:3' },
  { block: 'hero', status: 'missing', reason: 'not built yet' },
  { block: 'alerts', status: 'declined', reason: 'a single ❖ Alert instance on a page' },
]
const page = (name = '❖ Login', children = [{ id: '103:3', name: 'Login', type: 'FRAME' }]) => ({
  '103:2': { document: { id: '103:2', name, type: 'CANVAS', children } },
})

test('a mirrored page whose frame is still there is in sync, the rest are counted not checked', () => {
  const result = checkPatterns(map, page())
  assert.deepEqual(result.problems, [])
  assert.deepEqual(result.inSync, ['login'])
  assert.deepEqual(result.skipped, { missing: 1, declined: 1 })
})

test('a deleted page is reported by block and page name', () => {
  const { problems, inSync } = checkPatterns(map, { '103:2': null })
  assert.deepEqual(inSync, [])
  assert.equal(problems.length, 1)
  assert.match(problems[0], /login/)
  assert.match(problems[0], /❖ Login/)
  assert.match(problems[0], /not found/)
})

test('a renamed page is reported with its new name', () => {
  const { problems } = checkPatterns(map, page('❖ Sign in'))
  assert.equal(problems.length, 1)
  assert.match(problems[0], /renamed/)
  assert.match(problems[0], /❖ Sign in/)
})

test('a page that lost its pattern frame is reported', () => {
  const { problems } = checkPatterns(map, page('❖ Login', []))
  assert.equal(problems.length, 1)
  assert.match(problems[0], /frame 103:3/)
})
