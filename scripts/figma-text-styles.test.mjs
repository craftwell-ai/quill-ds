import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { renderDtcg } from './build-tokens.mjs'
import { tokens } from '../src/tokens/quill.tokens.mjs'

// Figma's text styles were the one layer typed by hand beside the tokens, and they
// drifted where nothing checked: Heading/S and Body/L sat at 18px while `lg` is
// 18.4, the Eyebrow at 11 while code and DESIGN.md both say `text-xs` (12). The
// sync snippet now names token KEYS and resolves them from the export; this test
// runs that resolution against the real export, without Figma.
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const snippet = readFileSync(join(root, 'figma/sync-foundations.figma.js'), 'utf8')

// The snippet is a Plugin-API script, not a module: lift out the pure part.
function load() {
  const start = snippet.indexOf('// ---- Text styles')
  const end = snippet.indexOf('async function syncTextStyles')
  assert.ok(start !== -1 && end > start, 'text style section not found in the sync snippet')
  const helpers = snippet.match(/const REM = .*\n/)[0] + snippet.match(/const dimToPx = .*\n/)[0] + snippet.match(/const primaryFamily = .*\n/)[0]
  return new Function(`${helpers}${snippet.slice(start, end)}\nreturn { TEXT_STYLES, OFF_SCALE, resolveTextStyles }`)()
}

const DTCG = renderDtcg(tokens)
const px = (key) => parseFloat(tokens.text[key]) * 16

test('a curated text style names token keys, never a typed pixel size or family', () => {
  const { TEXT_STYLES, OFF_SCALE } = load()
  assert.ok(TEXT_STYLES.length >= 14, `expected the 14 curated styles, found ${TEXT_STYLES.length}`)
  for (const s of TEXT_STYLES) {
    assert.ok(s.font in tokens.font, `${s.name}: font '${s.font}' is not a key of tokens.font`)
    if (OFF_SCALE.has(s.name)) continue
    assert.ok(s.size in tokens.text, `${s.name}: size '${s.size}' is not a key of tokens.text — name the token, do not type the pixels`)
  }
  // The allowlist may only shrink.
  assert.deepEqual([...OFF_SCALE], ['Accent'])
})

test('resolved styles carry the token values, including the three that had drifted', () => {
  const { resolveTextStyles } = load()
  const byName = Object.fromEntries(resolveTextStyles(DTCG).map((s) => [s.name, s]))
  assert.equal(byName['Heading/S'].size, px('lg'))
  assert.equal(byName['Body/L'].size, px('lg'))
  assert.equal(byName['Eyebrow'].size, px('xs'))
  assert.equal(byName['Display/XL'].family, 'Fraunces')
  assert.equal(byName['Body/Base'].family, 'Raleway')
})

test('every text-* utility with a line height has a generated Text/* style that mirrors it', () => {
  const { resolveTextStyles } = load()
  const byName = Object.fromEntries(resolveTextStyles(DTCG).map((s) => [s.name, s]))
  const sizes = Object.keys(tokens.textLeading)
  assert.ok(sizes.length >= 9)
  for (const k of sizes) {
    const s = byName[`Text/${k}`]
    assert.ok(s, `Text/${k} should be generated`)
    assert.equal(s.size, px(k))
    assert.ok(Math.abs(s.lh - DTCG.Primitives.lineHeight[k].$value * 100) < 0.001, `Text/${k} line height`)
  }
  assert.ok(Math.abs(byName['Text/sm'].lh - 142.857) < 0.001, 'text-sm renders a 142.857% line')
  assert.equal(byName['Text/2xs'], undefined, '2xs inherits its line height, so it has no utility style')
})
