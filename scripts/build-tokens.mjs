import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { tokens } from '../src/tokens/quill.tokens.mjs'
import { MODES, DEFAULT_ACCENT } from '../src/tokens/themes.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const START = '/* @quill-tokens:start */'
const END = '/* @quill-tokens:end */'

// Non-default theme modes. `light` (Dawn) is the default and lives directly in :root;
// each mode here gets prefixed copies of every color/shadow token in :root plus a
// [data-theme="<attr>"] block that remaps the base vars — so every alias downstream
// (semantic, shadcn, Tailwind utilities) resolves per-theme for free.
// Theme metadata moved to src/tokens/themes.mjs so the browser can read it too
// (this file imports node:fs, so Storybook and app UI can never import it).
// Re-exported here because every existing caller imports MODES from this module.
export { MODES, DEFAULT_MODE, ALL_MODES, DEFAULT_ACCENT } from '../src/tokens/themes.mjs'


// 'pigment' is a grouping namespace, not part of the CSS var name.
// Trailing 'base' is the default leaf — also dropped.
export function cssVarName(path) {
  let parts = path.filter(p => p !== 'pigment') // grouping-only namespace stripped from var names; add future grouping-only namespaces here
  if (parts[parts.length - 1] === 'base') parts = parts.slice(0, -1)
  return '--' + parts.join('-')
}

// Walk color/shadow primitive groups, calling fn(varName, modeValue) for each leaf.
function walkModal(group, prefix, fn) {
  for (const [key, val] of Object.entries(group)) {
    if (val && typeof val === 'object' && 'light' in val && 'dark' in val) {
      fn(cssVarName([...prefix, key]), val)
    } else if (val && typeof val === 'object') {
      walkModal(val, [...prefix, key], fn)
    }
  }
}

// Every alias that ships as a plain variable: the retired names (still emitted,
// see the token source), the status roles, then the contract.
const aliasGroups = (t) => [...Object.entries(t.deprecated), ...Object.entries(t.status), ...Object.entries(t.semantic)]

