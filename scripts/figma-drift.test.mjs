import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { loadState, extractComponent, diffComponent, checkCode, boundName, rgbToHex, classFor, planRepair, applyRepair, pickVariant, derivedClasses, matchCode, adoptCandidate, pruneSnapshot } from './figma-drift.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// A miniature REST nodes-response bundle shaped like GET /v1/files/:key/nodes
// (document + per-bundle styles table), matching the snapshot below exactly.
const VARS = { 'VariableID:1:1': 'shadcn/card', 'VariableID:1:2': 'corner-radius/2xl', 'VariableID:1:3': 'spacing/8' }
const snapshot = {
  fill: { var: 'shadcn/card', raw: '#EFE4CE' },
  cornerRadius: { var: 'corner-radius/2xl', raw: 24 },
  padding: { var: 'spacing/8', raw: 32 },
  effectStyle: 'Elevation/lg',
  texts: { Title: 'Acknowledgement 001' },
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
    children: [{ name: 'Title', type: 'TEXT', characters: 'Acknowledgement 001' }],
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

test('per-side stroke weights resolve the strokeWeight binding by name', () => {
  const vars = { ...VARS, 'VariableID:1:4': 'border-width/1', 'VariableID:1:5': 'border-width/2' }
  const bundle = cleanBundle()
  bundle.document.boundVariables.strokeTopWeight = { type: 'VARIABLE_ALIAS', id: 'VariableID:1:4' }
  bundle.document.strokeTopWeight = 1
  assert.deepEqual(extractComponent(bundle, vars).strokeWeight, { var: 'border-width/1', raw: 1 })

  // A rebind to a heavier border is named, not reported as a bare number.
  const snap = { strokeWeight: { var: 'border-width/1', raw: 1 } }
  bundle.document.boundVariables.strokeTopWeight.id = 'VariableID:1:5'
  bundle.document.strokeTopWeight = 2
  const { drift } = diffComponent(snap, extractComponent(bundle, vars))
  assert.deepEqual(drift, ['strokeWeight: expected border-width/1, found border-width/2'])
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
const SOURCE = 'className={cn("flex gap-3 rounded-2xl bg-card p-8 shadow-lg")}\n<div>Acknowledgement 001</div>'

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
  bundle.document.children[0].characters = 'Acknowledgement 002'
  const component = COMPONENT()
  const plan = planRepair(component, extractComponent(bundle, VARS), SOURCE)
  assert.ok(plan.repairable, plan.reasons.join('; '))
  const { source, component: next } = applyRepair(component, plan, SOURCE, '2026-08-13')
  assert.ok(source.includes('Acknowledgement 002'))
  assert.equal(next.figma.texts.Title, 'Acknowledgement 002')
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

// ---- adoption ----

const variantSet = () => ({
  document: {
    type: 'COMPONENT_SET',
    id: '76:56',
    children: [
      { ...cleanBundle().document, id: '76:57', name: 'Variant=destructive, Size=default' },
      { ...cleanBundle().document, id: '76:58', name: 'Variant=default, Size=default' },
      { ...cleanBundle().document, id: '76:59', name: 'Variant=default, Size=sm' },
    ],
  },
  styles: cleanBundle().styles,
})
const CANDIDATE = { name: 'Button', nodeId: '76:56', codeFile: 'src/components/ui/button.tsx' }
const AGREEING_SOURCE = 'const base = cva("inline-flex rounded-2xl bg-card p-8 shadow-lg", { variants: {} })\nexport { base }\n'

test('pickVariant takes the all-default variant, not the first child', () => {
  assert.equal(pickVariant(variantSet().document).id, '76:58')
  const noDefault = { children: [{ type: 'COMPONENT', id: 'a', name: 'Checked=on' }, { type: 'COMPONENT', id: 'b', name: 'Checked=off' }] }
  assert.equal(pickVariant(noDefault).id, 'b')
  assert.equal(pickVariant({ children: [] }), null)
})

test('derivedClasses names the classes the bindings translate to and skips the unmappable', () => {
  assert.deepEqual(derivedClasses(snapshot), ['bg-card', 'rounded-2xl', 'p-8', 'shadow-lg'])
  assert.deepEqual(derivedClasses({ fill: { var: 'unknown(VariableID:9:9)', raw: '#000000' }, texts: {} }), [])
})

test('matchCode anchors on the literal carrying the most classes and names what is missing', () => {
  assert.deepEqual(matchCode(AGREEING_SOURCE, ['bg-card', 'p-8']), { classes: 'inline-flex rounded-2xl bg-card p-8 shadow-lg', missing: [], detectionOnly: false })
  assert.deepEqual(matchCode(AGREEING_SOURCE, ['bg-card', 'p-6']).missing, ['p-6'], 'a class the code does not carry')
  // cva keeps the fill in a variant literal, apart from the base string
  const cva = 'cva("inline-flex gap-1 px-2 py-0.5", { variants: { variant: { default: "bg-primary text-primary-foreground" } } })'
  assert.deepEqual(matchCode(cva, ['bg-primary', 'p-2', 'gap-1']), { classes: 'inline-flex gap-1 px-2 py-0.5', missing: [], detectionOnly: false })
  // a literal that occurs twice cannot be rewritten later, so it never anchors
  assert.equal(matchCode('cn("bg-card p-8") + cn("bg-card p-8")', ['bg-card']).classes, null)
  // nothing to derive: detection-only, anchored on the first real class string
  assert.deepEqual(matchCode('cn("peer size-4 rounded-sm border")', []), { classes: 'peer size-4 rounded-sm border', missing: [], detectionOnly: true })
})

test('a candidate whose code agrees with Figma is adopted through its default variant', () => {
  const { adopted, why } = adoptCandidate(CANDIDATE, variantSet(), VARS, AGREEING_SOURCE, '2026-09-15')
  assert.ok(adopted, why)
  assert.equal(adopted.nodeId, '76:58')
  assert.equal(adopted.variantOf, '76:56')
  assert.equal(adopted.variant, 'Variant=default, Size=default')
  assert.equal(adopted.code.classes, 'inline-flex rounded-2xl bg-card p-8 shadow-lg')
  assert.deepEqual(adopted.figma.fill, { var: 'shadcn/card', raw: '#EFE4CE' })
  // …and the entry it produced is what the daily check consumes: clean today,
  // drift the moment a designer re-binds the radius.
  assert.deepEqual(diffComponent(adopted.figma, extractComponent({ document: variantSet().document.children[1], styles: variantSet().styles }, VARS)).drift, [])
  // A re-binding that changes the resolved value: both the name and the raw
  // move (a dropped binding with the same raw value is parity noise, not drift).
  const rebound = variantSet().document.children[1]
  rebound.boundVariables.topLeftRadius.id = 'VariableID:1:3'
  rebound.cornerRadius = 8
  assert.match(diffComponent(adopted.figma, extractComponent({ document: rebound, styles: variantSet().styles }, { ...VARS, 'VariableID:1:3': 'corner-radius/lg' })).drift.join(' '), /cornerRadius/)
})

test('a candidate whose code disagrees with Figma is reported, never adopted', () => {
  const disagreeing = 'const base = cva("inline-flex rounded-lg bg-card p-8 shadow-lg")\n'
  const { adopted, why } = adoptCandidate(CANDIDATE, variantSet(), VARS, disagreeing, '2026-09-15')
  assert.equal(adopted, null)
  assert.match(why, /disagree/)
  assert.match(why, /figma-pull|figma-push/)
  assert.equal(adoptCandidate(CANDIDATE, undefined, VARS, disagreeing, '2026-09-15').adopted, null)
})

test('a candidate with nothing to derive is adopted for Figma-side detection, and says so', () => {
  const bare = { document: { type: 'COMPONENT', id: '82:9', name: 'Label', children: [{ name: 'Label', type: 'TEXT', characters: 'Label' }] }, styles: {} }
  const { adopted, why } = adoptCandidate({ name: 'Label', nodeId: '82:9', codeFile: 'src/components/ui/label.tsx' }, bare, VARS, 'cn("flex items-center gap-2 text-sm")', '2026-09-15')
  assert.ok(adopted)
  assert.equal(adopted.code.classes, 'flex items-center gap-2 text-sm')
  assert.match(why, /Figma-side edits only/)
  assert.deepEqual(adopted.figma.texts, { Label: 'Label' })
})

test('a padding re-binding repairs the px- form the code carries', () => {
  const component = { name: 'Badge', codeFile: 'x', figma: { ...snapshot, padding: { var: 'spacing/8', raw: 32 } }, code: { classes: 'inline-flex rounded-2xl bg-card px-8 shadow-lg' } }
  const bundle = cleanBundle()
  bundle.document.boundVariables.paddingLeft.id = 'VariableID:1:4'
  bundle.document.paddingLeft = 24
  const live = extractComponent(bundle, { ...VARS, 'VariableID:1:4': 'spacing/6' })
  const plan = planRepair(component, live, 'className="inline-flex rounded-2xl bg-card px-8 shadow-lg"')
  assert.ok(plan.repairable, plan.reasons.join('; '))
  assert.deepEqual(plan.classEdits.map((e) => [e.from, e.to]), [['px-8', 'px-6']])
})

test('an adopted snapshot drops the keys the REST response could not fill, and keeps raw-only ones', () => {
  const pruned = pruneSnapshot({
    fill: { var: 'shadcn/border', raw: '#2A2622' },
    stroke: { var: null, raw: null },
    strokeWeight: { var: null, raw: 1 },
    cornerRadius: { var: null, raw: null },
    effectStyle: null,
    texts: {},
    childSignature: [],
  })
  assert.deepEqual(Object.keys(pruned), ['fill', 'strokeWeight', 'texts', 'childSignature'])
  // and the daily check is silent on what is absent: no drift, no warnings
  const { drift, unverifiable } = diffComponent(pruned, { fill: { var: 'shadcn/border', raw: '#2A2622' }, stroke: { var: null, raw: null }, strokeWeight: { var: null, raw: 1 }, cornerRadius: { var: null, raw: null }, padding: { var: null, raw: null }, itemSpacing: { var: null, raw: null }, effectStyle: null, texts: {}, childSignature: [] })
  assert.deepEqual([drift, unverifiable], [[], []])
  const { adopted } = adoptCandidate(CANDIDATE, variantSet(), VARS, AGREEING_SOURCE, '2026-09-15')
  assert.ok(!('stroke' in adopted.figma) && !('itemSpacing' in adopted.figma), 'double-null keys never enter the baseline')
})

// 2026-09-18 — what the adopt run taught the matcher
test('matchCode accepts variant-prefixed, axis and pill forms of a class', () => {
  const src = 'cn("peer rounded-full border data-unchecked:bg-input group-data-[size=default]/switch:h-4") + cn("grid gap-0.5 has-[>svg]:gap-x-2 px-2.5 py-2")'
  assert.deepEqual(matchCode(src, ['bg-input']).missing, [])
  assert.deepEqual(matchCode(src, ['gap-2', 'p-2.5']).missing, [])
  assert.deepEqual(matchCode(src, ['rounded-4xl']).missing, [], 'rounded-full draws the same pill as rounded-4xl on a control')
  assert.deepEqual(matchCode(src, ['gap-3']).missing, ['gap-3'])
})

test('matchCode resolves a spacing CSS variable the file defines', () => {
  const src = 'cn("flex gap-(--card-spacing) py-(--card-spacing) rounded-xl bg-card [--card-spacing:--spacing(4)]")'
  assert.deepEqual(matchCode(src, ['gap-4', 'bg-card', 'rounded-xl']).missing, [])
  assert.deepEqual(matchCode(src, ['gap-6']).missing, ['gap-6'])
})

test('matchCode takes the unprefixed spacing-variable definition, not a variant override', () => {
  // Card: `[--card-spacing:--spacing(4)]` is the value; `data-[size=sm]:[--card-spacing:--spacing(3)]` is a variant.
  const src = 'cn("flex gap-(--card-spacing) rounded-xl [--card-spacing:--spacing(4)] data-[size=sm]:[--card-spacing:--spacing(3)]")'
  assert.deepEqual(matchCode(src, ['gap-4']).missing, [])
  assert.deepEqual(matchCode(src, ['gap-3']).missing, ['gap-3'])
})

test('matchCode reads a left padding as pl- and a one-class cva variant value', () => {
  // Select: the twin reads paddingLeft; the code writes each side out.
  assert.deepEqual(matchCode('cn("flex py-2 pr-2 pl-2.5 text-sm")', ['p-2.5']).missing, [])
  // Tabs: the list background sits alone in the cva variants map.
  const cva = 'cva("inline-flex rounded-lg p-[3px] text-muted-foreground", { variants: { variant: { default: "bg-muted", line: "gap-1 bg-transparent" } } })'
  assert.deepEqual(matchCode(cva, ['bg-muted', 'rounded-lg']).missing, [])
})

test('matchCode may find the rest of the classes in a file the candidate also names', () => {
  const own = "cn('border-transparent text-2xs uppercase', tone)"
  const base = 'cva("inline-flex h-5 gap-1 rounded-4xl px-2 py-0.5")'
  assert.deepEqual(matchCode(own, ['p-2', 'gap-1'], [base]), { classes: 'border-transparent text-2xs uppercase', missing: [], detectionOnly: false })
  assert.deepEqual(matchCode(own, ['p-2', 'gap-1']).missing, ['p-2', 'gap-1'])
})

test('a detection-only candidate adopts on its anchor without a class match', () => {
  const candidate = { name: 'Toast', nodeId: '1:1', codeFile: 'x.tsx', detectionOnly: true, anchor: 'toaster group' }
  const { adopted, why } = adoptCandidate(candidate, cleanBundle(), VARS, 'const c = "toaster group"; export {}', '2026-09-18')
  assert.ok(adopted, why)
  assert.equal(adopted.code.classes, 'toaster group')
  assert.match(why, /detection/)
  assert.equal(adoptCandidate({ ...candidate, anchor: 'nope' }, cleanBundle(), VARS, 'const c = "toaster group"', '2026-09-18').adopted, null)
})
