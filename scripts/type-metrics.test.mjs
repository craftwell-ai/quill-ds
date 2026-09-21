import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { tokens } from '../src/tokens/quill.tokens.mjs'

// Leading and tracking had no tokens, so every line height was a typed number:
// `leading-[1.7]` in the site, `tracking-[0.15em]` in four blocks, `line-height: 1.7`
// in both stylesheets. A value a role already names must be written as the role.
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIRS = ['registry/blocks', 'registry/lib', 'registry/examples', 'src/components/ui', 'src/app']

function sources() {
  const out = []
  for (const dir of DIRS) {
    for (const f of readdirSync(join(root, dir), { recursive: true })) {
      if (/\.(tsx|ts)$/.test(f)) out.push([join(dir, f), readFileSync(join(root, dir, f), 'utf8')])
    }
  }
  return out
}

test('no bracketed leading or tracking value where a role names it', () => {
  const files = sources()
  assert.ok(files.length > 100, `expected 100+ source files, read ${files.length}`)
  const banned = [
    ...Object.entries(tokens.leading).map(([k, v]) => [`leading-[${v}]`, `leading-${k}`]),
    ...Object.entries(tokens.tracking).map(([k, v]) => [`tracking-[${v}]`, `tracking-${k}`]),
  ]
  const hits = []
  for (const [file, src] of files) for (const [typed, role] of banned) if (src.includes(typed)) hits.push(`${file}: ${typed} → ${role}`)
  assert.deepEqual(hits, [])
})

test('the base layer reads the roles instead of typing the numbers', () => {
  for (const file of ['registry/themes/quill.css', 'src/app/globals.css']) {
    const css = readFileSync(join(root, file), 'utf8')
    const base = css.slice(css.indexOf('@layer base'))
    const typed = [...base.matchAll(/(line-height|letter-spacing):\s*(-?[\d.]+(?:em)?);/g)].map((m) => m[0])
    assert.deepEqual(typed, [], `${file} types a value a role holds`)
    assert.match(base, /line-height:\s*var\(--leading-reading\)/, `${file}: body reads --leading-reading`)
    assert.match(base, /letter-spacing:\s*var\(--tracking-display\)/, `${file}: headings read --tracking-display`)
  }
})
