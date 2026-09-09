import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tokens } from './quill.tokens.mjs'
import { MODES, renderManager } from '../../scripts/build-tokens.mjs'

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
  assert.equal(tokens.semantic.warning, 'var(--gold-text)')
})

test('every accent text cut clears WCAG 4.5:1 on every theme ground (20 combos)', () => {
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
  for (const mode of ['light', 'dark', 'classicLight', 'classicDark', 'intelligent']) {
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
        for (const mode of ['light', 'dark', 'classicLight', 'classicDark', 'intelligent']) {
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
  for (const mode of ['light', 'dark', 'classicLight', 'classicDark', 'intelligent']) {
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

test('intelligent theme: cockpit grounds, teal working status, instrument fonts (Mission Control v14)', () => {
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const lum = (hex) =>
    [1, 3, 5]
      .map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255))
      .reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0)
  const contrast = (a, b) => {
    const [x, y] = [lum(a) + 0.05, lum(b) + 0.05]
    return Math.max(x, y) / Math.min(x, y)
  }
  // The mode is wired into the build (generated CSS gets a [data-theme="intelligent"] block).
  const mode = MODES.find((m) => m.attr === 'intelligent')
  assert.ok(mode, 'MODES must include the intelligent theme')
  assert.equal(mode.colorScheme, 'dark')
  // Grounds come from the approved Mission Control v14 comp (green-tinted near-black).
  assert.equal(tokens.color.paper.base.intelligent, '#0E100D')
  assert.equal(tokens.color.ink.base.intelligent, '#E9E5D6')
  // Teal is a full pigment (the "working" status hue) — present in every mode,
  // and its deep text cut clears 4.5:1 on every theme ground.
  for (const m of ['light', 'dark', 'classicLight', 'classicDark', 'intelligent']) {
    const ratio = contrast(tokens.color.pigment.teal.deep[m], tokens.color.paper.base[m])
    assert.ok(ratio >= 4.5, `teal deep ${tokens.color.pigment.teal.deep[m]} is ${ratio.toFixed(2)}:1 on ${m} ground`)
  }
  // Run-status semantics: working = teal text cut; queued = muted ink (recedes, never signals).
  assert.equal(tokens.semantic.working, 'var(--teal-deep)')
  assert.equal(tokens.semantic.queued, 'var(--ink-muted)')
  // Instrument faces for dense operational surfaces (additive — sans/heading untouched).
  assert.ok(tokens.font.ui.includes('Inter'))
  assert.ok(tokens.font.data.includes('JetBrains Mono'))
})

// Status colors are read as TEXT, and they are read on cards and wells, not
// only on the page. Checking the page alone is what let --warning ship at
// 3.33:1 on Dawn and --info at 3.94:1 on a Dawn well: both passed a
// page-only check and failed everywhere a status label actually sits.
test('every status token clears WCAG 4.5:1 on page, card AND well in all 5 themes', () => {
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const lum = (hex) =>
    [1, 3, 5]
      .map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255))
      .reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0)
  const contrast = (a, b) => {
    const [x, y] = [lum(a) + 0.05, lum(b) + 0.05]
    return Math.max(x, y) / Math.min(x, y)
  }
  // 'var(--gold-text)' → tokens.color.pigment.gold.text; 'var(--ink-muted)' → color.ink.muted
  const resolve = (ref, mode) => {
    const parts = ref.replace(/^var\(--|\)$/g, '').split('-')
    const cut = parts.slice(1).join('-') || 'base'
    const family = tokens.color.pigment[parts[0]] ?? tokens.color[parts[0]]
    return family[cut][mode]
  }
  const STATUS = ['success', 'warning', 'danger', 'info', 'working', 'queued']
  const GROUNDS = { page: 'base', card: 'warm', well: 'deep' }
  let checked = 0
  for (const mode of ['light', 'dark', 'classicLight', 'classicDark', 'intelligent']) {
    for (const name of STATUS) {
      const cut = resolve(tokens.semantic[name], mode)
      for (const [label, paperCut] of Object.entries(GROUNDS)) {
        const ground = tokens.color.paper[paperCut][mode]
        const ratio = contrast(cut, ground)
        assert.ok(
          ratio >= 4.5,
          `status '${name}' (${cut}) is ${ratio.toFixed(2)}:1 on ${mode} ${label} ${ground} — a status label would fail AA`,
        )
        checked++
      }
    }
  }
  assert.equal(checked, 90, 'expected 6 status tokens x 3 grounds x 5 themes')
})

