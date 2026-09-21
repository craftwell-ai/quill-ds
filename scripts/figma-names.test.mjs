import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { renderDtcg, cssVarName } from './build-tokens.mjs'
import { tokens } from '../src/tokens/quill.tokens.mjs'

// One token had three spellings: `color/paper/base` in Figma, `--paper` in CSS,
// `bg-paper` as a class. Since 0.10.0 a Figma variable is the CSS name with one
// group level (`color/paper`), and the colour contract is `semantic/*` — Quill's
// own name for it, not the name of the library its role names came from. The rule
// lives in build-tokens (the export carries every name); these tests hold it.
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const DTCG = renderDtcg(tokens)
const fig = (tok) => tok.$extensions?.['com.figma']

function named(node, out = []) {
  for (const v of Object.values(node)) {
    if (!v || typeof v !== 'object') continue
    if (fig(v)?.name) out.push(fig(v))
    else named(v, out)
  }
  return out
}
const all = [...named(DTCG.Primitives), ...named(DTCG.Theme), ...named(DTCG.Deprecated)]

test('a colour variable is its CSS name with one group level', () => {
  let checked = 0
  const walk = (node, path) => {
    for (const [k, v] of Object.entries(node)) {
      if (v.$type === 'color') {
        assert.equal(fig(v).name, 'color/' + cssVarName([...path, k]).slice(2))
        assert.equal(fig(v).name.split('/').length, 2, `${fig(v).name}: one group level keeps the picker grouped without a second spelling`)
        checked++
      } else walk(v, [...path, k])
    }
  }
  walk(DTCG.Primitives.color, [])
  assert.ok(checked >= 35, `expected 35+ colour leaves, checked ${checked}`)
  assert.equal(fig(DTCG.Primitives.spacing['2.5']).name, 'space/2_5') // --space-2_5
  assert.equal(fig(DTCG.Primitives.radius.lg).name, 'radius/lg') // --radius-lg
  assert.equal(fig(DTCG.Primitives.type.sm).name, 'text/sm') // --text-sm
  assert.equal(fig(DTCG.Primitives.borderWidth[1]).name, 'border-width/1')
})

test('the colour contract is one group named semantic, and nothing is called shadcn', () => {
  assert.equal(tokens.shadcn, undefined)
  assert.deepEqual(Object.keys(DTCG.Theme), ['semantic'])
  assert.equal(Object.keys(tokens.semantic).length, 31)
  assert.equal(Object.keys(DTCG.Theme.semantic).length, 31 + Object.keys(tokens.status).length)
  for (const [k, tok] of Object.entries(DTCG.Theme.semantic)) assert.equal(fig(tok).name, `semantic/${k}`)
  assert.equal(all.filter((f) => /shadcn/.test(f.name)).length, 0)
})

test('no two variables share a name, and a legacy name is never also a new one', () => {
  const names = all.map((f) => f.name)
  assert.deepEqual(names.filter((n, i) => names.indexOf(n) !== i), [])
  const legacy = all.map((f) => f.legacyName).filter(Boolean)
  // `text/*` is the one reused prefix: it was Quill's text roles (Semantic
  // collection), it is now the type sizes (Primitives). No name is in both sets.
  assert.deepEqual(legacy.filter((n) => names.includes(n)), [])
})

test('every Figma variable name the repo records is one the export produces', () => {
  const recorded = Object.values(JSON.parse(readFileSync(join(root, 'figma/sync-state.json'), 'utf8')).variables)
  assert.ok(recorded.length > 100)
  const names = new Set(all.map((f) => f.name))
  // shadow/* layers and tint/* alphas have no CSS name; the sync names them itself.
  const unknown = recorded.filter((n) => !names.has(n) && !/^(shadow|tint)\//.test(n))
  assert.deepEqual(unknown, [], 'sync-state.json names a variable the export does not — re-run the rename, or the parity bot reads a stale label')
})

test('the sync renames a legacy variable in place instead of creating a twin', () => {
  const snippet = readFileSync(join(root, 'figma/sync-foundations.figma.js'), 'utf8')
  const start = snippet.indexOf('const figmaName = ')
  const end = snippet.indexOf('\n}\n', snippet.indexOf('function adopt(')) + 3
  const { adopt, count } = new Function(`${snippet.slice(start, end)}\nreturn { adopt, count: () => renamed }`)()
  const tok = DTCG.Primitives.color.paper.warm
  const legacyVar = { id: 'VariableID:1:1', name: 'color/paper/warm' }
  const existing = { 'color/paper/warm': legacyVar }
  assert.equal(adopt(existing, tok), 'color/paper-warm')
  assert.equal(existing['color/paper-warm'], legacyVar, 'same object, same id: bindings survive')
  assert.equal(legacyVar.name, 'color/paper-warm')
  assert.equal(existing['color/paper/warm'], undefined)
  assert.equal(count(), 1)
  // Second run: already renamed, nothing to do.
  assert.equal(adopt(existing, tok), 'color/paper-warm')
  assert.equal(count(), 1)
})

test('no hand-written Figma tooling still speaks a legacy name', () => {
  const legacy = [...new Set(all.map((f) => f.legacyName).filter(Boolean))].sort((a, b) => b.length - a.length)
  const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp('(?<![A-Za-z0-9_/.@-])(' + legacy.map(esc).join('|') + ')(?![A-Za-z0-9_/-])', 'g')
  const files = [
    ...readdirSync(join(root, 'figma')).filter((f) => /\.(js|md|json)$/.test(f)).map((f) => join('figma', f)),
    'figma/components/README.md', 'scripts/figma-drift.mjs', 'scripts/figma-drift.test.mjs', 'scripts/figma-stamp.mjs', 'scripts/DRIFT-AUDIT.md',
    '.claude/skills/figma-pull/SKILL.md', '.claude/skills/figma-push/SKILL.md',
  ].filter((f) => existsSync(join(root, f)))
  const hits = []
  for (const f of files) for (const m of readFileSync(join(root, f), 'utf8').matchAll(re)) hits.push(`${f}: ${m[1]}`)
  assert.deepEqual([...new Set(hits)], [])
})
