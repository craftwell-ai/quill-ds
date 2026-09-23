import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { renderCheck, checkData, CHECK_PATH } from './build-check.mjs'

test('registry/check/quill-check.mjs is in sync with its sources (run `npm run build:check`)', () => {
  assert.ok(existsSync(CHECK_PATH), 'generated file missing — run npm run build:check')
  assert.equal(readFileSync(CHECK_PATH, 'utf8'), renderCheck(), 'the check script is stale — run `npm run build:check`')
})

test('the inlined data carries every table the rules read', () => {
  const d = checkData()
  assert.equal(typeof d.version, 'string')
  assert.ok(d.quillClasses.includes('font-heading') && d.quillClasses.includes('text-2xs') && d.quillClasses.includes('bg-background'))
  assert.equal(d.vars['--accent-pigment-text'], 'accent-pigment-text')
  assert.equal(d.tokens.text.sm, 13.6)
  assert.equal(d.retired.classes['indigo-brand'].use, 'indigo')
  assert.equal(Object.keys(d.retired.vars).length, 11)
  assert.ok(d.roles.card.length > 20 && d.roles.card.length <= 110)
  assert.deepEqual(d.palette.bg.white, ['background', 'card'])
  assert.match(d.swatches.background, /^#[0-9A-F]{6}$/)
  assert.deepEqual(d.tokens.motion.ease, ['--ease-out', '--ease-soft'])
  assert.equal(d.tokens.motion.duration['--dur-fast'], 200)
})
