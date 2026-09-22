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
    registry.items.flatMap((i) => (i.files ?? []).map((f) => f.target).filter(Boolean)).flatMap((t) => [t, t.replace(/^~\//, '')]),
  )
  const offenders = []
  for (const doc of ['DESIGN.md', 'PRODUCT.md', 'AGENTS.md']) {
    readFileSync(join(root, doc), 'utf8').split('\n').forEach((line, i) => {
      for (const m of line.matchAll(/`([^`\n]+)`/g)) {
        const s = m[1]
        if (!/^[A-Za-z0-9_.-]+(\/[A-Za-z0-9_.-]+)+$/.test(s)) continue
        // `bg-muted/50` has a slash and is no path: a utility with an opacity modifier.
        if (/^[a-z][a-z0-9-]*-[a-z0-9-]+\/\d{1,3}$/.test(s)) continue
        if (!existsSync(join(root, s)) && !targets.has(s)) offenders.push(`${doc}:${i + 1} ${s}`)
      }
    })
  }
  assert.deepEqual(offenders, [], `agent-facing docs name paths that do not exist:\n${offenders.join('\n')}`)
})

// The four Fraunces presets in the token source set `opsz`, `SOFT` and `WONK`.
// Until 0.10.13 the theme file, the CLI payload and Storybook loaded Fraunces from
// Google Fonts with `ital,opsz,wght` only, so the font file had no SOFT or WONK
// axis and those two settings were silently ignored everywhere but the site
// (next/font, self-hosted, all four axes). Every place that loads Fraunces must
// ask Google for every axis a preset names — see docs/audits/2026-09-22-fraunces-axes-audit.md.
test('every Fraunces import loads every axis the token presets set', async () => {
  const { tokens } = await import('../src/tokens/quill.tokens.mjs')
  const wanted = new Set(Object.values(tokens.fraunces).flatMap((v) => [...v.matchAll(/"([A-Za-z]{4})"/g)].map((m) => m[1])))
  assert.ok(wanted.size >= 3, `expected the presets to name axes, got ${[...wanted].join(',')}`)
  const FILES = ['registry/themes/quill.css', '.storybook/preview-head.html', '.storybook/manager.ts']
  for (const file of FILES) {
    const src = readFileSync(join(root, file), 'utf8')
    const m = src.match(/family=Fraunces:([A-Za-z,]+)@/)
    assert.ok(m, `${file}: no Google Fonts Fraunces import found`)
    const loaded = new Set(m[1].split(','))
    for (const axis of wanted) assert.ok(loaded.has(axis), `${file} loads Fraunces without the "${axis}" axis, so \`font-variation-settings: "${axis}"\` does nothing there`)
  }
  // The CLI payload embeds the theme file verbatim, so it inherits the same import.
  const payload = JSON.parse(readFileSync(join(root, 'public/r/quill.json'), 'utf8'))
  const css = payload.files.map((f) => f.content).join('\n')
  const pm = css.match(/family=Fraunces:([A-Za-z,]+)@/)
  assert.ok(pm, 'public/r/quill.json: no Fraunces import in the payload')
  for (const axis of wanted) assert.ok(pm[1].split(',').includes(axis), `public/r/quill.json loads Fraunces without "${axis}"`)
})

// The base layer lives OUTSIDE the generated span in both CSS cuts (the theme
// file that ships, and the site's), so a rule added to one can silently miss the
// other. `font-heading` text takes the Fraunces text preset through this rule.
test('both base layers give font-heading text the Fraunces text preset, headings excluded', () => {
  const RULE = /\.font-heading:not\(h1, h2, h3, h4, h5, h6\)\s*\{\s*font-variation-settings:\s*var\(--fraunces-text\);\s*\}/
  for (const file of ['registry/themes/quill.css', 'src/app/globals.css']) {
    const src = readFileSync(join(root, file), 'utf8')
    assert.match(src, RULE, `${file}: the .font-heading:not(h1…h6) rule is missing or changed`)
    // the element rules it defers to must still be there
    assert.match(src, /h1, h2, h3, h4, h5, h6 \{[^}]*font-variation-settings: var\(--fraunces-text\)/, `${file}: h1–h6 text preset rule missing`)
    assert.match(src, /h1 \{[^}]*font-variation-settings: var\(--fraunces-display\)/, `${file}: h1 display preset rule missing`)
  }
})
