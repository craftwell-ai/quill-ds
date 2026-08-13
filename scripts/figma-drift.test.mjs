import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { loadState, extractComponent, diffComponent, checkCode, boundName, rgbToHex, classFor, planRepair, applyRepair } from './figma-drift.mjs'

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

// ---- auto-repair ----

const COMPONENT = () => ({
  name: 'Test',
  codeFile: 'src/components/ui/test-card.tsx',
  figma: structuredClone(snapshot),
  code: { classes: 'flex gap-3 rounded-2xl bg-card p-8 shadow-lg' },
})
const SOURCE = 'className={cn("flex gap-3 rounded-2xl bg-card p-8 shadow-lg")}\n<div>Acknowledgement № 001</div>'

test('classFor maps every repairable key and rejects unknowns', () => {
  assert.equal(classFor('fill', 'shadcn/muted'), 'bg-muted')
  assert.equal(classFor('cornerRadius', 'corner-radius/2xl'), 'rounded-2xl')
  assert.equal(classFor('padding', 'spacing/2_5'), 'p-2.5')
  assert.equal(classFor('itemSpacing', 'spacing/3'), 'gap-3')
  assert.equal(classFor('effectStyle', 'Elevation/base'), 'shadow-md')
  assert.equal(classFor('fill', 'unknown(VariableID:9:9)'), undefined)
  assert.equal(classFor('cornerRadius', 'corner-radius/weird'), undefined)
})

test('a rebound radius is a repairable one-class edit that rewrites source and baseline', () => {
  const bundle = cleanBundle()
  bundle.document.boundVariables.topLeftRadius.id = 'VariableID:1:4'
  const vars = { ...VARS, 'VariableID:1:4': 'corner-radius/lg' }
  bundle.document.cornerRadius = 8
  const component = COMPONENT()
  const live = extractComponent(bundle, vars)
  const plan = planRepair(component, live, SOURCE)
  assert.ok(plan.repairable, plan.reasons.join('; '))
  const { source, component: next } = applyRepair(component, plan, SOURCE, '2026-08-13')
  assert.ok(source.includes('rounded-lg') && !source.includes('rounded-2xl'))
  assert.equal(next.figma.cornerRadius.var, 'corner-radius/lg')
  assert.equal(next.figma.cornerRadius.raw, 8)
  assert.equal(next.code.classes, 'flex gap-3 rounded-lg bg-card p-8 shadow-lg')
  assert.equal(next.lastSynced, '2026-08-13')
})

test('a text change is repairable when the old value is unique in source', () => {
  const bundle = cleanBundle()
  bundle.document.children[0].characters = 'Acknowledgement № 002'
  const component = COMPONENT()
  const plan = planRepair(component, extractComponent(bundle, VARS), SOURCE)
  assert.ok(plan.repairable, plan.reasons.join('; '))
  const { source, component: next } = applyRepair(component, plan, SOURCE, '2026-08-13')
  assert.ok(source.includes('№ 002'))
  assert.equal(next.figma.texts.Title, 'Acknowledgement № 002')
})

test('structural drift, unknown variables, and removed texts are never auto-repaired', () => {
  const structural = cleanBundle()
  structural.document.children.push({ name: 'Extra', type: 'FRAME', children: [] })
  assert.equal(planRepair(COMPONENT(), extractComponent(structural, VARS), SOURCE).repairable, false)

  const unknown = cleanBundle()
  unknown.document.boundVariables.topLeftRadius.id = 'VariableID:9:9'
  unknown.document.cornerRadius = 999
  const plan = planRepair(COMPONENT(), extractComponent(unknown, VARS), SOURCE)
  assert.equal(plan.repairable, false)
  assert.ok(plan.reasons.some((r) => r.includes('no class mapping')))

  const removed = cleanBundle()
  removed.document.children = []
  assert.equal(planRepair(COMPONENT(), extractComponent(removed, VARS), SOURCE).repairable, false)
})

test('applyRepair refuses a source where the baseline classes are not unique', () => {
  const component = COMPONENT()
  const doubled = SOURCE + '\n' + SOURCE
  const bundle = cleanBundle()
  bundle.document.boundVariables.topLeftRadius.id = 'VariableID:1:4'
  const vars = { ...VARS, 'VariableID:1:4': 'corner-radius/lg' }
  const plan = planRepair(component, extractComponent(bundle, vars), doubled)
  assert.throws(() => applyRepair(component, plan, doubled, '2026-08-13'), /not found exactly once/)
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
