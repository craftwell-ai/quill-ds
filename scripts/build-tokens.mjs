import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { tokens } from '../src/tokens/quill.tokens.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const START = '/* @quill-tokens:start */'
const END = '/* @quill-tokens:end */'

// 'pigment' is a grouping namespace, not part of the CSS var name.
// Trailing 'base' is the default leaf — also dropped.
export function cssVarName(path) {
  let parts = path.filter(p => p !== 'pigment')
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

// --- main (not exercised by unit tests) ---
function globalsBlock(css) {
  return `@theme inline {\n${css.theme}\n}\n\n:root {\n${css.root}\n}\n\n[data-theme="dark"] {\n  color-scheme: dark;\n\n${css.dark}\n}`
}

export function main() {
  const css = renderCss(tokens)
  const globalsPath = join(root, 'src/app/globals.css')
  writeFileSync(globalsPath, injectMarkers(readFileSync(globalsPath, 'utf8'), globalsBlock(css)))
  // registry + manager + dtcg wired in later tasks
}

if (import.meta.url === `file://${process.argv[1]}`) main()
