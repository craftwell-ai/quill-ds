import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compareValues, keyNodes, parseTreeSummary, renderTable, resolveColor, resolveLength } from './check.mjs'
import { serialize } from './convert.mjs'
import { upsertPiece } from './file.mjs'
import { ARTBOARD, artboardStyles, header, section } from './page.mjs'
import { pageName, pageOrder, pieceLayerName, PIECES, sourceHash, stalePieces, storyTitle } from './pieces.mjs'
import { foundationsPage } from './sync-foundations.mjs'
import { resolveTokens } from './tokens.mjs'

// what Paper's get_tokens answers, in Paper's own spellings
const TABLE = resolveTokens([
  { name: '--color-card', type: 'color', value: 'var(--color-paper-warm)' },
  { name: '--color-paper-warm', type: 'color', value: '#EFE4CE' },
  { name: '--color-border', type: 'color', value: 'rgb(42 38 34 / 12%)' },
  { name: '--color-moss', type: 'color', value: '#7A8C5C' },
  { name: '--color-foreground', type: 'color', value: '#2A2622' },
  { name: '--font-sans', type: 'fontFamily', value: 'Raleway' },
  { name: '--text-sm', type: 'fontSize', value: '13.6px' },
  { name: '--font-weight-medium', type: 'fontWeight', value: '500' },
  { name: '--leading-text-sm', type: 'lineHeight', value: '142.8571%' },
  { name: '--spacing-2', type: 'spacing', value: '8px' },
  { name: '--spacing-0_5', type: 'spacing', value: '2px' },
  { name: '--radius-xl', type: 'radius', value: '16px' },
])

test('Paper\'s tree summary is read into nodes, and cut-off branches are named', () => {
  // recorded from get_tree_summary; the text after the size is truncated by Paper at 60 characters
  const summary = 'Frame "usage-meter / card" (1T-0) 380×?\n  Frame "usage-meter" (1U-0) ?×?\n    Text "AI credits" (1V-0) ?×? "AI credits"\n    Frame "say "hi"" (1W-0) ?×?\n      ... 5 children\n    SVG "icon" (2A-0) 16×16'
  const { nodes, cut } = parseTreeSummary(summary)
  assert.deepEqual(nodes.map((node) => [node.depth, node.type, node.name, node.id]), [[0, 'Frame', 'usage-meter / card', '1T-0'], [1, 'Frame', 'usage-meter', '1U-0'], [2, 'Text', 'AI credits', '1V-0'], [2, 'Frame', 'say "hi"', '1W-0'], [2, 'SVG', 'icon', '2A-0']])
  assert.deepEqual(cut, ['1W-0'])
})

test('Paper\'s stored values resolve through its tokens', () => {
  assert.deepEqual(resolveColor('var(--color-card)', TABLE), { r: 239, g: 228, b: 206, a: 1 })
  // Paper drops the colour space and a 50 % it considers the default
  assert.equal(resolveColor('color-mix(var(--color-moss) 20%, transparent)', TABLE).a, 0.2)
  assert.equal(resolveColor('color-mix(in oklab, var(--color-moss), transparent)', TABLE).a, 0.5)
  assert.equal(resolveColor('#00000000', TABLE).a, 0)
  assert.equal(resolveColor('var(--nope)', TABLE), null)
  assert.equal(resolveLength('var(--spacing-2)', TABLE), 8)
  assert.ok(Math.abs(resolveLength('var(--leading-text-sm)', TABLE, { fontSize: 13.6 }) - 19.4286) < 0.01)
  assert.equal(resolveLength('calc(infinity * 1px)', TABLE), 9999)
  assert.equal(resolveLength('var(--font-weight-medium)', TABLE), 500)
})

