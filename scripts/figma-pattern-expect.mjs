// Code-side expectation for every pattern page: what a block renders.
//
// Bundles registry/blocks/*.tsx with esbuild (tsconfig paths resolve `@/…`),
// renders each block to static markup with react-dom/server, and reads back
// the strings a designer would see (text nodes plus input placeholders and
// values) and the icon names the source names. The Figma side of the pair is
// figma/pattern-baseline.json; scripts/figma-pattern-parity.test.mjs compares.

import { build } from 'esbuild'
import { readdirSync, readFileSync, mkdirSync, writeFileSync, unlinkSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const decode = (s) => s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
const clean = (s) => decode(s).replace(/\s+/g, ' ').trim()

export function blockNames() {
  return readdirSync(join(root, 'registry/blocks')).filter((f) => f.endsWith('.tsx')).map((f) => f.replace(/\.tsx$/, ''))
}

export async function renderBlocks(blocks = blockNames()) {
  const dir = join(root, 'node_modules/.cache/figma-pattern-expect')
  mkdirSync(dir, { recursive: true })
  for (const f of readdirSync(dir)) if (f.startsWith('out-')) unlinkSync(join(dir, f))
  const entry = join(dir, 'entry.tsx')
  writeFileSync(entry, [
    "import { renderToStaticMarkup } from 'react-dom/server'",
    "import { createElement } from 'react'",
    ...blocks.map((b, i) => `import * as m${i} from ${JSON.stringify(join(root, 'registry/blocks', b + '.tsx'))}`),
    'export const html = {}',
    ...blocks.map((b, i) => `try { const C = Object.values(m${i}).find((v) => typeof v === 'function'); html[${JSON.stringify(b)}] = renderToStaticMarkup(createElement(C)) } catch (e) { html[${JSON.stringify(b)}] = { error: String(e && e.message || e) } }`),
  ].join('\n'))
  const out = join(dir, `out-${Date.now()}.mjs`)
  await build({ entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', outfile: out, jsx: 'automatic', tsconfig: join(root, 'tsconfig.json'), loader: { '.css': 'empty' }, banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" }, external: ['react', 'react-dom', 'react-dom/server', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'next', 'next/*'], logLevel: 'silent' })
  const { html } = await import(pathToFileURL(out).href)
  return html
}

// Strings a designer sees: text nodes, placeholders, input values.
export function textsOf(html) {
  // Screen-reader-only text is not drawn; a placeholder is hidden behind a value.
  const visible = html
    .replace(/<(\w+)\b[^>]*\bclass="[^"]*\bsr-only\b[^"]*"[^>]*>[\s\S]*?<\/\1>/g, '')
    .replace(/<(?:input|textarea)\b[^>]*>/g, (tag) => (/\svalue="/.test(tag) ? tag.replace(/\splaceholder="[^"]*"/, '') : tag))
  const texts = [...visible.matchAll(/>([^<>]+)</g)].map((m) => clean(m[1])).filter(Boolean)
  const attrs = [...visible.matchAll(/\s(?:placeholder|value)="([^"]*)"/g)].map((m) => clean(m[1])).filter(Boolean)
  return [...texts, ...attrs]
}

// Icons the source names — the render has no icon-name attribute.
export function iconsOf(source) {
  return [...source.matchAll(/<Icon\s+name=\{?["']([a-z_0-9]+)["']/g)].map((m) => m[1]).sort()
}

export async function expectations(blocks = blockNames()) {
  const html = await renderBlocks(blocks)
  const out = {}
  for (const b of blocks) {
    const source = readFileSync(join(root, 'registry/blocks', b + '.tsx'), 'utf8')
    out[b] = typeof html[b] === 'string' ? { texts: textsOf(html[b]), icons: iconsOf(source) } : { error: html[b]?.error ?? 'no render' }
  }
  return out
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const e = await expectations()
  console.log(JSON.stringify(e, null, 1))
}