export function renderCss(t) {
  const rootLines = []
  const prefixedLines = []
  const modeLines = Object.fromEntries(MODES.map((m) => [m.key, []]))

  // Emit one leaf: --name (light) in :root, a prefixed copy per mode, and a
  // remap line inside each mode's [data-theme] block.
  const emitLeaf = (name, leaf) => {
    rootLines.push(`  ${name}: ${leaf.light};`)
    for (const m of MODES) {
      prefixedLines.push(`  --${m.prefix}-${name.slice(2)}: ${leaf[m.key]};`)
      modeLines[m.key].push(`  ${name}: var(--${m.prefix}-${name.slice(2)});`)
    }
  }
  walkModal(t.color, [], emitLeaf)
  for (const [key, leaf] of Object.entries(t.shadow)) {
    emitLeaf(key === 'base' ? '--shadow' : `--shadow-${key}`, leaf)
  }
  // Motion + fraunces (mode-independent).
  const motion = {
    '--ease-out': t.motion.easeOut, '--ease-soft': t.motion.easeSoft,
    '--dur-fast': t.motion.durFast, '--dur': t.motion.dur, '--dur-slow': t.motion.durSlow,
    '--lift': t.motion.lift, '--lift-sm': t.motion.liftSm,
  }
  for (const [k, v] of Object.entries(motion)) rootLines.push(`  ${k}: ${v};`)
  for (const [k, v] of Object.entries(t.fraunces)) rootLines.push(`  --fraunces-${k}: ${v};`)
  // Semantic + shadcn aliases + radius base. Alias lines are ALSO re-declared
  // inside every [data-theme] block below: a custom property that references
  // another (`--background: var(--paper)`) resolves where it is DECLARED, so an
  // alias resolved at :root ignores a remap on a nested data-theme island.
  // Re-declaring at the themed element makes scoped theming work — a
  // `<div data-theme="dusk">` island inside a Dawn page — not just the
  // <html>-level switch. The accent defaults ride along for the same reason
  // (an island re-cuts the default accent to its own theme; pair a
  // data-accent attribute with data-theme for accented islands).
  const accentDefaultLines = [
    `  --accent-pigment: ${t.accents[DEFAULT_ACCENT].base};`,
    `  --accent-pigment-text: ${t.accents[DEFAULT_ACCENT].text};`,
  ]
  const aliasLines = [
    ...accentDefaultLines,
    ...aliasGroups(t).map(([k, v]) => `  --${k}: ${v};`),
  ]
  rootLines.push(...accentDefaultLines)
  rootLines.push(...[...Object.entries(t.deprecated), ...Object.entries(t.status)].map(([k, v]) => `  --${k}: ${v};`))
  rootLines.push(`  --radius: ${t.radiusBase};`)
  // Spacing + border-width (documented scales; kept in :root, not @theme, so they
  // don't collide with Tailwind's built-in numeric utilities).
  // Dots are illegal in CSS custom-property names — a half-step key like "2.5"
  // must emit `--space-2_5`, or a strict minifier (LightningCSS, used by the
  // production build + downstream consumers) throws and drops the whole :root block.
  for (const [k, v] of Object.entries(t.spacing)) rootLines.push(`  --space-${String(k).replace(/\./g, '_')}: ${v};`)
  for (const [k, v] of Object.entries(t.borderWidth)) rootLines.push(`  --border-width-${k}: ${v};`)
  // In :root as well as @theme: `@theme inline` writes a value into its utility
  // and never emits the variable, and the base layer (body, h1–h6) reads these.
  for (const [k, v] of Object.entries(t.leading)) rootLines.push(`  --leading-${k}: ${v};`)
  for (const [k, v] of Object.entries(t.tracking)) rootLines.push(`  --tracking-${k}: ${v};`)
  for (const [k, v] of Object.entries(t.semantic)) rootLines.push(`  --${k}: ${v};`)

  // @theme inline: fonts, color mappings, radii, type scale.
  const themeLines = []
  themeLines.push(`  --font-sans: ${t.font.sans};`)
  themeLines.push(`  --font-display: ${t.font.display};`)
  themeLines.push(`  --font-heading: ${t.font.heading};`)
  themeLines.push(`  --font-mono: ${t.font.mono};`)
  themeLines.push(`  --font-ui: ${t.font.ui};`)
  themeLines.push(`  --font-data: ${t.font.data};`)
  for (const k of Object.keys(t.semantic)) themeLines.push(`  --color-${k}: var(--${k});`)
  // Status roles get a class too. A key that starts with `text-` would produce
  // `text-text-accent-color`, so it stays a variable (the theme applies it).
  for (const k of Object.keys(t.status)) if (!k.startsWith('text-')) themeLines.push(`  --color-${k}: var(--${k});`)
  const paletteMap = {
    paper: '--paper', 'paper-warm': '--paper-warm', 'paper-deep': '--paper-deep',
    ink: '--ink', 'ink-soft': '--ink-soft', 'ink-muted': '--ink-muted',
    terracotta: '--terracotta', 'terracotta-deep': '--terracotta-deep',
    moss: '--moss', 'moss-deep': '--moss-deep',
    // Spelled like the variable: Tailwind only defines numbered indigo shades
    // (`indigo-500`), so the plain stem is free, exactly as `teal` below.
    indigo: '--indigo', 'indigo-deep': '--indigo-deep',
    // Deprecated spelling, kept so an app already on it keeps its colour.
    'indigo-brand': '--indigo', 'indigo-brand-deep': '--indigo-deep',
    // gold-text is a third cut, not a shade: gold-deep can't carry TEXT duty on
    // light grounds (3.3:1 on Dawn). Without a utility here, `text-gold-text` in
    // ToneBadge compiled to nothing and the AA fix was inert.
    gold: '--gold', 'gold-deep': '--gold-deep', 'gold-text': '--gold-text',
    teal: '--teal', 'teal-deep': '--teal-deep',
    // The accent's AA text cut. Without a utility, DESIGN.md's own eyebrow recipe
    // and stats-band had to reach it through a bracketed `text-[var(…)]`.
    'accent-pigment-text': '--accent-pigment-text',
  }
  for (const [k, v] of Object.entries(paletteMap)) themeLines.push(`  --color-${k}: ${`var(${v})`};`)
  for (const [k, v] of Object.entries(t.radius)) themeLines.push(`  --radius-${k}: ${v};`)
  // Tailwind's own key for a size's line height (`--text-sm--line-height`), so the
  // `text-*` utilities pick it up with no new class to learn.
  for (const [k, v] of Object.entries(t.text)) {
    themeLines.push(`  --text-${k}: ${v};`)
    if (t.textLeading[k]) themeLines.push(`  --text-${k}--line-height: ${t.textLeading[k]};`)
  }
  for (const [k, v] of Object.entries(t.leading)) themeLines.push(`  --leading-${k}: ${v};`)
  for (const [k, v] of Object.entries(t.tracking)) themeLines.push(`  --tracking-${k}: ${v};`)
  // Shadow utilities route through the :root tokens (remapped in dark) —
  // without these, Tailwind's shadow-* fall back to its cool-black defaults
  // and never flip in dark mode. Tailwind's 7-step scale maps onto our 5.
  const shadowMap = {
    '2xs': '--shadow-xs', xs: '--shadow-xs', sm: '--shadow-sm', md: '--shadow',
    lg: '--shadow-lg', xl: '--shadow-pop', '2xl': '--shadow-pop',
  }
  for (const [k, v] of Object.entries(shadowMap)) themeLines.push(`  --shadow-${k}: var(${v});`)

  // Aliases re-resolve against the remapped primitives on the themed element.
  for (const m of MODES) modeLines[m.key].push(...aliasLines)

  return {
    theme: themeLines.join('\n'),
    root: [...rootLines, ...prefixedLines].join('\n'),
    // `dark` kept as a named field (first mode) for existing callers/tests.
    dark: modeLines.dark.join('\n'),
    modes: MODES.map((m) => ({ attr: m.attr, colorScheme: m.colorScheme, body: modeLines[m.key].join('\n') })),
    accents: Object.entries(t.accents).map(([name, a]) => ({
      name,
      body: `  --accent-pigment: ${a.base};\n  --accent-pigment-text: ${a.text};`,
    })),
  }
}

