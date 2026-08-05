import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { ALL_USAGE } from '../src/usage/index.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const storiesDir = join(root, 'src/stories')

export function storyFileFor(name) {
  const pascal = name.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join('')
  const candidates = [
    join(storiesDir, `${name}.stories.tsx`),
    join(storiesDir, `${pascal}.stories.tsx`),
    join(storiesDir, 'patterns', `${pascal}.stories.tsx`),
  ]
  return candidates.find(existsSync)
}

test('every usage file has a story file', () => {
  for (const u of ALL_USAGE) {
    assert.ok(storyFileFor(u.name), `usage '${u.name}' has no story file under src/stories`)
  }
})

test('every visual rule has a rendered DoDont pair in its story file', () => {
  for (const u of ALL_USAGE) {
    const file = storyFileFor(u.name)
    if (!file) continue
    const source = readFileSync(file, 'utf8')
    for (const r of u.rules.filter((r) => r.visual)) {
      assert.ok(
        source.includes(`id="${r.id}"`),
        `story for '${u.name}' renders no DoDont pair for visual rule '${r.id}'`,
      )
    }
  }
})