// The palette called itself CVD-safe and was not. Series 1/3/5 (terracotta, gold,
// moss) all sit in the red-yellow-green arc that red-green deficiency collapses,
// and all three sat at roughly one lightness — so under protanopia they merged.
// Worst measured pair before the re-cut: ΔE2000 0.34 on Classic Dark. The old
// tests checked contrast and ramp monotonicity and could not see any of it,
// because neither simulates colour vision. This one does.
test('chart series stay distinguishable under all three dichromacies (ΔE2000 ≥ 8)', () => {
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const delin = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055)
  const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
  const mul = (m, v) => m.map((r) => r[0] * v[0] + r[1] * v[1] + r[2] * v[2])
  // Viénot–Brettel–Mollon 1999: sRGB → LMS, project onto the dichromat plane, back.
  const TO_LMS = [[0.31399, 0.63951, 0.04649], [0.15537, 0.75789, 0.0867], [0.01775, 0.10944, 0.87247]]
  const FROM_LMS = [[5.47221, -4.6419, 0.16963], [-1.1252, 2.29317, -0.1678], [0.0298, -0.19318, 1.16364]]
  const SIM = {
    protanopia: [[0, 1.05118294, -0.05116099], [0, 1, 0], [0, 0, 1]],
    deuteranopia: [[1, 0, 0], [0.9513092, 0, 0.04866992], [0, 0, 1]],
    tritanopia: [[1, 0, 0], [0, 1, 0], [-0.86744736, 1.86727089, 0]],
  }
  const simulate = (hex, type) =>
    mul(FROM_LMS, mul(SIM[type], mul(TO_LMS, hex2rgb(hex).map(lin)))).map((c) =>
      delin(Math.max(0, Math.min(1, c))),
    )
  const lab = (rgb) => {
    const r = rgb.map(lin)
    const [X, Y, Z] = [[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]].map(
      (m) => m[0] * r[0] + m[1] * r[1] + m[2] * r[2],
    )
    const wp = [0.95047, 1, 1.08883]
    const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
    const [fx, fy, fz] = [f(X / wp[0]), f(Y / wp[1]), f(Z / wp[2])]
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
  }
  const dE00 = (l1, l2) => {
    const [L1, a1, b1] = l1
    const [L2, a2, b2] = l2
    const C1 = Math.hypot(a1, b1)
    const C2 = Math.hypot(a2, b2)
    const Cb = (C1 + C2) / 2
    const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)))
    const A1 = (1 + G) * a1
    const A2 = (1 + G) * a2
    const Cp1 = Math.hypot(A1, b1)
    const Cp2 = Math.hypot(A2, b2)
    const hf = (a, b) => { const x = (Math.atan2(b, a) * 180) / Math.PI; return x < 0 ? x + 360 : x }
    const h1 = Cp1 === 0 ? 0 : hf(A1, b1)
    const h2 = Cp2 === 0 ? 0 : hf(A2, b2)
    const dL = L2 - L1
    const dC = Cp2 - Cp1
    let dh = 0
    if (Cp1 * Cp2 !== 0) { dh = h2 - h1; if (dh > 180) dh -= 360; else if (dh < -180) dh += 360 }
    const dH = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin((dh * Math.PI) / 360)
    const Lb = (L1 + L2) / 2
    const Cpb = (Cp1 + Cp2) / 2
    let hb = h1 + h2
    if (Cp1 * Cp2 !== 0) { if (Math.abs(h1 - h2) > 180) hb += hb < 360 ? 360 : -360; hb /= 2 }
    const T = 1 - 0.17 * Math.cos(((hb - 30) * Math.PI) / 180) + 0.24 * Math.cos((2 * hb * Math.PI) / 180) +
      0.32 * Math.cos(((3 * hb + 6) * Math.PI) / 180) - 0.2 * Math.cos(((4 * hb - 63) * Math.PI) / 180)
    const Sl = 1 + (0.015 * (Lb - 50) ** 2) / Math.sqrt(20 + (Lb - 50) ** 2)
    const Sc = 1 + 0.045 * Cpb
    const Sh = 1 + 0.015 * Cpb * T
    const Rt = -2 * Math.sqrt(Cpb ** 7 / (Cpb ** 7 + 25 ** 7)) *
      Math.sin((60 * Math.exp(-(((hb - 275) / 25) ** 2)) * Math.PI) / 180)
    return Math.sqrt((dL / Sl) ** 2 + (dC / Sc) ** 2 + (dH / Sh) ** 2 + Rt * (dC / Sc) * (dH / Sh))
  }

  const TARGET = 8
  const series = tokens.color.chart.series
  let checked = 0
  let worst = { d: Infinity, where: '' }
  for (const mode of ['light', 'dark', 'classicLight', 'classicDark', 'intelligent']) {
    const hexes = [1, 2, 3, 4, 5].map((n) => series[n][mode])
    for (const type of Object.keys(SIM)) {
      const labs = hexes.map((h) => lab(simulate(h, type)))
      for (let i = 0; i < 5; i++) {
        for (let j = i + 1; j < 5; j++) {
          const d = dE00(labs[i], labs[j])
          if (d < worst.d) worst = { d, where: `series ${i + 1} vs ${j + 1}, ${mode}, ${type}` }
          assert.ok(
            d >= TARGET,
            `series ${i + 1} (${hexes[i]}) and ${j + 1} (${hexes[j]}) are ΔE ${d.toFixed(2)} apart ` +
              `on ${mode} under ${type} — below the ${TARGET} target, so the two series read as one colour`,
          )
          checked++
        }
      }
    }
  }
  assert.equal(checked, 150, 'expected 10 pairs x 3 deficiencies x 5 themes')
  assert.ok(worst.d >= TARGET, `worst pair: ${worst.where} at ΔE ${worst.d.toFixed(2)}`)
})
