import { test } from 'node:test'
import assert from 'node:assert/strict'
import { transform } from 'lightningcss'
import { renderCss, injectMarkers, cssVarName, registryBlock, renderManager, renderDtcg } from './build-tokens.mjs'
import { tokens } from '../src/tokens/quill.tokens.mjs'

test('generated CSS survives strict minification (LightningCSS) with light primitives intact', () => {
  // The production build + downstream consumers minify with LightningCSS, which THROWS on
  // invalid custom-property names (e.g. a dot in `--space-2.5`) and drops the whole :root
  // block — silently breaking light mode. This guards against any such name regressing.
  const { root, dark } = renderCss(tokens)
  const css = `:root{${root}}\n[data-theme="dark"]{${dark}}`
  const out = transform({ filename: 'quill.css', code: Buffer.from(css), minify: true }).code.toString()
  assert.match(out, /f5eddd/i, 'light --paper must survive minification')
  assert.match(out, /8a7f6e/i, 'light --line-control must survive minification')
  assert.equal(/--space-\d+\.\d+\s*:/.test(root), false, 'no dotted custom-property names')
})

test('cssVarName drops a trailing base leaf', () => {
  assert.equal(cssVarName(['paper', 'base']), '--paper')
  assert.equal(cssVarName(['paper', 'warm']), '--paper-warm')
  assert.equal(cssVarName(['pigment', 'terracotta', 'deep']), '--terracotta-deep')
})