test('a text layer is compared on colour, size, line height, weight and face', () => {
  const paper = { color: 'var(--color-foreground)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 'var(--leading-text-sm)' }
  const used = { color: 'rgb(42, 38, 34)', fontFamily: 'Raleway, -apple-system, sans-serif', fontSize: '13.6px', fontWeight: '500', lineHeight: '19.4286px' }
  assert.ok(compareValues('text', paper, used, TABLE).every((row) => row.ok))
  const wrong = compareValues('text', { ...paper, fontSize: '15px', fontFamily: '"Inter", system-ui' }, used, TABLE)
  assert.deepEqual(wrong.filter((row) => !row.ok).map((row) => row.property), ['font-size', 'font-family'])
})

test('a frame is compared on fill, radius, each padding side and border, however Paper stored the padding', () => {
  const used = { backgroundColor: 'rgba(122, 140, 92, 0.2)', borderTopLeftRadius: '3.35544e+07px', paddingTop: '2px', paddingRight: '8px', paddingBottom: '2px', paddingLeft: '8px', borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'rgba(0, 0, 0, 0)' }
  const paper = { backgroundColor: 'color-mix(var(--color-moss) 20%, transparent)', borderRadius: 'calc(infinity * 1px)', paddingBlock: 'var(--spacing-0_5)', paddingInline: 'var(--spacing-2)', borderWidth: '1px', borderColor: '#00000000' }
  const rows = compareValues('frame', paper, used, TABLE)
  assert.deepEqual(rows.filter((row) => !row.ok).map((row) => row.property), [])
  assert.deepEqual(rows.map((row) => row.property), ['background-color', 'border-radius', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'border-width', 'border-color'])
  const off = compareValues('frame', { ...paper, paddingInline: '10px' }, used, TABLE)
  assert.deepEqual(off.filter((row) => !row.ok).map((row) => row.property), ['padding-right', 'padding-left'])
})

test('key nodes: the first text\'s owner, the first button, the first filled surface', () => {
  const used = (extra = {}) => ({ whiteSpace: 'normal', backgroundColor: 'rgba(0, 0, 0, 0)', ...extra })
  const button = { tag: 'button', slot: 'button', used: used({ backgroundColor: 'rgb(42, 38, 34)' }), children: [{ text: 'Send' }] }
  const title = { tag: 'p', used: used(), children: [{ text: '  ' }, { text: 'Title' }] }
  const card = { tag: 'div', used: used({ backgroundColor: 'rgb(239, 228, 206)' }), children: [title, button] }
  const tree = { tag: 'div', used: used(), children: [card] }
  const keys = keyNodes(tree)
  assert.equal(keys.text, title)
  assert.equal(keys.button, button)
  assert.equal(keys.surface, card)
})

test('the report table has a row per story and marks a text mismatch', () => {
  const rows = [
    { piece: 'button', title: 'All Variants', text: { ok: true, story: 6, paper: 6 }, values: [{ ok: true }, { ok: false }], valuesOk: 1, picture: { diffPct: 6.1, paper: [462, 32], storybook: [459, 32] } },
    { piece: 'button', title: 'Disabled', text: { ok: false, story: 1, paper: 2 }, values: [], valuesOk: 0, picture: { diffPct: 0, paper: [78, 32], storybook: [78, 32] } },
    { piece: 'tone-badge', title: 'Solid', error: 'export produced no file' },
  ]
  const table = renderTable(rows, [{ slug: 'button', status: 'stale' }])
  assert.match(table, /\| button \| All Variants \| 6\/6 ✓ \| 1\/2 \| 6\.10% \| 462×32 → 459×32 \| stale \|/)
  assert.match(table, /\| button \| Disabled \| 2\/1 ✗ \|/)
  assert.match(table, /\| tone-badge \| Solid \| — \| — \| — \| error: export produced no file \| — \|/)
})

// ------------------------------------------------------------------ pieces, pages, state

test('pages are named and ordered as the library is: components A–Z, then blocks, with their marks', () => {
  assert.deepEqual(pageOrder(), ['❖ Approval Card', '❖ Button', '❖ Tone Badge', '❖ Usage Meter', '◆ Conversation History'])
  assert.equal(pageName({ kind: 'template', name: 'Pricing Page' }), '▣ Pricing Page')
  assert.equal(pieceLayerName({ slug: 'usage-meter' }, 'components-usagemeter--running-low-card'), 'usage-meter / running-low-card')
  assert.equal(storyTitle('components-button--all-variants'), 'All variants')
})

test('every piece names files that exist and stories of its own', () => {
  for (const piece of PIECES) {
    assert.match(sourceHash(piece), /^[0-9a-f]{16}$/, piece.slug)
    assert.ok(piece.stories.length >= 1)
    assert.equal(new Set(piece.stories).size, piece.stories.length)
  }
})

test('staleness needs only files: a changed source reads stale, a comment-only change does not', () => {
  const piece = { slug: 'x', sources: ['a.tsx'] }
  const read = (source) => (path) => (path === 'a.tsx' ? source : 'export const usage = {}')
  const recorded = sourceHash(piece, read('export function X() { return <b>one</b> }'))
  assert.equal(sourceHash(piece, read('// a note\nexport function X() {\n  return <b>one</b>\n}')), recorded)
  assert.notEqual(sourceHash(piece, read('export function X() { return <b>two</b> }')), recorded)
  const state = { pieces: [{ slug: 'button', sourceHash: 'not-the-hash', syncedAt: '2026-10-07' }] }
  const status = Object.fromEntries(stalePieces(state).map((entry) => [entry.slug, entry.status]))
  assert.equal(status.button, 'stale')
  assert.equal(status['tone-badge'], 'never synced')
  const current = { pieces: PIECES.map((entry) => ({ slug: entry.slug, sourceHash: sourceHash(entry) })) }
  assert.ok(stalePieces(current).every((entry) => entry.status === 'in step'))
})

test('a re-synced piece replaces its record in place', () => {
  const state = { pieces: [{ name: 'a', slug: 'a', n: 1 }, { name: 'b', slug: 'b', n: 1 }] }
  assert.deepEqual(upsertPiece(state, { name: 'a', slug: 'a', n: 2 }).pieces, [{ name: 'a', slug: 'a', n: 2 }, { name: 'b', slug: 'b', n: 1 }])
  assert.deepEqual(upsertPiece(state, { name: 'c', slug: 'c' }).pieces.map((piece) => piece.name), ['a', 'b', 'c'])
})

test('the page anatomy: a 1440 artboard, a three-line header, sections titled in tokens', () => {
  assert.deepEqual([artboardStyles().width, artboardStyles().padding, artboardStyles().gap, artboardStyles().height], ['1440px', '80px', '56px', 'fit-content'])
  assert.equal(ARTBOARD.width, 1440)
  const head = header('Quill · Component', 'Button', 'Buttons trigger actions.')
  assert.deepEqual(head.children.map((node) => node.text), ['Quill · Component', 'Button', 'Buttons trigger actions.'])
  assert.equal(head.children[2].style.width, '720px')
  const html = serialize(section('All Variants'))
  assert.match(html, /^<div layer-name="All Variants" style="display:flex;flex-direction:column;align-items:flex-start;gap:var\(--spacing-4\)"><span style="[^"]*font-weight:var\(--font-weight-semibold\)[^"]*">All Variants<\/span><\/div>$/)
  // nothing on a page is a typed colour or size: literals would not follow a token change
  assert.equal(/#[0-9A-Fa-f]{6}/.test(serialize(head) + html), false)
})

test('the Foundations page is drawn from the tokens: every swatch is a var, every caption a value', () => {
  const nodes = foundationsPage()
  assert.deepEqual(nodes.map((node) => node.name), ['Header', 'Surfaces and text', 'Roles', 'Pigments', 'AI gradient', 'Data series', 'Type', 'Spacing', 'Radius'])
  const html = nodes.map((node) => serialize(node)).join('')
  assert.match(html, /background-color:var\(--color-card\)/)
  assert.match(html, /paper-warm · #EFE4CE/)
  assert.match(html, /linear-gradient\(90deg, var\(--color-ai-from\), var\(--color-ai-via\) 50%, var\(--color-ai-to\)\)/)
  assert.match(html, /text-sm · Raleway 13\.6px \/ 19\.4px/)
  assert.equal(/style="[^"]*(?:margin|display:grid|display:inline)[^"]*"/.test(html), false, 'only what Paper accepts')
})
