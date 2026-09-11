import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { renderLlms, LLMS_PATH } from './build-llms.mjs'
import { DEFAULT_ACCENT, ALL_MODES } from './build-tokens.mjs'
import { ALL_USAGE } from '../src/usage/index.mjs'

const committed = readFileSync(LLMS_PATH, 'utf8')

test('public/llms.txt is in sync with the sources (run `npm run build:llms`)', () => {
  assert.equal(
    committed,
    renderLlms(),
    'public/llms.txt is stale — tokens or the registry changed without regenerating it. Run `npm run build:llms`.',
  )
})

test('llms.txt states the current version and default accent', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  assert.match(committed, new RegExp(`Version ${pkg.version.replace(/\./g, '\\.')}`), 'llms.txt version is stale')
  assert.match(committed, new RegExp(`${DEFAULT_ACCENT} \\(default\\)`), 'llms.txt does not name the default accent')
})

test('llms.txt carries the chart fixed-order rule and every block', () => {
  assert.match(committed, /fixed order/, 'the chart fixed-order rule must be documented for AI consumers')
  const registry = JSON.parse(readFileSync(new URL('../registry.json', import.meta.url), 'utf8'))
  for (const b of registry.items.filter((i) => i.type === 'registry:block')) {
    assert.ok(committed.includes(`/r/${b.name}.json`), `llms.txt is missing block '${b.name}'`)
  }
})

test('llms.txt links every usage guide', () => {
  for (const u of ALL_USAGE) {
    assert.ok(committed.includes(`/usage/${u.name}.md`), `llms.txt is missing the usage-guide link for '${u.name}'`)
  }
})

// The three guards below exist because llms.txt shipped `intelligent → undefined`
// for three weeks after v0.8.25 added a fifth theme: MODES gained the mode, the
// hand-kept name map beside the generator did not, and nothing failed.
test('every theme has a display name, so llms.txt can never print undefined', () => {
  for (const m of ALL_MODES) {
    assert.equal(typeof m.label, 'string', `theme '${m.attr}' has no label`)
    assert.ok(m.label.length > 0, `theme '${m.attr}' has an empty label`)
  }
})

test('llms.txt names every theme and contains no undefined', () => {
  assert.doesNotMatch(committed, /undefined/, 'llms.txt contains the literal string "undefined"')
  for (const m of ALL_MODES) {
    assert.ok(
      committed.includes(`\`${m.attr}\` → ${m.label}`),
      `llms.txt does not name the '${m.attr}' theme`,
    )
  }
})

test('the theme and accent counts in prose match the real counts', () => {
  const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
  assert.match(
    committed,
    new RegExp(`${words[ALL_MODES.length]}-theme`),
    `llms.txt prose does not say "${words[ALL_MODES.length]}-theme" for ${ALL_MODES.length} themes`,
  )
})
