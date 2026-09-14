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

test('every path the agent-facing docs name exists, or is a registry install target', () => {
  // DESIGN.md cited five component files and a font stylesheet that had not
  // existed for months, and AGENTS.md sends every agent there before any
  // visual change. A backticked, path-like string (has a slash; no glob,
  // placeholder or scope characters) must exist in the repo, or be a `target`
  // a registry item writes into a consumer app.
  const targets = new Set(
    registry.items.flatMap((i) => (i.files ?? []).map((f) => f.target).filter(Boolean)),
  )
  const offenders = []
  for (const doc of ['DESIGN.md', 'PRODUCT.md', 'AGENTS.md']) {
    readFileSync(join(root, doc), 'utf8').split('\n').forEach((line, i) => {
      for (const m of line.matchAll(/`([^`\n]+)`/g)) {
        const s = m[1]
        if (!/^[A-Za-z0-9_.-]+(\/[A-Za-z0-9_.-]+)+$/.test(s)) continue
        if (!existsSync(join(root, s)) && !targets.has(s)) offenders.push(`${doc}:${i + 1} ${s}`)
      }
    })
  }
  assert.deepEqual(offenders, [], `agent-facing docs name paths that do not exist:\n${offenders.join('\n')}`)
})
