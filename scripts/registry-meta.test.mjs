import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { INTENT_TAG_NAMES } from './registry-intent-tags.mjs'
import { DEFAULT_ACCENT } from './build-tokens.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const registry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8'))
const blocks = registry.items.filter((i) => i.type === 'registry:block')

test('every block carries a machine-readable intent tag from the controlled vocabulary', () => {
  assert.ok(blocks.length >= 50, `expected the full block catalog, saw ${blocks.length}`)
  for (const b of blocks) {
    const intent = b.meta?.intent
    assert.ok(
      Array.isArray(intent) && intent.length > 0,
      `block '${b.name}' is missing meta.intent — every block must declare at least one intent tag`,
    )
    for (const tag of intent) {
      assert.ok(
        INTENT_TAG_NAMES.includes(tag),
        `block '${b.name}' uses intent '${tag}', which is not in the controlled vocabulary (scripts/registry-intent-tags.mjs)`,
      )
    }
  }
})

test('every block explains when to use it (meta.use_when)', () => {
  for (const b of blocks) {
    const useWhen = b.meta?.use_when
    assert.ok(
      typeof useWhen === 'string' && useWhen.trim().length >= 20,
      `block '${b.name}' needs a substantive meta.use_when sentence for AI/agent selection`,
    )
  }
})

test('the base theme description names the current default accent (drift guard)', () => {
  // The exact drift we hit: the base description said "terracotta accents" for
  // weeks after moss became the default. Tie the doc string to the token source
  // so a future default-accent change fails here until the copy is updated.
  const base = registry.items.find((i) => i.name === 'quill')
  assert.ok(base, 'base theme item "quill" not found in registry')
  assert.match(
    base.description,
    new RegExp(`${DEFAULT_ACCENT} accents`),
    `base description must name the default accent ('${DEFAULT_ACCENT} accents'); found: "${base.description}"`,
  )
  for (const pigment of ['terracotta', 'indigo', 'gold']) {
    if (pigment === DEFAULT_ACCENT) continue
    assert.doesNotMatch(
      base.description,
      new RegExp(`${pigment} accents`),
      `base description names '${pigment} accents' but the default accent is '${DEFAULT_ACCENT}'`,
    )
  }
})

test('the theme file tells consumers the real install URL (drift guard)', () => {
  // `registry/themes/quill.css` line 2 is the copy-paste command sitting at the
  // top of the file every consumer installs, and it is hand-maintained (it lives
  // above the @quill-tokens markers, so no generator rewrites it). It went on
  // naming `quill-ds.vercel.app` for weeks after the move to the real domain.
  const theme = readFileSync(join(root, 'registry/themes/quill.css'), 'utf8')
  const home = registry.homepage.replace(/\/$/, '')
  const installLine = theme.split('\n').find((l) => l.includes('Install:'))
  assert.ok(installLine, 'registry/themes/quill.css has no `Install:` line for consumers to copy')
  assert.ok(
    installLine.includes(`${home}/r/quill.json`),
    `the install URL must match registry.json homepage (${home}); found: "${installLine.trim()}"`,
  )
})
