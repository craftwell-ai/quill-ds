import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { tokens } from '../src/tokens/quill.tokens.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const START = '/* @quill-tokens:start */'
const END = '/* @quill-tokens:end */'

// Non-default theme modes. `light` (Dawn) is the default and lives directly in :root;
// each mode here gets prefixed copies of every color/shadow token in :root plus a
// [data-theme="<attr>"] block that remaps the base vars — so every alias downstream
// (semantic, shadcn, Tailwind utilities) resolves per-theme for free.
export const MODES = [
  { key: 'dark', prefix: 'dk', attr: 'dark', colorScheme: 'dark', figmaMode: 'Dark' },
  { key: 'classicLight', prefix: 'cl', attr: 'classic-light', colorScheme: 'light', figmaMode: 'Classic Light' },
  { key: 'classicDark', prefix: 'cd', attr: 'classic-dark', colorScheme: 'dark', figmaMode: 'Classic Dark' },
]

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
    `  --accent-pigment: ${t.accents.terracotta.base};`,
    `  --accent-pigment-text: ${t.accents.terracotta.text};`,
  ]
  const aliasLines = [
    ...accentDefaultLines,
    ...Object.entries(t.semantic).map(([k, v]) => `  --${k}: ${v};`),
    ...Object.entries(t.shadcn).map(([k, v]) => `  --${k}: ${v};`),
  ]
  rootLines.push(...accentDefaultLines)
  rootLines.push(...Object.entries(t.semantic).map(([k, v]) => `  --${k}: ${v};`))
  rootLines.push(`  --radius: ${t.radiusBase};`)
  // Spacing + border-width (documented scales; kept in :root, not @theme, so they
  // don't collide with Tailwind's built-in numeric utilities).
  // Dots are illegal in CSS custom-property names — a half-step key like "2.5"
  // must emit `--space-2_5`, or a strict minifier (LightningCSS, used by the
  // production build + downstream consumers) throws and drops the whole :root block.
  for (const [k, v] of Object.entries(t.spacing)) rootLines.push(`  --space-${String(k).replace(/\./g, '_')}: ${v};`)
  for (const [k, v] of Object.entries(t.borderWidth)) rootLines.push(`  --border-width-${k}: ${v};`)
  for (const [k, v] of Object.entries(t.shadcn)) rootLines.push(`  --${k}: ${v};`)

  // @theme inline: fonts, color mappings, radii, type scale.
  const themeLines = []
  themeLines.push(`  --font-sans: ${t.font.sans};`)
  themeLines.push(`  --font-display: ${t.font.display};`)
  themeLines.push(`  --font-heading: ${t.font.heading};`)
  themeLines.push(`  --font-mono: ${t.font.mono};`)
  for (const k of Object.keys(t.shadcn)) themeLines.push(`  --color-${k}: var(--${k});`)
  const paletteMap = {
    paper: '--paper', 'paper-warm': '--paper-warm', 'paper-deep': '--paper-deep',
    ink: '--ink', 'ink-soft': '--ink-soft', 'ink-muted': '--ink-muted',
    terracotta: '--terracotta', 'terracotta-deep': '--terracotta-deep',
    moss: '--moss', 'moss-deep': '--moss-deep',
    'indigo-brand': '--indigo', 'indigo-brand-deep': '--indigo-deep',
    gold: '--gold', 'gold-deep': '--gold-deep',
  }
  for (const [k, v] of Object.entries(paletteMap)) themeLines.push(`  --color-${k}: ${`var(${v})`};`)
  for (const [k, v] of Object.entries(t.radius)) themeLines.push(`  --radius-${k}: ${v};`)
  for (const [k, v] of Object.entries(t.text)) themeLines.push(`  --text-${k}: ${v};`)
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

export function registryBlock(css) {
  return `:root {\n${css.root}\n}\n\n${modeBlocks(css)}`
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
const other = (v) => ({ $type: 'other', $value: v, $description: 'CSS-only — not a Figma variable' })
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
  // not, so the DTCG export pins them to the default (terracotta) pigment.
  varToDtcg['--accent-pigment'] = 'Primitives.color.pigment.terracotta.base'
  varToDtcg['--accent-pigment-text'] = 'Primitives.color.pigment.terracotta.deep'

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
      if (v && 'light' in v && 'dark' in v) sink[k] = colorToken(v)
      else { sink[k] = {}; emit(v, [...prefix, k], sink[k]) }
    }
  }
  emit(t.color, [], primColor)
  const font = Object.fromEntries(Object.entries(t.font).map(([k, v]) => [k, { $type: 'fontFamily', $value: v }]))
  const spacing = Object.fromEntries(Object.entries(t.spacing).map(([k, v]) => [k, dim(v)]))
  const radius = Object.fromEntries(Object.entries(t.radius).map(([k, v]) => [k, dim(v)]))
  const borderWidth = Object.fromEntries(Object.entries(t.borderWidth).map(([k, v]) => [k, dim(v)]))
  const type = Object.fromEntries(Object.entries(t.text).map(([k, v]) => [k, dim(v)]))
  const elevation = Object.fromEntries(Object.entries(t.shadow).map(([k, v]) => [k, shadow(v)]))
  const motion = Object.fromEntries(Object.entries(t.motion).map(([k, v]) => [k, other(v)]))
  const fraunces = Object.fromEntries(Object.entries(t.fraunces).map(([k, v]) => [k, other(v)]))

  const Theme = { text: {}, surface: {}, border: {}, status: {}, shadcn: {} }
  for (const [k, v] of Object.entries(t.semantic)) {
    const bucket = k.startsWith('text') ? 'text' : k.startsWith('surface') ? 'surface'
      : k.startsWith('border') ? 'border' : 'status'
    Theme[bucket][k] = alias(v)
  }
  for (const [k, v] of Object.entries(t.shadcn)) Theme.shadcn[k] = alias(v)

  return {
    $description: 'Quill Design System tokens (DTCG). Colors/dimensions → Figma variables; shadows → effect styles; motion/fraunces are CSS-only.',
    Primitives: { color: primColor, font, spacing, radius, borderWidth, type, elevation, motion, fraunces },
    Theme,
  }
}

// --- main (not exercised by unit tests) ---
function globalsBlock(css) {
  return `@theme inline {\n${css.theme}\n}\n\n:root {\n${css.root}\n}\n\n${modeBlocks(css)}`
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
}

if (import.meta.url === `file://${process.argv[1]}`) main()