// Every [data-theme="…"] block, in MODES order, then the [data-accent="…"] blocks.
function modeBlocks(css) {
  const themes = css.modes
    .map((m) => `[data-theme="${m.attr}"] {\n  color-scheme: ${m.colorScheme};\n\n${m.body}\n}`)
    .join('\n\n')
  const accents = css.accents
    .map((a) => `[data-accent="${a.name}"] {\n${a.body}\n}`)
    .join('\n\n')
  return `${themes}\n\n${accents}`
}

export function injectMarkers(source, block) {
  const s = source.indexOf(START)
  const e = source.indexOf(END)
  if (s === -1 || e === -1) throw new Error('markers not found')
  return source.slice(0, s + START.length) + '\n' + block + '\n' + source.slice(e)
}

// Tailwind's `dark:` variant must fire on EVERY theme whose color-scheme is
// dark, and this list is derived from MODES rather than hand-kept. It was
// hand-kept once: the intelligent theme shipped with 80 `dark:` utilities
// silently rendering their light treatment on a near-black ground, because the
// selector still named only two of the three dark themes. A sixth theme now
// joins automatically.
// Apps get it too, through the registry item's `css` field (the CLI writes an
// at-rule into the app's main stylesheet, where Tailwind processes it). It cannot
// ride in the theme FILE: that is imported from a layout, outside the Tailwind
// entry, so a file-channel app adds the line by hand (theme-docs.mjs says so).
// `stockClass` keeps `.dark *` in the rule: Tailwind honours the LAST definition
// of a custom variant, and an app toggling shadcn's stock class must keep working.
export function darkVariant(modes = MODES, { stockClass = false } = {}) {
  const dark = modes.filter((m) => m.colorScheme === 'dark')
  const selector = [...(stockClass ? ['.dark *'] : []), ...dark.map((m) => `[data-theme="${m.attr}"] *`)].join(', ')
  return `@custom-variant dark (&:is(${selector}));`
}

export function registryBlock(css) {
  return `:root {\n${css.root}\n}\n\n${modeBlocks(css)}`
}

// --- shadcn registry payload (the channel that actually reaches an app) ---
//
// A Tailwind v4 `@theme` block only produces utilities when it sits in the SAME
// stylesheet as `@import "tailwindcss"`. The theme file we ship is imported
// separately from the consumer's layout.tsx, so an `@theme` block inside it is
// inert — verified in a clean Next 16 + Tailwind v4 app, three wirings.
//
// shadcn's own delivery channel does not have that problem: the CLI merges
// `cssVars` and `css` into the app's MAIN stylesheet. `cssVars.theme` IS the
// `@theme` block. `cssVars` has only three buckets though (theme/light/dark) and
// Quill has five [data-theme] modes and four [data-accent] blocks, so those ride
// in `css`, which takes arbitrary selectors.
//
// Spec item W19 / decision D8. Verified end-to-end: installed into a scaffolded
// app with the real CLI, `font-heading`, `text-2xs` and every pigment compile.
// Two key shapes, and the difference is load-bearing. `cssVars` keys are
// written BARE (`paper`) because the CLI prepends `--` when it merges them into
// `:root` / `@theme`. `css` keys are literal property names the CLI writes
// verbatim, so they must carry the `--` themselves — with bare keys the CLI
// emitted `paper: var(--dk-paper);` inside every [data-theme] and [data-accent]
// block, which browsers drop, so a CLI-installed app could not switch theme or
// accent through the merged CSS (verified with the real CLI, 2026-09-14).
function decls(block, { keepPrefix = false } = {}) {
  return Object.fromEntries(
    block
      .split('\n')
      // `_` too: `--space-2_5`. Without it the three half-steps never reached a CLI-installed app.
      .map((l) => l.match(/^\s*--([a-z0-9_-]+)\s*:\s*(.+);\s*$/))
      .filter(Boolean)
      .map((m) => [keepPrefix ? `--${m[1]}` : m[1], m[2]]),
  )
}

