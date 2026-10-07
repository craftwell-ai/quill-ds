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

// Keyboard focus in Windows High Contrast (CRA-294). The theme's forced-colours rule has to beat the
// `outline-none` on an app's stock fields and buttons, and it does that by position in the cascade, not by
// `!important`: Tailwind puts `outline-none` in its `utilities` layer, and CSS outside every layer beats
// every layer. So the thing to keep true is where the rule LANDS in an app's compiled stylesheet, through
// each of the two channels. (The computed outline is measured in a browser by the Forced colours story.)
const STOCK_FOCUS = ['outline-none', 'outline-hidden', 'focus-visible:ring-3', 'focus-visible:border-ring']

// The at-rules a piece of the stylesheet sits inside, outermost first.
function enclosingAtRules(css, index) {
  const stack = []
  let prelude = ''
  for (const ch of css.slice(0, index)) {
    if (ch === '{') { stack.push(prelude.trim()); prelude = '' }
    else if (ch === '}') { stack.pop(); prelude = '' }
    else if (ch === ';') prelude = ''
    else prelude += ch
  }
  return stack
}

function assertFocusRuleWins(css, channel) {
  const rules = [...css.matchAll(/:focus-visible\s*\{\s*outline:\s*2px solid Highlight;\s*outline-offset:\s*2px;?\s*\}/g)]
  assert.equal(rules.length, 1, `${channel}: the compiled stylesheet must carry the forced-colours focus rule once`)
  const around = enclosingAtRules(css, rules[0].index)
  assert.deepEqual(around, ['@media (forced-colors: active)'], `${channel}: the rule must sit inside the forced-colours query and inside no @layer`)
  // The class it has to beat is layered, which is why an unlayered rule wins without !important.
  const stock = css.search(/\.outline-none\s*\{/)
  assert.ok(stock > 0, `${channel}: expected the stock outline-none utility in the build`)
  assert.equal(enclosingAtRules(css, stock)[0], '@layer utilities', `${channel}: outline-none is expected in Tailwind's utilities layer`)
}

test('file channel: the forced-colours focus rule reaches an app outside every layer, so it beats a stock outline-none', async () => {
  const css = await buildWith(`@import "tailwindcss";\n@import "./registry/themes/quill.css";\n`, STOCK_FOCUS)
  assertFocusRuleWins(css, 'file channel')
})

test('CLI channel: the shadcn CLI writes the rule from the css payload outside every layer too', async () => {
  // shadcn's own merger, the code `npx shadcn add` runs on an app's stylesheet. It is the CLI's internal
  // module: if this import breaks after a shadcn upgrade, re-prove the CLI channel rather than skip it.
  const { transformCss } = await import('@shadcn/registry/internal/utils/updaters/update-css')
  const item = JSON.parse(readFileSync(join(root, 'public/r/quill.json'), 'utf8'))
  // The shape of a fresh shadcn app's stylesheet: it has its own base layer, which the rule must not be folded
  // into. (Only the `css` field is merged here; the colour roles ride in `cssVars`, which this test does not need.)
  const stockApp = '@import "tailwindcss";\n\n@custom-variant dark (&:is(.dark *));\n\n@layer base {\n  * {\n    outline-color: currentColor;\n  }\n}\n'
  // Merged twice, as an app that updates the theme does: the rule must not pile up.
  const merged = await transformCss(await transformCss(stockApp, item.css), item.css)
  assert.equal(merged.split('@media (forced-colors: active)').length - 1, 1, 'installing twice must not write the rule twice')
  const css = await buildWith(merged, STOCK_FOCUS)
  assertFocusRuleWins(css, 'CLI channel')
})
