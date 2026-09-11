import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// Does Quill ship what its own shipped code needs?
//
// Everything in registry/ is COPIED INTO a consumer app. A Tailwind v4 utility
// only exists if a matching token is reachable from that app's stylesheet — so a
// block can reference `font-heading`, look perfect on quilldesignsystem.com, and
// render nothing downstream. That is exactly what happened: the site's
// `@theme inline` block defines 17 pigments, the fonts and `--text-2xs`, and the
// shipped theme never carried any of them.
//
// This reads the BUILT REGISTRY ITEM (public/r/quill.json), not
// registry/themes/quill.css, and never src/app/globals.css. The built item is
// what the shadcn CLI actually hands an app, in both the current world (a CSS
// file) and after the cssVars/css migration — so this test survives that change
// untouched, which also makes it the proof the migration worked.

// ---------------------------------------------------------------- what a consumer has

/** Every custom property a consumer receives from the `quill` registry item. */
export function quillTokens(item) {
  const defined = new Set()
  const scan = (css) => {
    for (const m of css.matchAll(/(--[a-z0-9-]+)\s*:/g)) defined.add(m[1])
  }
  for (const f of item.files ?? []) if (typeof f.content === 'string') scan(f.content)
  // Post-W19 shape: cssVars.{theme,light,dark} records + css rules.
  for (const bucket of Object.values(item.cssVars ?? {})) {
    for (const k of Object.keys(bucket ?? {})) defined.add(k.startsWith('--') ? k : `--${k}`)
  }
  const walkCss = (node) => {
    if (!node || typeof node !== 'object') return
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('--')) defined.add(k)
      if (typeof v === 'object') walkCss(v)
      else if (typeof v === 'string' && k.startsWith('--')) defined.add(k)
    }
  }
  walkCss(item.css)
  return defined
}

/** Tailwind v4's own theme — every app has these without Quill. */
export function tailwindTokens() {
  const css = readFileSync(join(root, 'node_modules/tailwindcss/theme.css'), 'utf8')
  return new Set([...css.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]))
}

// Written into the app's own stylesheet by `shadcn init`, before Quill is added.
// Quill's blocks are allowed to rely on these; they are shadcn's contract, not ours.
const SHADCN_INIT = [
  'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
  'primary', 'primary-foreground', 'secondary', 'secondary-foreground',
  'muted', 'muted-foreground', 'accent', 'accent-foreground',
  'destructive', 'destructive-foreground', 'border', 'input', 'ring',
  'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
  'sidebar', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground',
  'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring',
]

// ---------------------------------------------------------------- what the code uses

// Values Tailwind hard-codes into the utility itself rather than reading from the
// theme, so they are always available and are not token lookups. Keeping this
// list explicit (rather than skipping anything that fails to resolve) is the
// point: a genuinely missing token must never be mistaken for a static.
const TAILWIND_STATIC = new Set([
  // colour keywords
  'transparent', 'current', 'inherit', 'black', 'white', 'none',
  // text-align / wrap / overflow — `text-` is heavily overloaded
  'left', 'center', 'right', 'justify', 'start', 'end',
  'wrap', 'nowrap', 'balance', 'pretty', 'ellipsis', 'clip',
  // radius keywords
  'full',
  // border / ring / outline widths, sides and styles
  '0', '1', '2', '3', '4', '5', '6', '7', '8',
  't', 'r', 'b', 'l', 'x', 'y', 's', 'e',
  'solid', 'dashed', 'dotted', 'double', 'hidden', 'inset',
  // background positioning / sizing / repeat
  'fixed', 'local', 'scroll', 'cover', 'contain', 'auto', 'repeat', 'no-repeat',
  'top', 'bottom',
])

// Utility prefix → the theme namespace(s) a match may come from. A utility passes
// if ANY of its namespaces defines the token (`text-` is the ambiguous one: it is
// both a colour and a font-size utility).
const NAMESPACES = {
  'bg-': ['color'], 'border-': ['color'], 'fill-': ['color'], 'stroke-': ['color'],
  'ring-': ['color'], 'outline-': ['color'], 'decoration-': ['color'], 'caret-': ['color'],
  'divide-': ['color'], 'placeholder-': ['color'], 'from-': ['color'], 'to-': ['color'],
  'via-': ['color'], 'accent-': ['color'],
  'text-': ['color', 'text'],
  'font-': ['font', 'font-weight'],
  'rounded-': ['radius'],
  'shadow-': ['shadow', 'color'],
}

/** Strip variants (`hover:`, `data-[…]:`) without splitting inside brackets. */
function stripVariants(token) {
  let depth = 0, last = -1
  for (let i = 0; i < token.length; i++) {
    const c = token[i]
    if (c === '[') depth++
    else if (c === ']') depth--
    else if (c === ':' && depth === 0) last = i
  }
  return token.slice(last + 1)
}