// A third shape rule, learned the same way (real CLI, scratch app, 2026-09-21): the
// CLI registers every COLOUR in `cssVars.light` as a `--color-*` theme key. With all
// of :root there, an app got 271 classes nobody asked for (`bg-dk-paper`,
// `bg-cd-indigo-deep`, `bg-int-ink`) in the stylesheet its agents read. So
// `cssVars.light` carries only the contract roles — the keys the CLI is built to
// map, and the same ones `cssVars.theme` already asks for — and every other :root
// declaration rides in `css[':root']`, written verbatim with nothing registered.
// library-sync's merged-layer detection reads that block for the same reason.
export function registryPayload(css, t = tokens) {
  const literal = { keepPrefix: true }
  const contract = new Set([...Object.keys(t.semantic), 'radius'])
  const root = Object.entries(decls(css.root))
  return {
    cssVars: { theme: decls(css.theme), light: Object.fromEntries(root.filter(([k]) => contract.has(k))) },
    css: Object.fromEntries([
      [darkVariant(MODES, { stockClass: true }).replace(/;$/, ''), {}],
      [':root', Object.fromEntries(root.filter(([k]) => !contract.has(k)).map(([k, v]) => [`--${k}`, v]))],
      ...css.modes.map((m) => [`[data-theme="${m.attr}"]`, decls(m.body, literal)]),
      ...css.accents.map((a) => [`[data-accent="${a.name}"]`, decls(a.body, literal)]),
    ]),
  }
}

export function renderManager(t) {
  const L = (mv) => mv.light
  return {
    appBg: L(t.color.paper.base), appContentBg: L(t.color.paper.base), appPreviewBg: L(t.color.paper.base),
    barBg: L(t.color.paper.warm), inputBg: L(t.color.paper.warm),
    inputBorder: L(t.color.line.control),
    barSelectedColor: L(t.color.pigment.terracotta.base),
    colorPrimary: L(t.color.pigment.terracotta.base), colorSecondary: L(t.color.pigment.terracotta.base),
    textColor: L(t.color.ink.base), inputTextColor: L(t.color.ink.base),
    textMutedColor: L(t.color.ink.muted), barTextColor: L(t.color.ink.soft),
    barHoverColor: L(t.color.ink.base), textInverseColor: L(t.color.paper.base),
    appBorderColor: L(t.color.line.soft), appBorderRadius: 8, inputBorderRadius: 6,
  }
}

