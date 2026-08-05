import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

import { ALL_USAGE } from '../src/usage/index.mjs'
import { renderUsagePage, usageDocsField, USAGE_DIR, REGISTRY_PATH } from './build-usage.mjs'

test('every usage entry has a committed, current public usage page (run `npm run build:usage`)', () => {
  for (const u of ALL_USAGE) {
    const path = join(USAGE_DIR, `${u.name}.md`)
    assert.ok(existsSync(path), `public/usage/${u.name}.md is missing — run \`npm run build:usage\``)
    assert.equal(readFileSync(path, 'utf8'), renderUsagePage(u), `public/usage/${u.name}.md is stale — run \`npm run build:usage\``)
  }
})

test('registry.json carries the derived docs field, description, and use_when for documented items', () => {
  const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'))
  const byName = new Map(registry.items.map((i) => [i.name, i]))
  for (const u of ALL_USAGE) {
    const item = byName.get(u.name)
    if (!item) continue // primitives like button/dialog are not registry items
    assert.equal(item.docs, usageDocsField(u), `registry item '${u.name}' docs is stale — run \`npm run build:usage\``)
    assert.equal(item.description, u.summary, `registry item '${u.name}' description diverges from its usage file summary`)
    if (item.type === 'registry:block') {
      assert.equal(item.meta?.use_when, u.useWhen[0], `registry item '${u.name}' use_when diverges from its usage file`)
    }
  }
})
