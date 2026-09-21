import { test } from 'node:test'
import assert from 'node:assert/strict'
import { transform } from 'lightningcss'
import { readFileSync } from 'node:fs'
import { renderCss, injectMarkers, cssVarName, registryBlock, registryPayload, renderManager, renderDtcg, darkVariant, MODES } from './build-tokens.mjs'
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
  assert.match(root, /--accent-pigment-text:\s*var\(--moss-deep\);/)
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
  // gold's AA text cut exists as a primitive in :root. Derived from the token
  // source, not a frozen literal: the *value* is owned by the 16-combo WCAG
  // check in quill.tokens.test.mjs, which asserts the real 4.5:1 contrast. A
  // hardcoded hex here only duplicates that check badly — it went stale through
  // two legitimate AA retunes (#826637 → #755C32 → #68522D) and turned CI red
  // for a passing design change.
  assert.match(css.root, new RegExp(`--gold-text:\\s*${tokens.color.pigment.gold.text.light};`))
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
  // spot-check: text-accent-color must resolve to Primitives.color.pigment.moss.deep
  const accentAlias = d.Theme.semantic['text-accent-color']
  assert.equal(accentAlias.$value, '{Primitives.color.pigment.moss.deep}')
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

// Two guards for the same class of bug: a value added to the token source but
// not to a hand-kept list beside it. That is how `text-gold-text` compiled to
// nothing (no palette entry) and how 80 `dark:` utilities went dead on the
// intelligent theme (selector named two of three dark themes).
test('every pigment cut has a --color-* utility mapping', () => {
  const { theme } = renderCss(tokens)
  const mapped = new Set([...theme.matchAll(/--color-[a-z0-9-]+:\s*var\((--[a-z0-9-]+)\)/g)].map((m) => m[1]))
  const missing = []
  for (const [family, cuts] of Object.entries(tokens.color.pigment)) {
    for (const cut of Object.keys(cuts)) {
      const cssVar = cut === 'base' ? `--${family}` : `--${family}-${cut}`
      if (!mapped.has(cssVar)) missing.push(cssVar)
    }
  }
  assert.deepEqual(
    missing,
    [],
    `pigment cuts with no Tailwind utility — classes referencing them compile to nothing: ${missing.join(', ')}`,
  )
  // Anti-vacuity: fail if the regex stops matching rather than silently passing.
  assert.ok(mapped.size >= 15, `expected the palette map to cover 15+ vars, matched ${mapped.size}`)
})

test('a colour utility is spelled like the CSS variable it reads', () => {
  // `bg-indigo-brand` read `--indigo`: two names for one token. ToneBadge asked
  // for the natural `bg-indigo`, got nothing, and shipped an unstyled chip
  // (0.8.29). Tailwind only defines numbered indigo shades, so the plain stem is
  // free — `teal` always shipped this way. The old names stay as aliases until
  // the apps are confirmed off them.
  const { theme } = renderCss(tokens)
  const pairs = [...theme.matchAll(/--color-([a-z0-9-]+):\s*var\(--([a-z0-9-]+)\)/g)].map((m) => [m[1], m[2]])
  const DEPRECATED_ALIASES = new Set(['indigo-brand', 'indigo-brand-deep'])
  const renamed = pairs.filter(([utility, cssVar]) => utility !== cssVar && !DEPRECATED_ALIASES.has(utility))
  assert.deepEqual(
    renamed,
    [],
    `utilities named differently from their variable — one token, two spellings: ${renamed.map(([u, v]) => `${u} → --${v}`).join(', ')}`,
  )
  const utilities = new Set(pairs.map(([utility]) => utility))
  for (const name of ['indigo', 'indigo-deep']) assert.ok(utilities.has(name), `--color-${name} should ship`)
  // Anti-vacuity: fail if the regex stops matching rather than silently passing.
  assert.ok(pairs.length >= 45, `expected 45+ colour utilities, matched ${pairs.length}`)
})

test('every type size ships the line height its utility renders', () => {
  // `text-sm` has always rendered 13.6px on a 142.857% line: Tailwind's default
  // pairing, inherited silently when Quill re-cut the sizes. Nothing declared it,
  // so Figma's text styles were typed by hand and drifted (Body/S at 160%).
  // `2xs` is Quill's own size with no pairing — it inherits, on purpose.
  const { theme } = renderCss(tokens)
  for (const size of Object.keys(tokens.text)) {
    const declared = new RegExp(`--text-${size}--line-height:\\s*([^;]+);`).exec(theme)
    if (size === '2xs') { assert.equal(declared, null, '2xs inherits its line height'); continue }
    assert.ok(declared, `--text-${size}--line-height should ship`)
    assert.equal(declared[1], tokens.textLeading[size])
  }
  // The export carries them as plain ratios so the Figma sync can write percentages.
  const d = renderDtcg(tokens)
  assert.equal(d.Primitives.lineHeight.sm.$type, 'number')
  assert.ok(Math.abs(d.Primitives.lineHeight.sm.$value - 1.25 / 0.875) < 1e-6)
  assert.equal(d.Primitives.lineHeight['5xl'].$value, 1)
  assert.equal(d.Primitives.lineHeight['2xs'], undefined)
})