// --- DTCG / Figma token export ---
const figmaModes = (mv) => ({
  Light: mv.light,
  ...Object.fromEntries(MODES.map((m) => [m.figmaMode, mv[m.key]])),
})
const colorToken = (mv) => ({
  $type: 'color', $value: mv.light,
  $extensions: { 'com.figma': { modes: figmaModes(mv) } },
})
const dim = (v) => ({ $type: 'dimension', $value: v })
const shadow = (mv) => ({
  $type: 'shadow', $value: mv.light,
  $extensions: { 'com.figma': { modes: figmaModes(mv) } },
})
// Figma variable names follow the CSS name with ONE group level, so a designer's
// picker and an engineer's stylesheet say the same word: `--paper-warm` is
// `color/paper-warm`, `--space-2_5` is `space/2_5`. `legacyName` is what the
// variable was called before 0.10.0 — the sync finds it by that name and renames
// it in place (ids and every binding survive) instead of creating a twin.
const named = (token, name, legacyName) => {
  const ext = { ...(token.$extensions?.['com.figma'] ?? {}), name, ...(legacyName && legacyName !== name ? { legacyName } : {}) }
  return { ...token, $extensions: { ...token.$extensions, 'com.figma': ext } }
}
// The pre-0.10.0 Semantic collection bucketed Quill's own roles by prefix.
const legacyRoleName = (k) => {
  const bucket = ['text', 'surface', 'border'].find((b) => k.startsWith(b + '-')) ?? 'status'
  return `${bucket}/${bucket === 'status' ? k : k.slice(bucket.length + 1)}`
}
const other = (v) => ({ $type: 'other', $value: v, $description: 'CSS-only — not a Figma variable' })
// `calc(1.25 / 0.875)` or a bare number → the ratio itself. Figma cannot bind a
// percentage line height to a variable, so these stay out of the variable sync
// and feed the text styles, which take a percentage.
const ratio = (css) => {
  const m = css.match(/^calc\(([\d.]+)\s*\/\s*([\d.]+)\)$/)
  const n = m ? Number(m[1]) / Number(m[2]) : Number(css)
  if (!Number.isFinite(n)) throw new Error(`line height '${css}' is neither a number nor calc(a / b)`)
  return { $type: 'number', $value: n, $description: 'Line height as a ratio of the font size — read by the text styles, not a Figma variable' }
}
export function renderDtcg(t) {
  // Build lookup: CSS var name (e.g. '--terracotta-deep') → full DTCG dot-path
  // (e.g. 'Primitives.color.pigment.terracotta.deep') while walking the color tree.
  const varToDtcg = {}
  const buildMap = (obj, path) => {
    for (const [k, v] of Object.entries(obj)) {
      const nextPath = [...path, k]
      if (v && typeof v === 'object' && 'light' in v && 'dark' in v) {
        varToDtcg[cssVarName(nextPath)] = 'Primitives.color.' + nextPath.join('.')
      } else if (v && typeof v === 'object') {
        buildMap(v, nextPath)
      }
    }
  }
  buildMap(t.color, [])
  // Accent aliases are runtime-switchable (data-accent); Figma variables are
  // not, so the DTCG export pins them to the default (moss) pigment.
  varToDtcg['--accent-pigment'] = `Primitives.color.pigment.${DEFAULT_ACCENT}.base`
  varToDtcg['--accent-pigment-text'] = `Primitives.color.pigment.${DEFAULT_ACCENT}.deep`

  // var(--x) → DTCG alias using the real primitive path from the lookup map.
  const alias = (ref) => {
    const varName = ref.replace(/^var\(|\)$/g, '') // strip var( and ) → '--terracotta-deep'
    const fullPath = varToDtcg[varName]
    if (!fullPath) throw new Error(`DTCG alias not resolved: '${ref}' — '${varName}' not in primitive map`)
    return { $value: `{${fullPath}}` }
  }

  const primColor = {}
  const emit = (obj, prefix, sink) => {
    for (const [k, v] of Object.entries(obj)) {
      if (v && 'light' in v && 'dark' in v) sink[k] = named(colorToken(v), 'color/' + cssVarName([...prefix, k]).slice(2), 'color/' + [...prefix, k].join('/'))
      else { sink[k] = {}; emit(v, [...prefix, k], sink[k]) }
    }
  }
  emit(t.color, [], primColor)
  const font = Object.fromEntries(Object.entries(t.font).map(([k, v]) => [k, named({ $type: 'fontFamily', $value: v }, `font/${k}`)]))
  const us = (k) => String(k).replace('.', '_') // Figma names cannot hold a dot; neither can the CSS name
  const spacing = Object.fromEntries(Object.entries(t.spacing).map(([k, v]) => [k, named(dim(v), `space/${us(k)}`, `spacing/${us(k)}`)]))
  const radius = Object.fromEntries(Object.entries(t.radius).map(([k, v]) => [k, named(dim(v), `radius/${k}`, `corner-radius/${k}`)]))
  const borderWidth = Object.fromEntries(Object.entries(t.borderWidth).map(([k, v]) => [k, named(dim(v), `border-width/${k}`)]))
  const type = Object.fromEntries(Object.entries(t.text).map(([k, v]) => [k, named(dim(v), `text/${k}`, `type/${k}`)]))
  const lineHeight = Object.fromEntries(Object.entries(t.textLeading).map(([k, v]) => [k, ratio(v)]))
  const leading = Object.fromEntries(Object.entries(t.leading).map(([k, v]) => [k, ratio(v)]))
  // Figma takes letter spacing as a percentage of the font size: -0.03em → -3.
  const tracking = Object.fromEntries(Object.entries(t.tracking).map(([k, v]) => {
    if (!/^-?[\d.]+em$/.test(v)) throw new Error(`tracking '${v}' must be in em`)
    return [k, { $type: 'number', $value: Math.round(parseFloat(v) * 1e6) / 1e4, $description: 'Letter spacing as a percentage of the font size — read by the text styles, not a Figma variable' }]
  }))
  const elevation = Object.fromEntries(Object.entries(t.shadow).map(([k, v]) => [k, shadow(v)]))
  const motion = Object.fromEntries(Object.entries(t.motion).map(([k, v]) => [k, other(v)]))
  const fraunces = Object.fromEntries(Object.entries(t.fraunces).map(([k, v]) => [k, other(v)]))

  // One group in Figma: the contract, then the roles it has no word for.
  const Theme = { semantic: {} }
  for (const [k, v] of Object.entries(t.semantic)) Theme.semantic[k] = named(alias(v), `semantic/${k}`, `shadcn/${k}`)
  for (const [k, v] of Object.entries(t.status)) Theme.semantic[k] = named(alias(v), `semantic/${k}`, legacyRoleName(k))
  // Each tint names the Figma variable it is cut from: a contract role, else the
  // colour primitive whose CSS name it carries.
  const colourNames = new Map()
  const collectColours = (node) => { for (const v of Object.values(node)) { if (v.$type === 'color') { const n = v.$extensions['com.figma'].name; colourNames.set(n.slice('color/'.length), n) } else collectColours(v) } }
  collectColours(primColor)
  const Tints = t.tints.map(({ of, pct, text = false }) => {
    const base = of in t.semantic ? `semantic/${of}` : colourNames.get(of)
    if (!base) throw new Error(`tint '${of}/${pct}': '${of}' is neither a contract role nor a colour primitive`)
    return { name: `tint/${of}/${pct}`, base, alpha: pct / 100, cssVar: `--${of}`, text }
  })

  // Retired names are not tokens any more, so they carry no value here — only the
  // rename that parks their Figma variable under `deprecated/`, hidden from
  // publishing. Never deleted: a file that consumes the library may be bound to one.
  const Deprecated = Object.fromEntries(Object.keys(t.deprecated).map((k) => [k, named({ $description: 'Retired 0.10.0 — use the semantic contract' }, `deprecated/${k}`, legacyRoleName(k))]))

  return {
    $description: 'Quill Design System tokens (DTCG). Colors/dimensions → Figma variables; shadows → effect styles; motion/fraunces are CSS-only.',
    Primitives: { color: primColor, font, spacing, radius, borderWidth, type, lineHeight, leading, tracking, elevation, motion, fraunces },
    Theme,
    Deprecated,
    Tints,
  }
}

