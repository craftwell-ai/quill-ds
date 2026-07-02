import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { icons } from '../src/components/ui/icons.core.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ICONS_DIR = join(root, 'src/components/ui/icons')

test('core map includes usage-derived icons with viewBox + paths', () => {
  for (const name of ['check', 'search', 'close', 'warning', 'keyboard_arrow_down']) {
    assert.ok(icons[name], `missing core icon ${name}`)
    assert.match(icons[name].viewBox, /-?\d/)
    assert.ok(
      Array.isArray(icons[name].paths) && icons[name].paths.length > 0,
      `${name} has no paths`
    )
    assert.ok(icons[name].paths.every((d) => typeof d === 'string' && d.length > 0))
  }
})

test('a known lazy (non-core) icon has a generated per-icon module', async () => {
  const name = 'rocket_launch'
  assert.ok(!icons[name], `${name} should be lazy, not core`)
  const file = join(ICONS_DIR, `${name}.mjs`)
  assert.ok(existsSync(file), `missing per-icon module for ${name}`)
  assert.match(readFileSync(file, 'utf8'), /export default/)
  const mod = await import(`../src/components/ui/icons/${name}.mjs`)
  assert.match(mod.default.viewBox, /-?\d/)
  assert.ok(Array.isArray(mod.default.paths) && mod.default.paths.length > 0)
})