test('the leading and tracking roles ship as utilities and as variables', () => {
  const { theme, root } = renderCss(tokens)
  for (const [k, v] of Object.entries(tokens.leading)) {
    assert.match(theme, new RegExp(`--leading-${k}:\\s*${v.replace('.', '\\.')};`), `leading-${k} utility`)
    // In :root too: `@theme inline` never emits a variable, and the base layer reads these.
    assert.match(root, new RegExp(`--leading-${k}:\\s*${v.replace('.', '\\.')};`), `--leading-${k} variable`)
  }
  for (const [k, v] of Object.entries(tokens.tracking)) {
    assert.match(theme, new RegExp(`--tracking-${k}:\\s*${v.replace('.', '\\.')};`), `tracking-${k} utility`)
    assert.match(root, new RegExp(`--tracking-${k}:\\s*${v.replace('.', '\\.')};`), `--tracking-${k} variable`)
  }
  const d = renderDtcg(tokens)
  assert.equal(d.Primitives.leading.reading.$value, 1.7)
  // Figma takes letter spacing as a percentage of the font size: -0.03em is -3.
  assert.equal(d.Primitives.tracking.display.$value, -3)
  assert.equal(d.Primitives.tracking.eyebrow.$value, 15)
})

test('a leading or tracking role never reuses one of Tailwind\'s own names', () => {
  // The documented scale said snug / tight / wide. Tailwind owns those with other
  // values (leading-snug is 1.375, tracking-wide 0.025em) and shipped components
  // use them, so redefining one would silently re-space text that never asked.
  // Roles are named for the text they set, which also tells an agent when to use one.
  const defaults = readFileSync(new URL('../node_modules/tailwindcss/theme.css', import.meta.url), 'utf8')
  const owned = (ns) => new Set([...defaults.matchAll(new RegExp(`--${ns}-([a-z]+):`, 'g'))].map((m) => m[1]))
  assert.ok(owned('leading').has('snug') && owned('tracking').has('tight'), 'Tailwind theme not read — guard is vacuous')
  assert.deepEqual(Object.keys(tokens.leading).filter((k) => owned('leading').has(k)), [])
  assert.deepEqual(Object.keys(tokens.tracking).filter((k) => owned('tracking').has(k)), [])
})

test('the sanctioned tints are declared in the token source and exported for Figma', () => {
  // They lived in a table inside the Figma sync snippet: a design decision (which
  // opacities the system uses on purpose) that the token source knew nothing about.
  assert.equal(tokens.tints.length, 13)
  const d = renderDtcg(tokens)
  assert.equal(d.Tints.length, tokens.tints.length)
  const names = new Set()
  const collect = (o) => { for (const v of Object.values(o)) { if (!v || typeof v !== 'object') continue; const f = v.$extensions?.['com.figma']; if (f?.name) names.add(f.name); else collect(v) } }
  collect(d.Primitives); collect(d.Theme)
  for (const t of d.Tints) {
    assert.match(t.name, /^tint\/[a-z0-9-]+\/\d+$/)
    assert.ok(names.has(t.base), `${t.name}: base '${t.base}' is not a variable the export produces`)
    assert.ok(t.alpha > 0 && t.alpha < 1)
    assert.match(t.cssVar, /^--[a-z0-9-]+$/)
  }
  const byName = Object.fromEntries(d.Tints.map((t) => [t.name, t]))
  assert.deepEqual(byName['tint/destructive/10'], { name: 'tint/destructive/10', base: 'semantic/destructive', alpha: 0.1, cssVar: '--destructive', text: false })
  assert.equal(byName['tint/moss/20'].base, 'color/moss')
  assert.equal(byName['tint/sidebar-foreground/70'].text, true) // a text tint gets text scopes in Figma
})

