import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { renderCss } from './build-tokens.mjs'
import { tokens } from '../src/tokens/quill.tokens.mjs'

// Quill carried a second vocabulary beside the colour contract (`--surface-card`
// is `--card`, `--text-strong` is `--foreground`). No shipped component and no
// utility ever used it, yet DESIGN.md told agents to "reach for these" — along
// with three names that never existed. Retired in 0.10.0: still emitted so an
// app that wrote `var(--text-strong)` keeps its colour, gone everywhere an agent
// could learn it from.
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const names = Object.keys(tokens.deprecated)
const re = new RegExp(`--(${names.join('|')})(?![a-z0-9-])`, 'g')

test('the retired names still ship, so nothing downstream loses a colour', () => {
  const { root: css } = renderCss(tokens)
  assert.equal(names.length, 10)
  for (const n of names) assert.match(css, new RegExp(`--${n}:\\s*var\\(`), `--${n} should still be emitted`)
})

test('no code in this repo uses a retired name', () => {
  const DIRS = ['registry/blocks', 'registry/lib', 'registry/examples', 'src/components', 'src/app', 'src/stories', 'src/usage']
  const hits = []
  let files = 0
  for (const dir of DIRS) {
    for (const f of readdirSync(join(root, dir), { recursive: true })) {
      if (!/\.(tsx|ts|mdx|mjs)$/.test(f)) continue
      files++
      for (const m of readFileSync(join(root, dir, f), 'utf8').matchAll(re)) hits.push(`${join(dir, f)}: ${m[0]}`)
    }
  }
  assert.ok(files > 150, `expected 150+ files, read ${files}`)
  assert.deepEqual([...new Set(hits)], [])
})

test('no agent-facing document names a retired or never-existing token', () => {
  const never = ['--text-muted', '--text-accent', '--accent-pressed'] // DESIGN.md listed these; none ever shipped
  for (const doc of ['DESIGN.md', 'PRODUCT.md', 'AGENTS.md', 'README.md', 'public/llms.txt', 'registry/agent-rules/quill.md']) {
    const text = readFileSync(join(root, doc), 'utf8')
    assert.deepEqual([...new Set([...text.matchAll(re)].map((m) => m[0]))], [], `${doc} still teaches a retired name`)
    for (const n of never) assert.equal(new RegExp(n.replace(/-/g, '\\-') + '(?![a-z0-9-])').test(text), false, `${doc} names ${n}, which never existed`)
  }
})