// --- main (not exercised by unit tests) ---
function globalsBlock(css) {
  return `${darkVariant()}\n\n@theme inline {\n${css.theme}\n}\n\n:root {\n${css.root}\n}\n\n${modeBlocks(css)}`
}

export function main() {
  const css = renderCss(tokens)
  const globalsPath = join(root, 'src/app/globals.css')
  writeFileSync(globalsPath, injectMarkers(readFileSync(globalsPath, 'utf8'), globalsBlock(css)))
  const regPath = join(root, 'registry/themes/quill.css')
  writeFileSync(regPath, injectMarkers(readFileSync(regPath, 'utf8'), registryBlock(css)))
  mkdirSync(join(root, 'src/tokens/generated'), { recursive: true })
  writeFileSync(
    join(root, 'src/tokens/generated/manager-theme.mjs'),
    `// GENERATED by scripts/build-tokens.mjs — do not edit.\nexport const managerTheme = ${JSON.stringify(renderManager(tokens), null, 2)}\n`,
  )
  mkdirSync(join(root, 'tokens'), { recursive: true })
  writeFileSync(join(root, 'tokens/quill.figma.json'), JSON.stringify(renderDtcg(tokens), null, 2) + '\n')

  // The `quill` registry item carries the token layer through shadcn's own
  // channel. registry.json is committed and partly generated (build-usage writes
  // docs/description the same way); no trailing newline, matching that writer.
  const registryPath = join(root, 'registry.json')
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'))
  const base = registry.items.find((i) => i.name === 'quill')
  if (!base) throw new Error('registry.json has no `quill` base item to attach the token payload to')
  Object.assign(base, registryPayload(css))
  writeFileSync(registryPath, JSON.stringify(registry, null, 2))
}

if (import.meta.url === `file://${process.argv[1]}`) main()