test('--space-N is the step Tailwind renders for p-N, so the variable and the class never disagree', () => {
  // Nothing reads --space-* (not shipped code, not the site, not the app): components
  // write `p-4`. The variables stay because they are the CSS name behind Figma's
  // `space/*` and the documented scale — which is only honest while both are 0.25rem × N.
  const defaults = readFileSync(new URL('../node_modules/tailwindcss/theme.css', import.meta.url), 'utf8')
  const step = defaults.match(/--spacing:\s*([\d.]+)rem;/)
  assert.ok(step, 'Tailwind theme not read — guard is vacuous')
  let checked = 0
  for (const [k, v] of Object.entries(tokens.spacing)) {
    assert.ok(Math.abs(parseFloat(v) - Number(k) * Number(step[1])) < 1e-9, `--space-${k} is ${v}; Tailwind's p-${k} renders ${Number(k) * Number(step[1])}rem`)
    checked++
  }
  assert.ok(checked >= 15)
})

test('the CLI payload registers no class for a primitive: cssVars.light holds only the contract', () => {
  // The shadcn CLI turns EVERY colour in `cssVars.light` into a `--color-*` theme key.
  // With all of :root there, an installed app got 271 classes nobody asked for —
  // `bg-dk-paper`, `bg-cd-indigo-deep`, `bg-int-ink` — in the stylesheet its agents
  // read (measured with the real CLI in a scratch app: 103 keys asked for, 374
  // written). Everything that is not a contract role now rides in the `css` field,
  // which the CLI writes verbatim and registers nothing for.
  const payload = registryPayload(renderCss(tokens))
  assert.deepEqual(Object.keys(payload.cssVars.light).sort(), [...Object.keys(tokens.semantic), 'radius'].sort())
  const root = payload.css[':root']
  for (const k of ['--paper', '--dk-paper', '--int-ink', '--success', '--space-4', '--leading-reading', '--shadow-xs']) assert.ok(k in root, `${k} should ride in css[':root']`)
  for (const k of Object.keys(root)) assert.match(k, /^--[a-z0-9_-]+$/)
  // Nothing dropped on the way: every :root declaration lands in exactly one place.
  const declared = [...renderCss(tokens).root.matchAll(/^\s*--([a-z0-9_-]+)\s*:/gm)].map((m) => m[1])
  const carried = new Set([...Object.keys(payload.cssVars.light), ...Object.keys(root).map((k) => k.slice(2))])
  assert.deepEqual(declared.filter((k) => !carried.has(k)), [])
  assert.equal(Object.keys(payload.cssVars.light).filter((k) => `--${k}` in root).length, 0)
})

test('the dark: variant covers every theme whose color-scheme is dark', () => {
  const selector = darkVariant()
  const dark = MODES.filter((m) => m.colorScheme === 'dark')
  const light = MODES.filter((m) => m.colorScheme !== 'dark')
  assert.ok(dark.length >= 3, `expected 3+ dark modes, found ${dark.length}`)
  for (const m of dark) {
    assert.ok(
      selector.includes(`[data-theme="${m.attr}"]`),
      `dark theme '${m.attr}' is missing from the dark: variant — every dark: utility renders its light treatment there`,
    )
  }
  for (const m of light) {
    assert.ok(!selector.includes(`[data-theme="${m.attr}"]`), `light theme '${m.attr}' must not trigger dark: utilities`)
  }
})

test('registry payload: cssVars keys are bare, css block keys carry the -- prefix', () => {
  // shadcn's CLI prepends `--` to cssVars keys but writes `css` keys verbatim.
  // With bare `css` keys it emitted `paper: var(--dk-paper);` in every theme
  // and accent block — invalid CSS, silently dropped — so a CLI-installed app
  // could not switch theme or accent. Caught with the real CLI on 2026-09-14.
  const css = renderCss(tokens)
  const payload = registryPayload(css)
  for (const [bucket, vars] of Object.entries(payload.cssVars)) {
    for (const k of Object.keys(vars)) assert.ok(!k.startsWith('--'), `cssVars.${bucket} key '${k}' must be bare`)
  }
  const selectors = Object.keys(payload.css)
  assert.equal(selectors.length, 1 + css.modes.length + css.accents.length) // ':root' + themes + accents
  for (const [selector, block] of Object.entries(payload.css)) {
    const keys = Object.keys(block)
    assert.ok(keys.length > 0, `${selector} has no declarations`)
    for (const k of keys) assert.match(k, /^--[a-z0-9_-]+$/, `${selector} key '${k}' must be a custom-property name`)
  }
  // Nothing lost in translation: the dark block carries every --var its CSS body declares.
  const darkBody = css.modes.find((m) => m.attr === 'dark').body
  const declared = [...darkBody.matchAll(/^\s*--([a-z0-9-]+)\s*:/gm)].length
  assert.equal(Object.keys(payload.css['[data-theme="dark"]']).length, declared)
  assert.equal(payload.css['[data-theme="dark"]']['--paper'], 'var(--dk-paper)')
})
