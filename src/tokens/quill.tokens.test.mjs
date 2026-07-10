import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tokens } from './quill.tokens.mjs'
import { renderManager } from '../../scripts/build-tokens.mjs'

test('primitive color values match current globals.css', () => {
  assert.equal(tokens.color.paper.base.light, '#F5EDDD')
  assert.equal(tokens.color.paper.base.dark, '#20180E')
  assert.equal(tokens.color.ink.base.light, '#2A2622')
  assert.equal(tokens.color.pigment.terracotta.base.light, '#C4684B')
  assert.equal(tokens.color.pigment.terracotta.deep.light, '#8A4530')
  assert.equal(tokens.color.line.base.light, 'rgba(42, 38, 34, 0.15)')
})

test('scalars match current values', () => {
  assert.equal(tokens.radius.lg, '0.5rem')
  assert.equal(tokens.text.xl, '1.5rem')
  assert.equal(tokens.shadow.pop.light.startsWith('0 20px 32px'), true)
  assert.equal(tokens.fraunces.accent, '"opsz" 144, "SOFT" 100, "WONK" 1')
})

test('the accent alias is fixed to terracotta-deep (a11y)', () => {
  assert.equal(tokens.semantic['text-accent-color'], 'var(--terracotta-deep)')
  assert.equal(tokens.shadcn.destructive, 'var(--terracotta-deep)')
})

test('manager search input border matches the DS field border (line-control)', () => {
  assert.equal(renderManager(tokens).inputBorder, tokens.color.line.control.light)
})

test('interactive controls use a solid AA boundary, not the faint alpha line (WCAG 1.4.11)', () => {
  // Solid warm-grey clears non-text 3:1 on paper (3.38:1 light / 3.34:1 dark).
  assert.equal(tokens.color.line.control.light, '#8A7F6E')
  assert.equal(tokens.color.line.control.dark, '#746B5D')
  // shadcn `input` (switch track, checkbox/radio/field borders) + semantic field border route through it.
  assert.equal(tokens.shadcn.input, 'var(--line-control)')
  assert.equal(tokens.semantic['border-field'], 'var(--line-control)')
  // chart-4 gold-base failed 3:1 (2.31); gold-deep clears it (3.33:1).
  assert.equal(tokens.shadcn['chart-4'], 'var(--gold-deep)')
})
