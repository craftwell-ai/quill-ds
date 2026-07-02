import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { tokens } from '../src/tokens/quill.tokens.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const START = '/* @quill-tokens:start */'
const END = '/* @quill-tokens:end */'

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
  const dkLines = []
  const darkLines = []

  // Primitive colors: --name (light), --dk-name (dark), remap under dark.
  walkModal(t.color, [], (name, { light, dark }) => {
    rootLines.push(`  ${name}: ${light};`)
    dkLines.push(`  --dk-${name.slice(2)}: ${dark};`)
    darkLines.push(`  ${name}: var(--dk-${name.slice(2)});`)
  })
  // Shadows: same pattern.
  for (const [key, { light, dark }] of Object.entries(t.shadow)) {
    const n = key === 'base' ? '--shadow' : `--shadow-${key}`
    rootLines.push(`  ${n}: ${light};`)
    dkLines.push(`  --dk-${n.slice(2)}: ${dark};`)
    darkLines.push(`  ${n}: var(--dk-${n.slice(2)});`)
  }
  // Motion + fraunces (mode-independent).
  const motion = {
    '--ease-out': t.motion.easeOut, '--ease-soft': t.motion.easeSoft,
    '--dur-fast': t.motion.durFast, '--dur': t.motion.dur, '--dur-slow': t.motion.durSlow,
    '--lift': t.motion.lift, '--lift-sm': t.motion.liftSm,
  }
  for (const [k, v] of Object.entries(motion)) rootLines.push(`  ${k}: ${v};`)
  for (const [k, v] of Object.entries(t.fraunces)) rootLines.push(`  --fraunces-${k}: ${v};`)
  // Semantic + shadcn aliases + radius base.
  for (const [k, v] of Object.entries(t.semantic)) rootLines.push(`  --${k}: ${v};`)
  rootLines.push(`  --radius: ${t.radiusBase};`)
  // Spacing + border-width (documented scales; kept in :root, not @theme, so they
  // don't collide with Tailwind's built-in numeric utilities).
  for (const [k, v] of Object.entries(t.spacing)) rootLines.push(`  --space-${k}: ${v};`)
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

  return { theme: themeLines.join('\n'), root: [...rootLines, ...dkLines].join('\n'), dark: darkLines.join('\n') }
}

export function injectMarkers(source, block) {
  const s = source.indexOf(START)
  const e = source.indexOf(END)
  if (s === -1 || e === -1) throw new Error('markers not found')
  return source.slice(0, s + START.length) + '\n' + block + '\n' + source.slice(e)
}

export function registryBlock(css) {
  return `:root {\n${css.root}\n}\n\n[data-theme="dark"] {\n  color-scheme: dark;\n\n${css.dark}\n}`
}

export function renderManager(t) {
  const L = (mv) => mv.light
  return {
    appBg: L(t.color.paper.base), appContentBg: L(t.color.paper.base), appPreviewBg: L(t.color.paper.base),
    barBg: L(t.color.paper.warm), inputBg: L(t.color.paper.warm),
    inputBorder: t.manager.controlBorder,
    barSelectedColor: L(t.color.pigment.terracotta.base),
    colorPrimary: L(t.color.pigment.terracotta.base), colorSecondary: L(t.color.pigment.terracotta.base),
    textColor: L(t.color.ink.base), inputTextColor: L(t.color.ink.base),
    textMutedColor: L(t.color.ink.muted), barTextColor: L(t.color.ink.soft),
    barHoverColor: L(t.color.ink.base), textInverseColor: L(t.color.paper.base),
    appBorderColor: L(t.color.line.soft), appBorderRadius: 8, inputBorderRadius: 6,
  }
}

// --- DTCG / Figma token export ---
const colorToken = (light, dark) => ({
  $type: 'color', $value: light,
  $extensions: { 'com.figma': { modes: { Light: light, Dark: dark } } },
})
const dim = (v) => ({ $type: 'dimension', $value: v })
const shadow = (mv) => ({
  $type: 'shadow', $value: mv.light,
  $extensions: { 'com.figma': { modes: { Light: mv.light, Dark: mv.dark } } },
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
      if (v && 'light' in v && 'dark' in v) sink[k] = colorToken(v.light, v.dark)
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
  return `@theme inline {\n${css.theme}\n}\n\n:root {\n${css.root}\n}\n\n[data-theme="dark"] {\n  color-scheme: dark;\n\n${css.dark}\n}`
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
