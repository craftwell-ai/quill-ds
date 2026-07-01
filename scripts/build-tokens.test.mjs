import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderCss, injectMarkers, cssVarName } from './build-tokens.mjs'
import { tokens } from '../src/tokens/quill.tokens.mjs'

test('cssVarName drops a trailing base leaf', () => {
  assert.equal(cssVarName(['paper', 'base']), '--paper')
  assert.equal(cssVarName(['paper', 'warm']), '--paper-warm')
  assert.equal(cssVarName(['pigment', 'terracotta', 'deep']), '--terracotta-deep')
})

test('renderCss reproduces primitive + dk + remap declarations', () => {
  const { theme, root, dark } = renderCss(tokens)
  assert.match(root, /--paper:\s*#F5EDDD;/)
  assert.match(root, /--dk-paper:\s*#20180E;/)
  assert.match(dark, /--paper:\s*var\(--dk-paper\);/)
  // semantic + shadcn present in :root
  assert.match(root, /--text-accent-color:\s*var\(--terracotta-deep\);/)
  assert.match(root, /--destructive:\s*var\(--terracotta-deep\);/)
  // @theme mappings + scale
  assert.match(theme, /--color-terracotta:\s*var\(--terracotta\);/)
  assert.match(theme, /--radius-lg:\s*0\.5rem;/)
  assert.match(theme, /--text-xl:\s*1\.5rem;/)
})

test('injectMarkers replaces only between markers and is idempotent', () => {
  const src = 'A\n/* @quill-tokens:start */\nOLD\n/* @quill-tokens:end */\nB\n'
  const out1 = injectMarkers(src, 'NEW')
  assert.equal(out1, 'A\n/* @quill-tokens:start */\nNEW\n/* @quill-tokens:end */\nB\n')
  assert.equal(injectMarkers(out1, 'NEW'), out1)
})
