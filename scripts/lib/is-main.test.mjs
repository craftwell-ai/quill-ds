import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const helper = pathToFileURL(join(import.meta.dirname, 'is-main.mjs')).href

test('isMain is true for the script node runs, by a real path, a symlink, or a folder with a space', () => {
  const base = realpathSync(mkdtempSync(join(tmpdir(), 'is-main-')))
  const real = join(base, 'a folder')
  mkdirSync(real)
  writeFileSync(join(real, 'main.mjs'), `import { isMain } from ${JSON.stringify(helper)}\nconsole.log(isMain(import.meta.url))\n`)
  writeFileSync(join(real, 'lib.mjs'), `import { isMain } from ${JSON.stringify(helper)}\nexport const ran = isMain(import.meta.url)\n`)
  writeFileSync(join(real, 'imports-lib.mjs'), `import { ran } from './lib.mjs'\nconsole.log(ran)\n`)
  symlinkSync(real, join(base, 'link'))
  const run = (path) => execFileSync(process.execPath, [path], { encoding: 'utf8' }).trim()
  assert.equal(run(join(real, 'main.mjs')), 'true')
  assert.equal(run(join(base, 'link', 'main.mjs')), 'true')
  assert.equal(run(join(real, 'imports-lib.mjs')), 'false', 'an imported module is not the main one')
})
