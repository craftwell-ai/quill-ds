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
// part of Storybook.
//
// Matched against the whole file, not line by line: `import { … } from`, a bare `import '…'` and `export … from` can
// each put the module name on a later line. No quote, semicolon or bracket may sit between the keyword and the
// name, which is what keeps one statement from running into the next, and keeps `import('…')` (a dynamic import,
// which only loads when its function runs) out of it.
const TEST_ONLY = /^[ \t]*(?:import|export)\b(?:[^;'"()]*?\bfrom\b)?\s*['"](vitest|vitest\/[^'"]*|@vitest\/[^'"]*|playwright|playwright\/[^'"]*|@playwright\/[^'"]*)['"]/gm

const findTestOnlyImports = (source) =>
  Array.from(source.matchAll(TEST_ONLY), (match) => ({
    // The line the module name is on: that is the one a person searches for.
    line: source.slice(0, match.index + match[0].length).split('\n').length,
    module: match[1],
  }))

// Each fixture is a whole file's text. The guard has to read the file as a whole: a formatter is free to put the
// module name on a different line from the word `import`.
const CAUGHT = {
  'an import on one line': "import { page } from 'vitest/browser'\n",
  'an import spread over several lines': "import {\n  page,\n  userEvent,\n} from 'vitest/browser'\n",
  'an import for its side effects only': "import React from 'react'\nimport 'vitest/browser'\n",
  'a re-export': "export { page } from 'vitest/browser'\n",
  'a re-export of everything, over several lines': "export *\n  from '@vitest/browser/context'\n",
  'playwright': "import { chromium } from 'playwright'\n",
}
const ALLOWED = {
  'storybook/test': "import { expect, userEvent } from 'storybook/test'\n",
  'a dynamic import inside a function': "export const Story = {\n  play: async () => {\n    const { page } = await import('vitest/browser')\n    await page.viewport(375, 812)\n  },\n}\n",
  'a dynamic import at the start of a line': "const load = () =>\n  import('vitest/browser')\n",
  'a module whose name only starts the same': "import { thing } from 'vitest-like-helper'\n",
}

for (const [form, source] of Object.entries(CAUGHT)) {
  test(`the guard catches ${form}`, () => {
    assert.equal(findTestOnlyImports(source).length, 1, source)
  })
}

for (const [form, source] of Object.entries(ALLOWED)) {
  test(`the guard allows ${form}`, () => {
    assert.deepEqual(findTestOnlyImports(source), [], source)
  })
}

test('the guard reports the line the module is named on', () => {
  assert.deepEqual(findTestOnlyImports("import {\n  page,\n} from 'vitest/browser'\n"), [{ line: 3, module: 'vitest/browser' }])
})

test('no story file statically imports a test-runner-only module', () => {
  const offenders = []
  for (const file of walk(join(root, 'src/stories')).filter((path) => /\.(tsx?|mjs|jsx?)$/.test(path))) {
    for (const found of findTestOnlyImports(readFileSync(file, 'utf8'))) offenders.push(`${relative(root, file)}:${found.line}: ${found.module}`)
  }
  assert.deepEqual(offenders, [], 'story files may not import or re-export vitest, vitest/browser, @vitest/* or playwright at the top level')
})
