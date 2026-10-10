import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { icons } from '../src/components/ui/icons.core.mjs'
import { has, referencedIconNames } from './build-icons.mjs'

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

test('referencedIconNames sees literal props, data tables, and quoted names inside name={…}', () => {
  const text = `
    <Icon name="check" />
    const nav = [{ icon: 'dashboard' }, { icon: "settings" }]
    <Icon name={f.state === 'done' ? 'check' : 'draft'} />
    <Input name="email" />
  `
  assert.deepEqual(
    referencedIconNames(text).sort(),
    ['check', 'dashboard', 'done', 'draft', 'email', 'settings'],
  )
})

test('every icon name a shipped file references is in the core map consumers receive', () => {
  // registry/** is copied into apps, where the consumer <Icon> has only
  // icons.core.mjs and renders an unknown name as an empty box. file-upload's
  // `draft` shipped blank for weeks because the core scan saw only
  // name="literal" props — this is the guard that would have failed then.
  const files = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.tsx')) files.push(full)
    }
  }
  walk(join(root, 'registry'))
  assert.ok(files.length >= 50, `expected the shipped blocks under registry/, saw ${files.length} files`)
  const missing = []
  for (const file of files) {
    for (const name of referencedIconNames(readFileSync(file, 'utf8'))) {
      // Only real Material Symbol names matter; other quoted strings that
      // happen to sit inside a name={…} expression are not icons.
      if (has(name) && !icons[name]) missing.push(`${file.slice(root.length + 1)}: ${name}`)
    }
  }
  assert.deepEqual(missing, [], `icons referenced by shipped code but absent from icons.core.mjs — run \`npm run build:icons\`:\n${missing.join('\n')}`)
})

test('public/icons publishes exactly the shipped set, from the same map (run `npm run build:icons`)', async () => {
  const { renderPublicIcons, PUBLIC_ICONS_DIR } = await import('./build-icons.mjs')
  const expected = renderPublicIcons(icons)
  const onDisk = readdirSync(PUBLIC_ICONS_DIR).sort()
  assert.deepEqual(onDisk, Object.keys(expected).sort(), 'public/icons has missing or stray files — run `npm run build:icons`')
  for (const [file, content] of Object.entries(expected)) {
    assert.equal(readFileSync(join(PUBLIC_ICONS_DIR, file), 'utf8'), content, `public/icons/${file} is stale — run \`npm run build:icons\``)
  }
  const index = JSON.parse(expected['index.json'])
  assert.deepEqual(index.icons, Object.keys(icons).sort())
  assert.equal(index.viewBox, '0 -960 960 960')
  for (const name of ['add', 'folder_open']) assert.ok(index.icons.includes(name), `${name} is used by the blocks and must be published`)
})
