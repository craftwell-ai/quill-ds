import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { renderLlms, LLMS_PATH } from './build-llms.mjs'
import { DEFAULT_ACCENT } from './build-tokens.mjs'

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
