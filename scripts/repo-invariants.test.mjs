import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const registry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8'))

test('the current version has a CHANGELOG entry', () => {
  // Quill's release routine bumps package.json + adds a CHANGELOG entry in the
  // same PR; the footer reads package.json. This guards the "bumped but forgot
  // to document" (and vice-versa) mistake before it can merge.
  const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8')
  assert.ok(
    changelog.includes(`## [${pkg.version}]`),
    `CHANGELOG.md has no "## [${pkg.version}]" entry for the current package version`,
  )
})

test('every registry item points at files that exist on disk', () => {
  // A block that references a deleted or renamed source file installs broken.
  for (const item of registry.items) {
    for (const f of item.files ?? []) {
      assert.ok(
        existsSync(join(root, f.path)),
        `registry item '${item.name}' references '${f.path}', which does not exist`,
      )
    }
  }
})
