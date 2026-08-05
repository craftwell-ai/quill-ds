import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { ALL_USAGE } from '../src/usage/index.mjs'
import { validateUsage } from '../src/usage/schema.mjs'

const usageDir = join(dirname(fileURLToPath(import.meta.url)), '../src/usage')

test('every usage entry passes schema validation', () => {
  for (const u of ALL_USAGE) {
    assert.deepEqual(validateUsage(u), [], `usage '${u?.name}' has schema problems`)
  }
})

test('validateUsage reports problems instead of throwing', () => {
  const problems = validateUsage({ name: 'Bad Name', kind: 'nope' })
  assert.ok(problems.length >= 2, 'expected multiple problems for a malformed entry')
})

test('the usage index exports every usage file on disk, and nothing else', () => {
  const files = readdirSync(usageDir).filter((f) => f.endsWith('.usage.mjs'))
  const indexed = new Set(ALL_USAGE.map((u) => u.name))
  for (const f of files) {
    const name = f.replace(/\.usage\.mjs$/, '')
    assert.ok(indexed.has(name), `src/usage/${f} is not exported from src/usage/index.mjs`)
  }
  assert.equal(ALL_USAGE.length, files.length, 'index exports entries with no file on disk')
})
