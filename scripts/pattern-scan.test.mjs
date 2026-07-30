import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { STOCK_COMPONENTS, STRUCTURAL_STOPWORDS } from './pattern-scan-vocab.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

test('stock component vocabulary is well-formed', () => {
  assert.ok(STOCK_COMPONENTS.length >= 40, `expected the stock catalog, saw ${STOCK_COMPONENTS.length}`)
  assert.equal(new Set(STOCK_COMPONENTS).size, STOCK_COMPONENTS.length, 'duplicate entries')
  for (const n of STOCK_COMPONENTS) {
    assert.match(n, /^[a-z0-9-]+$/, `'${n}' must be lowercase kebab-case`)
  }
  for (const expected of ['button', 'dialog', 'tooltip', 'avatar', 'dropdown-menu']) {
    assert.ok(STOCK_COMPONENTS.includes(expected), `missing known stock component '${expected}'`)
  }
})

test('structural stopwords are the generic shape words only', () => {
  for (const w of ['card', 'panel', 'view', 'row', 'list']) {
    assert.ok(STRUCTURAL_STOPWORDS.includes(w), `missing stopword '${w}'`)
  }
  // A stopword that is also a real pattern name would erase that pattern.
  for (const w of STRUCTURAL_STOPWORDS) {
    assert.ok(
      !['avatar', 'ladder', 'queue', 'roster', 'feed'].includes(w),
      `'${w}' is too meaningful to be a stopword`,
    )
  }
})
