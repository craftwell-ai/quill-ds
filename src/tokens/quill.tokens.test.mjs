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

test('accent aliases follow data-accent, defaulting to moss (a11y)', () => {
  assert.equal(tokens.semantic['text-accent-color'], 'var(--accent-pigment-text)')
  assert.equal(tokens.semantic.link, 'var(--accent-pigment-text)')
  assert.equal(tokens.shadcn.ring, 'var(--accent-pigment-text)')
  assert.equal(tokens.accents.moss.text, 'var(--moss-deep)')
  assert.equal(tokens.accents.terracotta.text, 'var(--terracotta-deep)')
  // status colors do NOT follow the accent
  assert.equal(tokens.shadcn.destructive, 'var(--terracotta-deep)')
  assert.equal(tokens.semantic.warning, 'var(--gold-deep)')
})

test('every accent text cut clears WCAG 4.5:1 on every theme ground (16 combos)', () => {
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const lum = (hex) =>
    [1, 3, 5]
      .map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255))
      .reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0)
  const contrast = (a, b) => {
    const [x, y] = [lum(a) + 0.05, lum(b) + 0.05]
    return Math.max(x, y) / Math.min(x, y)
  }
  // 'var(--gold-text)' → tokens.color.pigment.gold.text etc.
  const resolve = (ref, mode) => {
    const [pigment, ...cut] = ref.replace(/^var\(--|\)$/g, '').split('-')
    return tokens.color.pigment[pigment][cut.join('-') || 'base'][mode]
  }
  for (const mode of ['light', 'dark', 'classicLight', 'classicDark']) {
    const ground = tokens.color.paper.base[mode]
    for (const [name, accent] of Object.entries(tokens.accents)) {
      const textCut = resolve(accent.text, mode)
      const ratio = contrast(textCut, ground)
      assert.ok(
        ratio >= 4.5,
        `accent '${name}' text cut ${textCut} is ${ratio.toFixed(2)}:1 on ${mode} ground ${ground} — links/eyebrows would fail AA`,
      )
    }
  }
})

test('classic themes: pure grounds, +50%-chroma pigments, AA control borders', () => {
  assert.equal(tokens.color.paper.base.classicLight, '#FFFFFF')
  assert.equal(tokens.color.paper.base.classicDark, '#000000')
  // Chroma-boosted pigments (OKLCH ×1.5, gamut-clamped)
  assert.equal(tokens.color.pigment.terracotta.base.classicLight, '#DE501B')
  assert.equal(tokens.color.pigment.terracotta.base.classicDark, '#F57345')
  // Solid control boundaries: 3.69:1 on white, 4.56:1 on black (WCAG 1.4.11)
  assert.equal(tokens.color.line.control.classicLight, '#858585')
  assert.equal(tokens.color.line.control.classicDark, '#757575')
  // Every color leaf must carry all four modes — a missing mode would emit
  // `undefined` into the generated CSS.
  const assertLeaves = (obj, path) => {
    for (const [k, v] of Object.entries(obj)) {
      if (v && typeof v === 'object' && 'light' in v) {
        for (const mode of ['light', 'dark', 'classicLight', 'classicDark']) {
          assert.equal(typeof v[mode], 'string', `${path}.${k} missing mode '${mode}'`)
        }
      } else if (v && typeof v === 'object') assertLeaves(v, `${path}.${k}`)
    }
  }
  assertLeaves(tokens.color, 'color')
  assertLeaves(tokens.shadow, 'shadow')
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
})

test('chart tokens: series are CVD-safe chart cuts, ramps behave (WCAG 1.4.11 + dataviz checks)', () => {
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const lum = (hex) =>
    [1, 3, 5]
      .map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255))
      .reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0)
  const contrast = (a, b) => {
    const [x, y] = [lum(a) + 0.05, lum(b) + 0.05]
    return Math.max(x, y) / Math.min(x, y)
  }
  // shadcn chart slots route through the chart-only series cuts — the raw pigments
  // fail the data-mark checks (chroma < 0.10 reads gray; terracotta↔moss ΔE 3.2 deutan).
  for (const n of [1, 2, 3, 4, 5]) {
    assert.equal(tokens.shadcn[`chart-${n}`], `var(--chart-series-${n})`)
  }
  for (const mode of ['light', 'dark', 'classicLight', 'classicDark']) {
    const ground = tokens.color.paper.base[mode]
    // every series color clears non-text 3:1 on its ground
    for (const [n, cut] of Object.entries(tokens.color.chart.series)) {
      const ratio = contrast(cut[mode], ground)
      assert.ok(ratio >= 3, `chart series ${n} ${cut[mode]} is ${ratio.toFixed(2)}:1 on ${mode} ground ${ground}`)
    }
    // sequential ramp is monotonic in emphasis: contrast vs ground strictly rises 1→5
    let prev = 0
    for (const n of [1, 2, 3, 4, 5]) {
      const ratio = contrast(tokens.color.chart.seq[n][mode], ground)
      assert.ok(ratio > prev, `chart seq ${n} breaks monotonic emphasis on ${mode} (${ratio.toFixed(2)} <= ${prev.toFixed(2)})`)
      prev = ratio
    }
    // diverging poles carry the signal (>=3:1); the midpoint recedes toward the ground
    const div = tokens.color.chart.div
    for (const n of [1, 5]) {
      const ratio = contrast(div[n][mode], ground)
      assert.ok(ratio >= 3, `chart div pole ${n} ${div[n][mode]} is ${ratio.toFixed(2)}:1 on ${mode}`)
    }
    assert.ok(
      contrast(div[3][mode], ground) < contrast(div[1][mode], ground),
      `diverging midpoint should recede vs poles on ${mode}`,
    )
  }
})
