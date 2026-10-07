import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatColor, mapColors, parseColor, sameColor } from './color.mjs'
import { loadedWeights, mapTokens, paperName, planTokenSync, quillPaperTokens, ratio, resolveTokens, sameTokenValue, themeDeclarations } from './tokens.mjs'

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@300..900&family=Raleway:wght@400;500;600&display=swap');
@theme inline {
  --font-sans: "Raleway", -apple-system, sans-serif;
  --color-card: var(--card);
  --color-paper-warm: var(--paper-warm);
  --radius-lg: 0.5rem;
  --text-sm: 0.85rem;
  --text-sm--line-height: calc(1.25 / 0.875);
  --shadow-sm: var(--shadow-sm);
}

:root {
  --paper-warm: #EFE4CE;
  --line-soft: rgba(42, 38, 34, 0.12);
  --shadow-sm: 0 2px 4px -1px rgba(42, 38, 34, 0.14);
  --dur: 0.3s;
  --card: var(--paper-warm);
  --border: var(--line-soft);
  --space-0_5: 0.125rem;
  --space-4: 1rem;
  --leading-ui: 1.5;
  --tracking-label: 0.1em;
  --dk-paper-warm: #2A2014;
  --int-paper-warm: #171A14;
}
[data-theme="dark"] {
  --paper-warm: var(--dk-paper-warm);
}`

test('colours parse from every spelling a browser or Paper uses', () => {
  assert.deepEqual(parseColor('#F5EDDD'), { r: 245, g: 237, b: 221, a: 1 })
  assert.deepEqual(parseColor('rgba(42, 38, 34, 0.12)'), { r: 42, g: 38, b: 34, a: 0.12 })
  assert.deepEqual(parseColor('rgb(42 38 34 / 12%)'), { r: 42, g: 38, b: 34, a: 0.12 })
  assert.ok(sameColor(parseColor('color(srgb 0.541176 0.270588 0.188235 / 0.1)'), { r: 138, g: 69, b: 48, a: 0.1 }))
  // recorded from Chrome: the usage meter's track, color-mix(in oklab, var(--input) 15%, var(--muted)), which paints #D9CDB3
  assert.ok(sameColor(parseColor('oklab(0.852503 0.00228883 0.0376893)'), parseColor('#D9CDB3')))
  assert.ok(sameColor(parseColor('oklab(1 0 0 / 0.5)'), { r: 255, g: 255, b: 255, a: 0.5 }))
  assert.ok(sameColor(parseColor('oklch(100% 0 0)'), { r: 255, g: 255, b: 255, a: 1 }))
  assert.equal(parseColor('linear-gradient(red, blue)'), null)
  assert.equal(parseColor('transparent').a, 0)
})

test('colours are written short, and colours inside a longer value can be rewritten', () => {
  assert.equal(formatColor({ r: 245, g: 237, b: 221, a: 1 }), '#F5EDDD')
  assert.equal(formatColor({ r: 42, g: 38, b: 34, a: 0.14 }), 'rgba(42, 38, 34, 0.14)')
  assert.equal(mapColors('linear-gradient(90deg, rgb(196, 149, 68), rgb(222, 80, 27) 50%)', (color) => formatColor(color)), 'linear-gradient(90deg, #C49544, #DE501B 50%)')
})

test('the theme is read in Dawn: @theme then :root, other themes\' prefixed copies left out', () => {
  const values = themeDeclarations(CSS)
  assert.equal(values.get('--paper-warm'), '#EFE4CE')
  assert.equal(values.get('--card'), 'var(--paper-warm)')
  assert.equal(values.has('--dk-paper-warm'), false)
  assert.equal(values.has('--int-paper-warm'), false)
})

test('names take the Tailwind namespaces; sizes become px, line heights ratios, fonts one family', () => {
  const { tokens, skipped } = mapTokens(themeDeclarations(CSS), { weights: loadedWeights(CSS) })
  const byName = Object.fromEntries(tokens.map((token) => [token.name, token]))
  assert.deepEqual(byName['--color-card'], { name: '--color-card', type: 'color', value: 'var(--color-paper-warm)', source: '--card', inTheme: true })
  assert.equal(byName['--color-paper-warm'].value, '#EFE4CE')
  // the theme has no --color-line-soft: the name exists in Paper only, and says so
  assert.equal(byName['--color-line-soft'].inTheme, false)
  assert.equal(byName['--color-border'].value, 'var(--color-line-soft)')
  assert.equal(byName['--spacing-0_5'].value, '2px')
  assert.equal(byName['--spacing-4'].source, '--space-4')
  assert.equal(byName['--radius-lg'].value, '8px')
  assert.equal(byName['--text-sm'].value, '13.6px')
  assert.equal(byName['--leading-text-sm'].value, 1.428571)
  assert.equal(byName['--leading-text-sm'].source, '--text-sm--line-height')
  assert.equal(byName['--font-sans'].value, 'Raleway')
  assert.equal(byName['--font-weight-medium'].value, 500)
  assert.deepEqual(skipped.map((entry) => entry.name).sort(), ['--dur', '--shadow-sm'])
  assert.equal(tokens.some((token) => token.name === '--card'), false, 'no un-namespaced duplicate')
})

test('tokens are ordered for Paper\'s panel: aliases (roles) before the palette, sizes ascending', () => {
  const { tokens } = mapTokens(themeDeclarations(CSS))
  const colors = tokens.filter((token) => token.type === 'color').map((token) => token.name)
  assert.ok(colors.indexOf('--color-card') < colors.indexOf('--color-paper-warm'))
  assert.deepEqual(tokens.filter((token) => token.type === 'spacing').map((token) => token.value), ['2px', '16px'])
})

test('helpers: paperName, ratio, loadedWeights', () => {
  assert.equal(paperName('--muted-foreground', 'color'), '--color-muted-foreground')
  assert.equal(paperName('--text-2xl--line-height', 'lineHeight'), '--leading-text-2xl')
  assert.equal(paperName('--leading-ui', 'lineHeight'), '--leading-ui')
  assert.equal(ratio('calc(1 / 0.75)'), 1.333333)
  assert.equal(ratio('1.05'), 1.05)
  assert.equal(ratio('var(--x)'), null)
  assert.deepEqual(loadedWeights(CSS), [400, 500, 600])
})

test('values are compared by meaning, because Paper rewrites what it stores', () => {
  assert.ok(sameTokenValue('color', 'rgba(42, 38, 34, 0.12)', 'rgb(42 38 34 / 12%)'))
  assert.ok(sameTokenValue('lineHeight', 1.5, '150%'))
  assert.ok(sameTokenValue('lineHeight', 1.428571, '142.8571%'))
  assert.ok(sameTokenValue('fontWeight', 500, '500'))
  assert.ok(sameTokenValue('radius', '8px', '0.5rem'))
  assert.ok(!sameTokenValue('color', 'var(--color-paper)', '#F5EDDD'), 'an alias is not its value: the link matters')
  assert.ok(!sameTokenValue('spacing', '8px', '10px'))
})

test('the sync plan creates, updates and reports, and never plans a delete by itself', () => {
  const wanted = [{ name: '--color-card', type: 'color', value: '#EFE4CE' }, { name: '--spacing-4', type: 'spacing', value: '16px' }, { name: '--radius-lg', type: 'radius', value: '8px' }, { name: '--leading-ui', type: 'lineHeight', value: 1.5 }]
  const existing = [{ name: '--color-card', type: 'color', value: '#FFFFFF' }, { name: '--spacing-4', type: 'spacing', value: '16px' }, { name: '--leading-ui', type: 'spacing', value: '1.5px' }, { name: '--mine', type: 'color', value: '#000' }]
  const plan = planTokenSync(wanted, existing)
  assert.deepEqual(plan.create.map((token) => token.name), ['--radius-lg'])
  assert.deepEqual(plan.update.map((token) => token.name), ['--color-card'])
  assert.deepEqual(plan.retype.map((token) => token.name), ['--leading-ui'])
  assert.deepEqual(plan.unchanged, ['--spacing-4'])
  assert.deepEqual(plan.extra, ['--mine'])
  assert.equal('delete' in plan, false)
})

test('the resolved table follows alias chains to a value', () => {
  const table = resolveTokens([{ name: '--color-paper', type: 'color', value: '#F5EDDD' }, { name: '--color-background', type: 'color', value: 'var(--color-paper)' }, { name: '--leading-text-sm', type: 'lineHeight', value: '142.8571%' }])
  assert.deepEqual(table[1].color, { r: 245, g: 237, b: 221, a: 1 })
  assert.equal(table[1].alias, true)
  assert.ok(Math.abs(table[2].ratio - 1.428571) < 1e-6)
})

test('the real theme maps cleanly: every alias resolves, every name is unique and legal for Paper', () => {
  const { tokens, skipped } = quillPaperTokens()
  const names = tokens.map((token) => token.name)
  assert.equal(new Set(names).size, names.length)
  for (const name of names) assert.match(name, /^--[a-zA-Z0-9_-]+$/)
  // Paper collapses a double dash inside a name; one must never be sent
  for (const name of names) assert.equal(name.slice(2).includes('--'), false, name)
  for (const entry of resolveTokens(tokens)) assert.notEqual(entry.literal, undefined, `${entry.name} resolves`)
  for (const role of ['--color-background', '--color-card', '--color-border', '--color-muted-foreground', '--color-moss-deep', '--color-ai-from', '--radius-lg', '--spacing-4', '--text-sm', '--leading-ui', '--tracking-label', '--font-sans', '--font-heading']) assert.ok(names.includes(role), role)
  assert.equal(tokens.find((token) => token.name === '--font-sans').value, 'Raleway')
  // shadows, motion and the AI utilities are named as not representable, not dropped silently
  for (const lost of ['--shadow-sm', '--ease-out', '--fraunces-display', 'ai-wash', 'ai-meter', 'ai-edge']) assert.ok(skipped.some((entry) => entry.name === lost), lost)
})
