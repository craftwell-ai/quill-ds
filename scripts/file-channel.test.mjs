import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { compile } from 'tailwindcss'
import { checkData } from './build-check.mjs'

// The file channel, proven. An app that installs the theme as a FILE gets every Quill
// utility (font-heading, text-2xs, the role and status classes, the pigments) and the
// dark: variant from one line — `@import "./quill-theme.css"` inside the stylesheet
// that holds `@import "tailwindcss"` — because the shipped file carries the @theme block
// and the variant since 0.12.0. Imported from a layout instead, both are inert: that
// is the trap tech-careers sat in (CRA-175), and this test keeps both facts true.
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const req = createRequire(join(root, 'package.json'))

async function buildWith(entryCss, candidates) {
  const loadStylesheet = async (id, base) => {
    if (id === 'tailwindcss') { const p = req.resolve('tailwindcss/index.css'); return { base: dirname(p), content: readFileSync(p, 'utf8') } }
    if (/^https?:/.test(id)) return { base, content: '' } // the Google Fonts import: a browser concern, not Tailwind's
    const p = resolve(base, id)
    return { base: dirname(p), content: readFileSync(p, 'utf8') }
  }
  const c = await compile(entryCss, { base: root, loadStylesheet })
  return c.build(candidates)
}
const escape = (s) => s.replace(/[^a-zA-Z0-9_-]/g, (ch) => '\\' + ch)
const resolves = (css, cls) => css.includes('.' + escape(cls))

test('imported from inside the Tailwind stylesheet, the shipped theme file makes every Quill utility live', async () => {
  const classes = checkData().quillClasses
  const css = await buildWith(`@import "tailwindcss";\n@import "./registry/themes/quill.css";\n`, classes)
  const dead = classes.filter((c) => !resolves(css, c))
  assert.deepEqual(dead, [], `${dead.length} Quill utilities produce no CSS through the file channel`)
  assert.ok(classes.length > 900, `expected the full utility set, got ${classes.length}`)
})

test('…and the dark: variant follows Quill\'s dark themes, with the stock .dark class kept', async () => {
  const css = await buildWith(`@import "tailwindcss";\n@import "./registry/themes/quill.css";\n`, ['dark:bg-paper'])
  const rule = css.match(/\.dark\\:bg-paper[^{]*/)?.[0] ?? ''
  assert.match(rule, /\.dark \*/, 'stock .dark class must keep working')
  for (const mode of ['dark', 'classic-dark', 'intelligent']) assert.match(rule, new RegExp(`\\[data-theme="${mode}"\\]`), `dark: must fire on data-theme="${mode}"`)
})

test('imported from a layout instead (outside the Tailwind stylesheet), the utilities are inert — the documented trap', async () => {
  const css = await buildWith('@import "tailwindcss";\n', ['font-heading', 'text-2xs', 'bg-background'])
  for (const c of ['font-heading', 'text-2xs', 'bg-background']) assert.ok(!resolves(css, c), `${c} should not exist without the theme in the entry`)
})

test('order matters: a stock @custom-variant dark line BELOW the import wins, so the docs say "below any such line"', async () => {
  const above = await buildWith('@import "tailwindcss";\n@custom-variant dark (&:is(.dark *));\n@import "./registry/themes/quill.css";\n', ['dark:bg-card'])
  assert.match(above.match(/\.dark\\:bg-card[^{]*/)[0], /data-theme="dark"/, 'import below the stock line: Quill wins')
  const below = await buildWith('@import "tailwindcss";\n@import "./registry/themes/quill.css";\n@custom-variant dark (&:is(.dark *));\n', ['dark:bg-card'])
  assert.doesNotMatch(below.match(/\.dark\\:bg-card[^{]*/)[0], /data-theme/, 'stock line below the import: Quill loses — the case the self-check reports')
})
