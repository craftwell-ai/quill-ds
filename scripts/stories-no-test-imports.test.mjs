import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })

// Stories also render in plain Storybook (dev server, the static build, the preview people review). A module that only
// exists inside the vitest browser run turns the whole story into an error page there. `storybook/test` is fine: it is
// part of Storybook. Dynamic imports inside a play function are not checked here.
const TEST_ONLY = /^\s*import\s[^;\n]*?from\s+['"](vitest|vitest\/[^'"]*|@vitest\/[^'"]*|playwright|playwright\/[^'"]*|@playwright\/[^'"]*)['"]/

test('no story file statically imports a test-runner-only module', () => {
  const offenders = []
  for (const file of walk(join(root, 'src/stories')).filter((path) => /\.(tsx?|mjs|jsx?)$/.test(path))) {
    readFileSync(file, 'utf8').split('\n').forEach((line, index) => {
      if (TEST_ONLY.test(line)) offenders.push(`${relative(root, file)}:${index + 1}: ${line.trim()}`)
    })
  }
  assert.deepEqual(offenders, [], 'story files may not import vitest, vitest/browser, @vitest/* or playwright at the top level')
})
