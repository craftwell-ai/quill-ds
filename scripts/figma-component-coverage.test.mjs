import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { loadState } from './figma-drift.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// Does every code primitive have a declared Figma status?
//
// The same shape as the pattern map: a primitive is under the daily check
// (`components`), waiting to be adopted (`candidates`), or `declined` with the
// reason written down. 57 primitives, 44 twins, 15 checked — and the list of
// which was which lived only in a build log until 2026-09-18.

const state = loadState()
const generated = new Set(['icons.core.mjs', 'icons.generated.d.ts'])
const primitives = readdirSync(join(root, 'src/components/ui'))
  .filter((f) => f.endsWith('.tsx') && !generated.has(f))
  .map((f) => 'src/components/ui/' + f)

const declared = [
  ...state.components.map((c) => ({ file: c.codeFile, via: 'components' })),
  ...(state.candidates ?? []).map((c) => ({ file: c.codeFile, via: 'candidates' })),
  ...(state.declined ?? []).map((c) => ({ file: c.codeFile, via: 'declined' })),
]

test('every primitive appears once across components, candidates and declined', () => {
  const byFile = new Map()
  for (const d of declared) byFile.set(d.file, [...(byFile.get(d.file) ?? []), d.via])
  const missing = primitives.filter((p) => !byFile.has(p))
  assert.deepEqual(missing, [], `primitives with no Figma status in figma/sync-state.json (add to candidates, or to declined with a reason):\n  ${missing.join('\n  ')}`)
  const doubled = [...byFile].filter(([, vias]) => vias.length > 1 && new Set(vias).size > 1).map(([f, vias]) => `${f} (${vias.join(' + ')})`)
  assert.deepEqual(doubled, [], `a primitive is listed under more than one status: ${doubled.join(', ')}`)
})

test('every declared code file exists and every decline says why', () => {
  for (const d of declared) assert.ok(existsSync(join(root, d.file)), `${d.via}: ${d.file} is not on disk`)
  for (const d of state.declined ?? []) assert.ok(typeof d.reason === 'string' && d.reason.trim(), `declined ${d.name}: needs a reason`)
})

test('every candidate names a Figma node and a code file', () => {
  for (const c of state.candidates ?? []) {
    assert.match(c.nodeId ?? '', /^\d+:\d+$/, `candidate ${c.name}: nodeId`)
    assert.ok(c.codeFile, `candidate ${c.name}: codeFile`)
  }
})
