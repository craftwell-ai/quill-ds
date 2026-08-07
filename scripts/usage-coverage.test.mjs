import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { ALL_USAGE } from '../src/usage/index.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const storiesDir = join(root, 'src/stories')

// Story files whose usage name(s) can't be derived from the filename by the
// default kebab-case rule — either because one file renders more than one
// registry block as separate exported stories (LoginVariants), or because
// the filename itself diverges from the block's registry slug (e.g.
// SettingsForm.stories.tsx documents 'settings', not 'settings-form'). Both
// directions of the mapping are spelled out explicitly here.
const MULTI_BLOCK_STORIES = {
  'patterns/LoginVariants.stories.tsx': ['login-split-panel', 'login-minimal'],
  'patterns/SettingsForm.stories.tsx': ['settings'],
  'patterns/DashboardShell.stories.tsx': ['dashboard'],
  'patterns/Error404.stories.tsx': ['error-404'],
}
const USAGE_NAME_TO_MULTI_BLOCK_STORY = Object.fromEntries(
  Object.entries(MULTI_BLOCK_STORIES).flatMap(([file, names]) => names.map((n) => [n, file])),
)

export function storyFileFor(name) {
  if (USAGE_NAME_TO_MULTI_BLOCK_STORY[name]) return join(storiesDir, USAGE_NAME_TO_MULTI_BLOCK_STORY[name])
  const pascal = name.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join('')
  const candidates = [
    join(storiesDir, `${name}.stories.tsx`),
    join(storiesDir, `${pascal}.stories.tsx`),
    join(storiesDir, 'patterns', `${pascal}.stories.tsx`),
  ]
  return candidates.find(existsSync)
}

test('every usage file has a story file', () => {
  for (const u of ALL_USAGE) {
    assert.ok(storyFileFor(u.name), `usage '${u.name}' has no story file under src/stories`)
  }
})

test('every visual rule has a rendered DoDont pair in its story file', () => {
  for (const u of ALL_USAGE) {
    const file = storyFileFor(u.name)
    if (!file) continue
    const source = readFileSync(file, 'utf8')
    for (const r of u.rules.filter((r) => r.visual)) {
      assert.ok(
        source.includes(`id="${r.id}"`),
        `story for '${u.name}' renders no DoDont pair for visual rule '${r.id}'`,
      )
    }
  }
})

// Wave-1 allowlist: stories that predate the usage system. Waves 2-3 shrink
// this list to empty. Entries may ONLY be removed, never added — a new
// component must ship with a usage file.
const KNOWN_UNDOCUMENTED = new Set([
  'HoverCard.stories.tsx',
  'ToggleGroup.stories.tsx',
  'accordion.stories.tsx',
  'alert-dialog.stories.tsx',
  'alert.stories.tsx',
  'aspect-ratio.stories.tsx',
  'avatar.stories.tsx',
  'badge.stories.tsx',
  'breadcrumb.stories.tsx',
  'button-group.stories.tsx',
  'calendar.stories.tsx',
  'card.stories.tsx',
  'carousel.stories.tsx',
  'chart.stories.tsx',
  'checkbox.stories.tsx',
  'collapsible.stories.tsx',
  'combobox.stories.tsx',
  'command.stories.tsx',
  'context-menu.stories.tsx',
  'drawer.stories.tsx',
  'dropdown-menu.stories.tsx',
  'empty.stories.tsx',
  'field.stories.tsx',
  'input-group.stories.tsx',
  'input-otp.stories.tsx',
  'input.stories.tsx',
  'item.stories.tsx',
  'kbd.stories.tsx',
  'label.stories.tsx',
  'menubar.stories.tsx',
  'native-select.stories.tsx',
  'navigation-menu.stories.tsx',
  'pagination.stories.tsx',
  'patterns/CookieConsent.stories.tsx',
  'patterns/EmptyState.stories.tsx',
  'patterns/Error404.stories.tsx',
  'patterns/Onboarding.stories.tsx',
  'popover.stories.tsx',
  'progress.stories.tsx',
  'radio-group.stories.tsx',
  'resizable.stories.tsx',
  'scroll-area.stories.tsx',
  'select.stories.tsx',
  'separator.stories.tsx',
  'sheet.stories.tsx',
  'sidebar.stories.tsx',
  'skeleton.stories.tsx',
  'slider.stories.tsx',
  'sonner.stories.tsx',
  'spinner.stories.tsx',
  'switch.stories.tsx',
  'table.stories.tsx',
  'tabs.stories.tsx',
  'textarea.stories.tsx',
  'toggle.stories.tsx',
  'tone-badge.stories.tsx',
  'tooltip.stories.tsx',
])

test('every story outside the allowlist has a usage file', () => {
  const files = [
    ...readdirSync(storiesDir).filter((f) => f.endsWith('.stories.tsx')),
    ...readdirSync(join(storiesDir, 'patterns')).filter((f) => f.endsWith('.stories.tsx')).map((f) => `patterns/${f}`),
  ]
  const documented = new Set(ALL_USAGE.map((u) => u.name))
  for (const f of files) {
    if (KNOWN_UNDOCUMENTED.has(f)) continue
    if (MULTI_BLOCK_STORIES[f]) {
      for (const name of MULTI_BLOCK_STORIES[f]) {
        assert.ok(documented.has(name), `story '${f}' has no usage file for '${name}' (expected src/usage/${name}.usage.mjs)`)
      }
      continue
    }
    const base = f.replace(/^patterns\//, '').replace(/\.stories\.tsx$/, '')
    const kebab = base.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
    assert.ok(documented.has(kebab), `story '${f}' has no usage file (expected src/usage/${kebab}.usage.mjs)`)
  }
})