test('renderCss reproduces primitive + dk + remap declarations', () => {
  const { theme, root, dark } = renderCss(tokens)
  assert.match(root, /--paper:\s*#F5EDDD;/)
  assert.match(root, /--dk-paper:\s*#20180E;/)
  assert.match(dark, /--paper:\s*var\(--dk-paper\);/)
  // semantic + shadcn present in :root
  assert.match(root, /--text-accent-color:\s*var\(--accent-pigment-text\);/)
  assert.match(root, /--accent-pigment-text:\s*var\(--terracotta-deep\);/)
  assert.match(root, /--destructive:\s*var\(--terracotta-deep\);/)
  // @theme mappings + scale
  assert.match(theme, /--color-terracotta:\s*var\(--terracotta\);/)
  assert.match(theme, /--radius-lg:\s*0\.5rem;/)
  assert.match(theme, /--text-xl:\s*1\.5rem;/)
})

test('registryBlock emits :root + all theme blocks, no @theme', () => {
  const css = renderCss(tokens)
  const block = registryBlock(css)
  assert.match(block, /:root \{/)
  assert.match(block, /\[data-theme="dark"\] \{/)
  assert.equal(/@theme/.test(block), false)
  assert.match(block, /--terracotta-deep: #8A4530;/)
  // classic themes ship to consumers too, with the right color-scheme
  assert.match(block, /\[data-theme="classic-light"\] \{\n  color-scheme: light;/)
  assert.match(block, /\[data-theme="classic-dark"\] \{\n  color-scheme: dark;/)
})

test('renderCss emits prefixed vars + remaps for the classic modes', () => {
  const { root, modes } = renderCss(tokens)
  assert.match(root, /--cl-paper:\s*#FFFFFF;/)
  assert.match(root, /--cd-paper:\s*#000000;/)
  assert.match(root, /--cl-terracotta:\s*#DE501B;/)
  const byAttr = Object.fromEntries(modes.map((m) => [m.attr, m]))
  assert.match(byAttr['classic-light'].body, /--paper:\s*var\(--cl-paper\);/)
  assert.match(byAttr['classic-dark'].body, /--shadow-pop:\s*var\(--cd-shadow-pop\);/)
  assert.equal(byAttr['dark'].body, renderCss(tokens).dark)
})

test('DTCG color tokens carry all four Figma modes', () => {
  const d = renderDtcg(tokens)
  const paper = d.Primitives.color.paper.base
  assert.equal(paper.$extensions['com.figma'].modes['Classic Light'], '#FFFFFF')
  assert.equal(paper.$extensions['com.figma'].modes['Classic Dark'], '#000000')
})

test('accent blocks emit after theme blocks so the chosen accent wins on <html>', () => {
  const css = renderCss(tokens)
  const block = registryBlock(css)
  for (const name of ['terracotta', 'moss', 'indigo', 'gold']) {
    assert.match(block, new RegExp(`\\[data-accent="${name}"\\] \\{`))
  }
  assert.match(block, /\[data-accent="gold"\] \{\n  --accent-pigment: var\(--gold-deep\);\n  --accent-pigment-text: var\(--gold-text\);/)
  // theme blocks re-declare the DEFAULT accent (island safety); source order
  // must put accent blocks after theme blocks so [data-accent] still wins.
  assert.ok(block.lastIndexOf('[data-theme=') < block.indexOf('[data-accent='))
  // gold's AA text cut exists as a primitive in :root
  assert.match(css.root, /--gold-text:\s*#826637;/)
})

test('theme blocks re-declare aliases so nested data-theme islands re-resolve', () => {
  // `--background: var(--paper)` resolves where declared — without these lines a
  // scoped `<div data-theme="dark">` would remap primitives but keep :root-resolved
  // alias values (light card colors on a dark island).
  const { modes } = renderCss(tokens)
  for (const m of modes) {
    assert.match(m.body, /--background:\s*var\(--paper\);/, `${m.attr} missing shadcn alias re-declare`)
    assert.match(m.body, /--surface-page:\s*var\(--paper\);/, `${m.attr} missing semantic alias re-declare`)
  }
})

test('injectMarkers replaces only between markers and is idempotent', () => {
  const src = 'A\n/* @quill-tokens:start */\nOLD\n/* @quill-tokens:end */\nB\n'
  const out1 = injectMarkers(src, 'NEW')
  assert.equal(out1, 'A\n/* @quill-tokens:start */\nNEW\n/* @quill-tokens:end */\nB\n')
  assert.equal(injectMarkers(out1, 'NEW'), out1)
})

test('manager theme resolves literals incl. readable input border', () => {
  const m = renderManager(tokens)
  assert.equal(m.inputBorder, '#8A7F6E')   // line-control light — same border as DS fields
  assert.equal(m.inputBg, '#EFE4CE')       // paper-warm light
  assert.equal(m.appBg, '#F5EDDD')         // paper light
  assert.equal(m.barSelectedColor, '#C4684B') // terracotta light
  assert.equal(m.textColor, '#2A2622')     // ink light
})

test('DTCG Primitives.font entries have fontFamily type and correct value', () => {
  const d = renderDtcg(tokens)
  assert.equal(d.Primitives.font.sans.$type, 'fontFamily')
  assert.equal(d.Primitives.font.sans.$value, tokens.font.sans)
  assert.equal(d.Primitives.font.display.$type, 'fontFamily')
  assert.equal(d.Primitives.font.display.$value, tokens.font.display)
  assert.equal(d.Primitives.font.heading.$type, 'fontFamily')
  assert.equal(d.Primitives.font.mono.$type, 'fontFamily')
})

test('DTCG export types + modes + Figma-friendly grouping', () => {
  const d = renderDtcg(tokens)
  const paper = d.Primitives.color.paper.base
  assert.equal(paper.$type, 'color')
  assert.equal(paper.$extensions['com.figma'].modes.Light, '#F5EDDD')
  assert.equal(paper.$extensions['com.figma'].modes.Dark, '#20180E')
  assert.equal(d.Primitives.radius.lg.$type, 'dimension')
  assert.equal(d.Primitives.elevation.pop.$type, 'shadow')
  // motion is explicitly non-variable
  assert.equal(d.Primitives.motion.dur.$type, 'other')
  // semantic aliases must resolve to real $type-bearing leaves in the document
  const resolveAlias = (val) => {
    const match = val.match(/^\{(.+)\}$/)
    assert.ok(match, `$value '${val}' is not a DTCG alias reference`)
    return match[1].split('.').reduce((node, seg) => {
      assert.ok(node && typeof node === 'object', `path segment '${seg}' not found in document`)
      return node[seg]
    }, d)
  }
  // spot-check: text-accent-color must resolve to Primitives.color.pigment.terracotta.deep
  const accentAlias = d.Theme.text['text-accent-color']
  assert.equal(accentAlias.$value, '{Primitives.color.pigment.terracotta.deep}')
  const accentLeaf = resolveAlias(accentAlias.$value)
  assert.equal(accentLeaf.$type, 'color', `text-accent-color alias did not resolve to a color leaf`)
  // iterate every Theme.*.*  alias and assert it resolves to a leaf with $type
  for (const [bucket, entries] of Object.entries(d.Theme)) {
    for (const [tokenName, tokenObj] of Object.entries(entries)) {
      const leaf = resolveAlias(tokenObj.$value)
      assert.ok(
        leaf && typeof leaf.$type === 'string',
        `Theme.${bucket}['${tokenName}'] alias '${tokenObj.$value}' does not resolve to a leaf with $type`,
      )
    }
  }
})
