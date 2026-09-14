import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

import { ALL_USAGE } from '../src/usage/index.mjs'
import { renderUsagePage, renderModulesDts, usageDocsField, USAGE_DIR, REGISTRY_PATH, MODULES_DTS_PATH } from './build-usage.mjs'
import { renderThemeDocs, accentNames, LLMS_URL } from '../src/usage/theme-docs.mjs'
import { ALL_MODES, DEFAULT_MODE, DEFAULT_ACCENT } from '../src/tokens/themes.mjs'

test('src/usage/modules.d.ts is generated and current (run `npm run build:usage`)', () => {
  assert.equal(readFileSync(MODULES_DTS_PATH, 'utf8'), renderModulesDts(), 'src/usage/modules.d.ts is stale — run `npm run build:usage`')
})

test('every usage entry has a committed, current public usage page (run `npm run build:usage`)', () => {
  for (const u of ALL_USAGE) {
    const path = join(USAGE_DIR, `${u.name}.md`)
    assert.ok(existsSync(path), `public/usage/${u.name}.md is missing — run \`npm run build:usage\``)
    assert.equal(readFileSync(path, 'utf8'), renderUsagePage(u), `public/usage/${u.name}.md is stale — run \`npm run build:usage\``)
  }
})

test('registry.json carries the derived docs field, description, and use_when for documented items', () => {
  const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'))
  const byName = new Map(registry.items.map((i) => [i.name, i]))
  for (const u of ALL_USAGE) {
    const item = byName.get(u.name)
    if (!item) continue // primitives like button/dialog are not registry items
    assert.equal(item.docs, usageDocsField(u), `registry item '${u.name}' docs is stale — run \`npm run build:usage\``)
    assert.equal(item.description, u.summary, `registry item '${u.name}' description diverges from its usage file summary`)
    if (item.type === 'registry:block') {
      assert.equal(item.meta?.use_when, u.useWhen[0], `registry item '${u.name}' use_when diverges from its usage file`)
    }
  }
})

test('the base `quill` item ships install-time docs naming every theme and the default accent', () => {
  // This is the one item every consuming app installs, and the only moment the
  // CLI prints guidance. It shipped with no `docs` at all for months, which is
  // why apps were never told that `--yes` silently skips a changed file.
  const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'))
  const base = registry.items.find((i) => i.name === 'quill')
  assert.ok(base, 'base theme item "quill" not found in registry')
  assert.equal(base.docs, renderThemeDocs(), 'base item docs is stale — run `npm run build:usage`')

  const docs = renderThemeDocs()
  for (const m of ALL_MODES) {
    assert.match(docs, new RegExp(m.label), `install docs never name the ${m.label} theme`)
    if (m.attr !== DEFAULT_MODE.attr) {
      assert.ok(docs.includes(`data-theme="${m.attr}"`), `install docs never give the data-theme value for ${m.label}`)
    }
  }
  for (const a of accentNames()) {
    assert.match(docs, new RegExp(a), `install docs never name the ${a} accent`)
  }
  assert.match(docs, new RegExp(`${DEFAULT_ACCENT} \\(default\\)`), 'install docs must mark the default accent')
  // The two rules an app cannot discover on its own, and fails silently without.
  assert.match(docs, /--overwrite/, 'install docs must state the update rule (--yes silently skips)')
  assert.match(docs, /never raw pigments/, 'install docs must state the chart-token rule')
  assert.ok(docs.includes(LLMS_URL), 'install docs must point agents at llms.txt')
})

test('no published usage page carries an HTML entity where an agent should read a tag', () => {
  // 26 of 106 pages printed literal `&lt;` for weeks because the Storybook
  // escaper was reused for the markdown pages.
  for (const u of ALL_USAGE) {
    const page = readFileSync(join(USAGE_DIR, `${u.name}.md`), 'utf8')
    assert.ok(!page.includes('&lt;'), `public/usage/${u.name}.md contains &lt; — the markdown format must wrap tags in backticks instead`)
  }
})
