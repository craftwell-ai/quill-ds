import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

import { ALL_MODES, DEFAULT_ACCENT } from '../src/tokens/themes.mjs'
import { tokens } from '../src/tokens/quill.tokens.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// Does everything that enumerates a generated set agree with the source?
//
// The Intelligent theme shipped 2026-08-26 and was still missing from FIVE
// hand-typed lists across three files sixteen days later. Everything generated
// from MODES had it on day one — both CSS cuts, the DTCG export, the whole
// contrast suite. Only the typed copies lagged, and nothing failed.
//
// Storybook's three copies were deleted (they now derive). The four below
// cannot be: each entry carries design data the token source does not own — an
// icon name, a swatch class, an inlined SVG path. So they are guarded instead.

const THEMES = ALL_MODES.map((m) => m.attr)
const ACCENTS = Object.keys(tokens.accents)

/** Pull the `value:` strings out of a named `const X = [...]` array literal. */
export function listValues(source, listName) {
  const start = source.indexOf(`${listName} = [`)
  if (start === -1) return null
  const open = source.indexOf('[', start)
  let depth = 0, end = open
  for (let i = open; i < source.length; i++) {
    if (source[i] === '[') depth++
    else if (source[i] === ']' && --depth === 0) { end = i; break }
  }
  return [...source.slice(open, end).matchAll(/value:\s*['"]([a-z-]+)['"]/g)].map((m) => m[1])
}

const SITES = [
  { file: 'registry/blocks/theme-selector.tsx', list: 'quillThemes', expected: THEMES, what: 'themes' },
  { file: 'registry/blocks/theme-selector.tsx', list: 'quillAccents', expected: ACCENTS, what: 'accents' },
  { file: 'src/app/page.tsx', list: 'THEME_OPTIONS', expected: THEMES, what: 'themes' },
  { file: 'src/app/page.tsx', list: 'ACCENT_OPTIONS', expected: ACCENTS, what: 'accents' },
]

test('every hand-typed theme/accent list matches the token source', () => {
  for (const { file, list, expected, what } of SITES) {
    const values = listValues(readFileSync(join(root, file), 'utf8'), list)
    assert.ok(values, `${file}: no \`${list} = [...]\` found — was it renamed? Update SITES.`)
    assert.deepEqual(
      [...values].sort(),
      [...expected].sort(),
      `${file} \`${list}\` does not match the ${what} the token source defines.\n` +
        `  has:      ${values.join(', ')}\n  expected: ${expected.join(', ')}`,
    )
  }
})

test('the default accent is not restated anywhere as a literal', () => {
  // Storybook previewed every story on terracotta for months after the default
  // became moss, because `defaultValue: 'terracotta'` was typed beside it.
  const files = ['.storybook/preview.tsx']
  for (const f of files) {
    const src = readFileSync(join(root, f), 'utf8')
    assert.doesNotMatch(
      src,
      /default(Value|Theme|Accent)\s*[:=]\s*['"][a-z-]+['"]/,
      `${f} hard-codes a default theme or accent. Read DEFAULT_ACCENT / DEFAULT_MODE instead — ` +
        `a literal here drifted silently from '${DEFAULT_ACCENT}' for months.`,
    )
  }
})

// ---- the broad sweep: catch a list nobody registered above ----

function sourceFiles(dir, out = []) {
  for (const name of readdirSync(join(root, dir))) {
    const rel = join(dir, name)
    if (statSync(join(root, rel)).isDirectory()) {
      if (!['node_modules', 'icons', 'assets', 'generated'].includes(name)) sourceFiles(rel, out)
    } else if (/\.(tsx|ts|mjs)$/.test(name) && !/\.(test|stories)\./.test(name)) out.push(rel)
  }
  return out
}

test('no unregistered list enumerates a partial theme or accent set', () => {
  // A named list is only guarded if SITES knows about it. This catches the next
  // one: any array literal naming 2+ themes (or accents) must name them all.
  const registered = new Set(SITES.map((s) => `${s.file}:${s.list}`))
  const offenders = []

  for (const file of [...sourceFiles('src'), ...sourceFiles('registry'), ...sourceFiles('.storybook')]) {
    const src = readFileSync(join(root, file), 'utf8')
    for (const m of src.matchAll(/(?:const|let|var)\s+(\w+)\s*=\s*\[/g)) {
      const name = m[1]
      if (registered.has(`${relative('.', file)}:${name}`)) continue
      const values = listValues(src, name) ?? []
      for (const [label, full] of [['theme', THEMES], ['accent', ACCENTS]]) {
        const hit = values.filter((v) => full.includes(v))
        // 2+ members of a known set means it is enumerating that set.
        if (hit.length >= 2 && hit.length < full.length) {
          offenders.push(
            `  ${file} \`${name}\` names ${hit.length} of ${full.length} ${label}s ` +
              `(${hit.join(', ')}) — missing ${full.filter((v) => !hit.includes(v)).join(', ')}`,
          )
        }
      }
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `Unregistered partial enumeration(s) found. Either complete the list and add it to\n` +
      `SITES in this file, or derive it from ALL_MODES / tokens.accents:\n\n${offenders.join('\n')}`,
  )
})
