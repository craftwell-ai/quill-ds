import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { loadState, snapshotPattern, diffPattern } from './figma-drift.mjs'
import { expectations, textsOf } from './figma-pattern-expect.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// Do the pattern pages show what the blocks render?
//
// The Figma side is figma/pattern-baseline.json (texts, icon instances,
// top-level component instances per frame, read from the file). The code side
// is rendered from registry/blocks by figma-pattern-expect.mjs. A stamped page
// must match exactly on texts and icons — this is what catches a copy change
// like 2026-09-12's, or an icon a page never had. Stale pages are skipped
// until they are rebuilt and stamped.

const baseline = JSON.parse(readFileSync(join(root, 'figma/pattern-baseline.json'), 'utf8')).frames
const state = loadState()
const stamped = state.patterns.filter((p) => p.status === 'mirrored' && p.codeHash)
const expected = await expectations(stamped.map((p) => p.block))

const count = (arr) => arr.reduce((m, s) => m.set(s, (m.get(s) || 0) + 1), new Map())
const minus = (a, b) => { const ca = count(a), cb = count(b); return [...ca].filter(([s, n]) => (cb.get(s) || 0) < n).map(([s, n]) => `${s}${n - (cb.get(s) || 0) > 1 ? ' ×' + (n - (cb.get(s) || 0)) : ''}`) }

test('every stamped pattern page renders without error', () => {
  const broken = Object.entries(expected).filter(([, e]) => e.error).map(([b, e]) => `${b}: ${e.error}`)
  assert.deepEqual(broken, [])
})

test('every stamped pattern page shows exactly the strings its block renders', () => {
  const failures = []
  for (const p of stamped) {
    const e = expected[p.block]; const f = baseline[p.block]
    if (!f) { failures.push(`${p.block}: no entry in figma/pattern-baseline.json`); continue }
    const missing = minus(e.texts, f.texts), extra = minus(f.texts, e.texts)
    if (missing.length || extra.length) failures.push(`${p.block} (${p.page}):${missing.length ? '\n    missing in Figma: ' + missing.join(' | ') : ''}${extra.length ? '\n    only in Figma:    ' + extra.join(' | ') : ''}`)
  }
  assert.deepEqual(failures, [], 'Pattern copy differs from the block:\n  ' + failures.join('\n  ') + '\nFix the page (/figma-push <block>), re-read the baseline, then re-stamp.')
})

test('every stamped pattern page carries the icons its block names', () => {
  const failures = []
  for (const p of stamped) {
    const e = expected[p.block]; const f = baseline[p.block]; if (!f) continue
    const missing = minus(e.icons, f.icons)
    if (missing.length) failures.push(`${p.block}: ${missing.join(', ')}`)
  }
  assert.deepEqual(failures, [], 'Icons named in the block but not instanced on the page:\n  ' + failures.join('\n  '))
})

test('the expectation drops screen-reader-only text and a placeholder hidden behind a value', () => {
  const html = '<th><span class="sr-only">Actions</span></th><input placeholder="Search…" value="token"/><input placeholder="Email"/><p>Hi &amp; bye</p>'
  assert.deepEqual(textsOf(html), ['Hi & bye', 'token', 'Email'])
})

// The daily half: the same snapshot from a REST nodes bundle, diffed against the baseline.
const bundle = {
  document: { id: '1:1', name: 'Hero', type: 'FRAME', visible: true, children: [
    { id: '1:2', name: 'Badge', type: 'INSTANCE', componentId: 'c-badge', children: [{ id: '1:3', name: 'Badge', type: 'TEXT', characters: 'New' }] },
    { id: '1:4', name: 'Title', type: 'TEXT', characters: 'The calm  design system' },
    { id: '1:5', name: 'Hidden', type: 'TEXT', characters: 'nope', visible: false },
    { id: '1:6', name: 'Button', type: 'INSTANCE', componentId: 'c-btn', children: [
      { id: '1:7', name: 'Icon start', type: 'INSTANCE', componentId: 'c-icon-add', visible: false, children: [] },
      { id: '1:8', name: 'Button', type: 'TEXT', characters: 'Get started' },
      { id: '1:9', name: 'Icon end', type: 'INSTANCE', componentId: 'c-icon-arrow', children: [] },
    ] },
  ] },
  components: { 'c-badge': { name: 'Variant=secondary', componentSetId: 's-badge' }, 'c-btn': { name: 'Variant=default, Size=lg', componentSetId: 's-btn' }, 'c-icon-add': { name: 'icon/add' }, 'c-icon-arrow': { name: 'icon/arrow_forward' } },
  componentSets: { 's-badge': { name: 'Badge' }, 's-btn': { name: 'Button' } },
}

test('a REST bundle snapshots to the same shape as the baseline', () => {
  assert.deepEqual(snapshotPattern(bundle), { texts: ['New', 'The calm design system', 'Get started'], icons: ['arrow_forward'], instances: ['Badge', 'Button'] })
})

test('diffing a pattern names changed copy, missing icons and moved instances', () => {
  const base = { texts: ['New', 'The calm design system', 'Get started', 'Read the docs'], icons: ['arrow_forward', 'menu_book'], instances: ['Badge', 'Button', 'Button'] }
  const live = snapshotPattern(bundle)
  const drift = diffPattern(base, live)
  assert.ok(drift.some((d) => /text.*Read the docs/.test(d)), drift.join('\n'))
  assert.ok(drift.some((d) => /icon.*menu_book/.test(d)), drift.join('\n'))
  assert.ok(drift.some((d) => /instances/.test(d)), drift.join('\n'))
  assert.deepEqual(diffPattern(live, live), [])
})