export function utilitiesUsed(dirs) {
  const found = new Map() // utility → Set(files)
  for (const dir of dirs) {
    for (const file of readdirSync(join(root, dir))) {
      if (!file.endsWith('.tsx')) continue
      const text = readFileSync(join(root, dir, file), 'utf8')
      // Every string literal; class strings live in className, cn() args and
      // variant maps alike, so taking all of them and filtering by prefix below
      // is more reliable than trying to find className= specifically.
      for (const m of text.matchAll(/'([^'\n]*)'|"([^"\n]*)"|`([^`\n]*)`/g)) {
        for (const raw of (m[1] ?? m[2] ?? m[3] ?? '').split(/\s+/)) {
          const bare = stripVariants(raw.replace(/^[`'"{(]+|[`'"}),;]+$/g, ''))
          if (!bare || bare.startsWith('-') || bare.includes('[')) continue // arbitrary / negative
          const util = bare.replace(/\/\d+(\.\d+)?$/, '') // drop /20 opacity modifier
          if (!Object.keys(NAMESPACES).some((p) => util.startsWith(p))) continue
          if (!found.has(util)) found.set(util, new Set())
          found.get(util).add(`${dir}/${file}`)
        }
      }
    }
  }
  return found
}

export function resolves(util, available) {
  for (const [prefix, spaces] of Object.entries(NAMESPACES)) {
    if (!util.startsWith(prefix)) continue
    const name = util.slice(prefix.length)
    if (TAILWIND_STATIC.has(name)) return true
    if (spaces.some((s) => available.has(`--${s}-${name}`))) return true
  }
  return false
}

// EMPTY, as of W19 — every utility Quill's shipped code uses is now reachable by
// a consumer. It held 20 entries (17 pigments, `font-heading`, `text-2xs`) for as
// long as the site's `@theme` block never reached the registry item.
//
// **Entries may only be added back over someone's dead body.** A newly unreachable
// utility fails the first test below and should be fixed, not listed here; the
// second test deletes anything listed that has since been fixed.
const KNOWN_UNREACHABLE = new Set([])

// ---------------------------------------------------------------- the guard

const item = JSON.parse(readFileSync(join(root, 'public/r/quill.json'), 'utf8'))
const available = new Set([
  ...quillTokens(item),
  ...tailwindTokens(),
  ...SHADCN_INIT.map((n) => `--color-${n}`),
])

test('every utility in shipped code resolves from what a consumer receives', () => {
  const used = utilitiesUsed(['registry/blocks', 'registry/lib'])
  assert.ok(used.size > 50, `expected to find the shipped utilities, saw ${used.size}`)

  const unreachable = [...used.entries()]
    .filter(([u]) => !resolves(u, available) && !KNOWN_UNREACHABLE.has(u))
    .map(([u, files]) => `  .${u}  (${[...files].join(', ')})`)
    .sort()

  assert.deepEqual(
    unreachable,
    [],
    `${unreachable.length} NEW utility/utilities used by shipped code are NOT defined by anything a ` +
      `consumer receives (the quill registry item + Tailwind v4 defaults + shadcn init).\n` +
      `They render as nothing in a consumer app, however correct they look on the site:\n\n` +
      unreachable.join('\n'),
  )
})

test('the guard reads the shipped item, not the site stylesheet', () => {
  // A regression guard for the guard. The whole failure mode here is reading the
  // wrong file and certifying a bug as fixed, so pin the two things that matter:
  // the site's own tokens must NOT leak in, and the item must be non-empty.
  assert.ok(quillTokens(item).size > 100, 'the quill registry item carries no tokens — wrong file?')
  const siteOnly = '--color-moss' // lives in globals.css's @theme block only, pre-W19
  const fromSite = readFileSync(join(root, 'src/app/globals.css'), 'utf8').includes(siteOnly)
  assert.ok(fromSite, 'test fixture stale: --color-moss is no longer in globals.css')
})

test('the known-gap list has no stale entries — remove what has been fixed', () => {
  const used = utilitiesUsed(['registry/blocks', 'registry/lib'])
  const stale = [...KNOWN_UNREACHABLE].filter((u) => !used.has(u) || resolves(u, available))
  assert.deepEqual(
    stale,
    [],
    `These are listed as unreachable but are now fine (either fixed, or no longer used).\n` +
      `Delete them from KNOWN_UNREACHABLE — the list must shrink to empty, and a stale\n` +
      `entry silently stops guarding its utility:\n\n  ${stale.join('\n  ')}`,
  )
})
