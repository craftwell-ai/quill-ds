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

// ---------------------------------------------------------------- the checker itself
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..')
const check = await import(CHECK_PATH)

const byRule = (findings) => findings.reduce((m, f) => ((m[f.rule] ??= []).push(f), m), {})

test('rules 2–5 flag one of each violation in the fixture (static mode) and nothing else', async () => {
  const { findings, layout } = await check.runCheck({ cwd: here, dirs: [join(here, 'check/fixture')], tailwind: false })
  const r = byRule(findings.filter((f) => !f.allowed))
  assert.deepEqual((r.palette ?? []).map((f) => f.value).sort(), ['bg-white', 'font-serif', 'md:hover:bg-red-600', 'text-black', 'text-gray-500'])
  assert.deepEqual((r.bracket ?? []).map((f) => f.value).sort(), ['bg-[#F5EDDD]', 'rounded-[10px]', 'text-[13px]', 'text-[var(--accent-pigment-text)]', 'tracking-[0.15em]'])
  assert.deepEqual((r.retired ?? []).map((f) => f.value).sort(), ['text-indigo-brand', 'var(--text-strong)'])
  assert.deepEqual((r['raw-color'] ?? []).map((f) => f.value).sort(), ['rgb(245, 237, 221)'])
  assert.deepEqual((r['allow-without-reason'] ?? []).map((f) => f.value), ['palette'])
  assert.deepEqual(Object.keys(r).sort(), ['allow-without-reason', 'bracket', 'palette', 'raw-color', 'retired'])
  assert.equal(layout, 3, 'w-[420px], h-[24px], max-w-[880px] are counted, not flagged')
  const allowed = findings.filter((f) => f.allowed)
  assert.equal(allowed.length, 1)
  assert.equal(allowed[0].value, '#4285F4')
  assert.equal(allowed[0].allowed, 'Google brand mark')
  assert.ok(!findings.some((f) => f.value.includes('#pricing') || f.value === 'text-foreground'), 'anchors and roles are not colours')
})

test('fix text names the token or role an agent should write', async () => {
  const { findings } = await check.runCheck({ cwd: here, dirs: [join(here, 'check/fixture')], tailwind: false })
  const fix = (v) => findings.find((f) => f.value === v)?.fix ?? ''
  assert.match(fix('text-[13px]'), /text-sm/)
  assert.match(fix('tracking-[0.15em]'), /tracking-eyebrow/)
  assert.match(fix('rounded-[10px]'), /rounded-lg/)
  assert.match(fix('text-[var(--accent-pigment-text)]'), /text-accent-pigment-text/)
  assert.match(fix('bg-white'), /bg-background.*bg-card|bg-card.*bg-background/)
  assert.match(fix('text-indigo-brand'), /text-indigo\b.*0\.9\.60/)
  assert.match(fix('var(--text-strong)'), /0\.10\.0/)
  assert.match(fix('font-serif'), /font-heading/)
  assert.match(fix('bg-[#F5EDDD]'), /bg-background|bg-paper/)
})

// ---------------------------------------------------------------- rule 1: the app's own Tailwind
test('rule 1: a class that produces no CSS is unresolved, with a typo hint; Quill classes resolve', async () => {
  const { findings, notes } = await check.runCheck({ cwd: repoRoot, dirs: [join(here, 'check/fixture')], css: join(repoRoot, 'src/app/globals.css') })
  const un = findings.filter((f) => f.rule === 'unresolved').map((f) => f.value)
  assert.deepEqual(un, ['bg-nope'])
  assert.match(findings.find((f) => f.value === 'bg-nope').fix, /typo|no such utility/)
  assert.ok(!findings.some((f) => f.value === 'text-2xs'), 'text-2xs resolves on the site entry')
  assert.deepEqual(notes, [])
})

test('rule 1: when Quill classes fail together the fix says the theme is not wired', async () => {
  const { writeFileSync, mkdtempSync } = await import('node:fs')
  const { tmpdir } = await import('node:os')
  const dir = mkdtempSync(join(tmpdir(), 'quill-check-'))
  writeFileSync(join(dir, 'globals.css'), '@import "tailwindcss";\n')
  writeFileSync(join(dir, 'page.tsx'), 'export const P = () => <div className="font-heading text-2xs bg-background text-muted-foreground">x</div>\n')
  const { findings } = await check.runCheck({ cwd: repoRoot, dirs: [dir], css: join(dir, 'globals.css') })
  const un = findings.filter((f) => f.rule === 'unresolved')
  assert.equal(un.length, 4)
  assert.match(un[0].fix, /not wired into Tailwind/)
})

test('rule 1 is skipped, not guessed, when Tailwind cannot be loaded', async () => {
  const { findings, notes } = await check.runCheck({ cwd: here, dirs: [join(here, 'check/fixture')], css: '/nonexistent.css' })
  assert.ok(!findings.some((f) => f.rule === 'unresolved'))
  assert.equal(notes.length, 1)
  assert.match(notes[0], /rule 1 skipped/)
})
