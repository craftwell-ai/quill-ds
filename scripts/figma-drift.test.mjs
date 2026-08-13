import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { loadState, extractComponent, diffComponent, checkCode, boundName, rgbToHex } from './figma-drift.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// A miniature REST nodes-response bundle shaped like GET /v1/files/:key/nodes
// (document + per-bundle styles table), matching the snapshot below exactly.
const VARS = { 'VariableID:1:1': 'shadcn/card', 'VariableID:1:2': 'corner-radius/2xl', 'VariableID:1:3': 'spacing/8' }
const snapshot = {
  fill: { var: 'shadcn/card', raw: '#EFE4CE' },
  cornerRadius: { var: 'corner-radius/2xl', raw: 24 },
  padding: { var: 'spacing/8', raw: 32 },
  effectStyle: 'Elevation/lg',
  texts: { Title: 'Acknowledgement № 001' },
  childSignature: ['Title:TEXT'],
}
const cleanBundle = () => ({
  document: {
    type: 'COMPONENT',
    fills: [{ type: 'SOLID', color: { r: 0.937, g: 0.894, b: 0.807 }, boundVariables: { color: { type: 'VARIABLE_ALIAS', id: 'VariableID:1:1' } } }],
    boundVariables: {
      topLeftRadius: { type: 'VARIABLE_ALIAS', id: 'VariableID:1:2' },
      paddingLeft: { type: 'VARIABLE_ALIAS', id: 'VariableID:1:3' },
    },
    cornerRadius: 24,
    paddingLeft: 32,
    styles: { effect: 'S:aa' },
    children: [{ name: 'Title', type: 'TEXT', characters: 'Acknowledgement № 001' }],
  },
  styles: { 'S:aa': { name: 'Elevation/lg', styleType: 'EFFECT' } },
})

test('a bundle matching the baseline reports no drift', () => {
  const live = extractComponent(cleanBundle(), VARS)
  const { drift } = diffComponent(snapshot, live)
  assert.deepEqual(drift, [])
})

test('a rebound variable is drift, named per property', () => {
  const bundle = cleanBundle()
  bundle.document.boundVariables.topLeftRadius.id = 'VariableID:9:9'
  bundle.document.cornerRadius = 8
  const { drift } = diffComponent(snapshot, extractComponent(bundle, VARS))
  assert.equal(drift.length, 1)
  assert.match(drift[0], /cornerRadius/)
})

test('a dropped binding with an unchanged raw value is parity noise, not drift', () => {
  const bundle = cleanBundle()
  delete bundle.document.boundVariables.topLeftRadius
  const { drift } = diffComponent(snapshot, extractComponent(bundle, VARS))
  assert.deepEqual(drift, [])
})

test('a property invisible to the REST response is unverifiable, never clean or drift', () => {
  const bundle = cleanBundle()
  delete bundle.document.boundVariables.paddingLeft
  delete bundle.document.paddingLeft
  const { drift, unverifiable } = diffComponent(snapshot, extractComponent(bundle, VARS))
  assert.deepEqual(drift, [])
  assert.ok(unverifiable.includes('padding'))
})

test('text and structure changes are drift', () => {
  const bundle = cleanBundle()
  bundle.document.children = [
    { name: 'Title', type: 'TEXT', characters: 'Renamed' },
    { name: 'Extra', type: 'FRAME', children: [] },
  ]
  const { drift } = diffComponent(snapshot, extractComponent(bundle, VARS))
  assert.ok(drift.some((d) => d.startsWith("text 'Title'")))
  assert.ok(drift.some((d) => d.startsWith('structure')))
})

test('boundVariables array form and hex conversion both normalize', () => {
  assert.equal(boundName([{ id: 'VariableID:1:1' }], VARS), 'shadcn/card')
  assert.equal(rgbToHex({ r: 1, g: 1, b: 1 }), '#FFFFFF')
})

test('the shipped sync-state baseline is valid and its pairs exist on disk', () => {
  const state = loadState()
  assert.ok(state.fileKey)
  assert.ok(Object.keys(state.variables).length > 0)
  for (const c of state.components) {
    assert.ok(c.nodeId && c.figma && c.code?.classes, `component '${c.name}' is missing required fields`)
    const source = readFileSync(join(root, c.codeFile), 'utf8')
    assert.ok(checkCode(c, source), `baseline classes for '${c.name}' not found in ${c.codeFile} — run /figma-push or update figma/sync-state.json`)
  }
})
