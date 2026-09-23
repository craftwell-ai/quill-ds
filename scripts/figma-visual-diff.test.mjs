import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PNG } from 'pngjs'
import { canonicalStory, pairsFromState, padTo, comparePngs, strip, verdict, renderSummary, REGRESSION_PCT, REGRESSION_PX } from './figma-visual-diff.mjs'

// The pure half of the visual diff, on synthetic images — no Figma, no browser.
const solid = (w, h, [r, g, b]) => { const p = new PNG({ width: w, height: h }); for (let i = 0; i < w * h; i++) { p.data[i * 4] = r; p.data[i * 4 + 1] = g; p.data[i * 4 + 2] = b; p.data[i * 4 + 3] = 255 } return p }
const paint = (png, x0, y0, w, h, [r, g, b]) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) { const i = (y * png.width + x) * 4; png.data[i] = r; png.data[i + 1] = g; png.data[i + 2] = b } return png }

test('canonicalStory prefers --<name>, then --default, then the first real story; never docs or Do/Don\'t', () => {
  assert.equal(canonicalStory('hero', ['patterns-marketing-hero--docs', 'patterns-marketing-hero--hero', 'patterns-marketing-hero--do-dont']), 'patterns-marketing-hero--hero')
  assert.equal(canonicalStory('faq', ['x--docs', 'x--default', 'x--dense']), 'x--default')
  assert.equal(canonicalStory('faq', ['x--docs', 'x--dense', 'x--dodont']), 'x--dense')
  assert.equal(canonicalStory('faq', ['x--docs']), null)
})

test('pairsFromState takes mirrored patterns and templates with their canonical story', () => {
  const state = { patterns: [{ block: 'hero', status: 'mirrored', frameId: '1:1' }, { block: 'nope', status: 'declined' }], templates: [{ block: 'app-page', frameId: '2:2' }] }
  const roots = [{ kind: 'pattern', name: 'hero', storyIds: ['p-hero--docs', 'p-hero--hero'] }, { kind: 'template', name: 'app-page', storyIds: ['examples-app-page--docs', 'examples-app-page--app-page'] }]
  assert.deepEqual(pairsFromState(state, roots), [
    { kind: 'pattern', name: 'hero', frameId: '1:1', story: 'p-hero--hero' },
    { kind: 'template', name: 'app-page', frameId: '2:2', story: 'examples-app-page--app-page' },
  ])
})

test('identical images differ by 0 %; a known block differs by its share of the union', () => {
  const a = solid(200, 100, [40, 40, 40])
  const same = comparePngs(a, solid(200, 100, [40, 40, 40]))
  assert.equal(same.diffPct, 0)
  assert.deepEqual(same.sizeDelta, [0, 0])
  // a 20×10 block = 200 of 20 000 pixels = 1 %
  const b = paint(solid(200, 100, [40, 40, 40]), 0, 0, 20, 10, [245, 237, 221])
  assert.equal(comparePngs(a, b).diffPct, 1)
})

test('different sizes compare on the union canvas, padded on paper, and report the drift in CSS px', () => {
  const a = solid(200, 100, [245, 237, 221]) // paper-coloured
  const b = solid(200, 120, [245, 237, 221]) // 20 device px taller = 10 CSS px
  const r = comparePngs(a, b)
  assert.equal(r.diffPct, 0, 'extra paper-coloured rows are not a difference')
  assert.deepEqual(r.sizeDelta, [0, 10])
  assert.deepEqual(r.size, { figma: [100, 50], storybook: [100, 60] })
  assert.equal(padTo(a, 200, 120).height, 120)
})

test('the strip lays Figma, Storybook and the diff side by side', () => {
  const a = solid(10, 10, [0, 0, 0]); const b = solid(10, 10, [0, 0, 0]); const d = solid(10, 10, [0, 0, 0])
  const s = strip(a, b, d, 4)
  assert.equal(s.width, 10 * 3 + 4 * 2); assert.equal(s.height, 10)
})

test('verdict: unbaselined without a baseline; regression above the tolerance or on size drift; ok otherwise', () => {
  const r = { diffPct: 3.2, size: { figma: [880, 610], storybook: [880, 612] } }
  assert.equal(verdict(r, null), 'unbaselined')
  assert.equal(verdict(r, { diffPct: 3.0, figma: [880, 610], storybook: [880, 612] }), 'ok')
  assert.equal(verdict(r, { diffPct: 3.2 - REGRESSION_PCT - 0.1, figma: [880, 610], storybook: [880, 612] }), 'regression')
  assert.equal(verdict(r, { diffPct: 3.2, figma: [880, 610], storybook: [880, 612 + REGRESSION_PX + 1] }), 'regression')
})

test('the summary is a table with one row per pair and the counts in its heading', () => {
  const rows = [
    { kind: 'pattern', name: 'hero', diffPct: 2.5, baseline: { diffPct: 2.4 }, size: { figma: [880, 610], storybook: [880, 611] }, sizeDelta: [0, 1], verdict: 'ok', strip: 'pairs/hero/strip.png' },
    { kind: 'pattern', name: 'faq', diffPct: 9.1, baseline: { diffPct: 2.0 }, size: { figma: [880, 400], storybook: [880, 460] }, sizeDelta: [0, 60], verdict: 'regression', strip: 'pairs/faq/strip.png' },
    { kind: 'template', name: 'app-page', error: 'no story' },
  ]
  const md = renderSummary(rows)
  assert.match(md, /3 pairs · 1 regression · 0 unbaselined · report-only/)
  assert.match(md, /\| pattern\/hero \(\[strip\]\(pairs\/hero\/strip\.png\)\) \| 2\.50 \| 2\.40 \| 880×610 → 880×611 \| ok \|/)
  assert.match(md, /880×400 → 880×460 ⚠ \| regression/)
  assert.match(md, /template\/app-page \| — \| — \| — \| error: no story/)
})
