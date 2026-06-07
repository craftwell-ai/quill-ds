# Storybook Design System — Spec

**Project:** Quill Design System (`quill-ds`)
**Date:** 2026-06-07
**Status:** Approved

---

## 1. Goal

Set up Storybook 8 as a published-quality, Quill-branded documentation site for all 55 ShadCN components. Every component gets Level C stories: full prop controls, all variants, interactive states, design token documentation, and an AllVariants gallery. Four MDX pages document the core design tokens (colors, typography, spacing, elevation). The Storybook manager UI is fully branded with the Quill visual identity.

---

## 2. Architecture

### File structure

```
.storybook/
  main.ts            — @storybook/nextjs framework, story globs, addon list
  preview.tsx        — paper background decorator, globals.css import, backgrounds config
  quill-theme.ts     — @storybook/theming custom brand theme

src/stories/
  docs/
    Introduction.mdx   — welcome page: logotype + brand one-liner + quick-start
    Colors.mdx         — papers, inks, pigments, hairlines, semantic aliases as swatches
    Typography.mdx     — type scale table, Fraunces presets, Inter usage rules
    Spacing.mdx        — space-1 through space-24 with visual rulers
    Elevation.mdx      — shadow-xs through shadow-pop on live card examples
  accordion.stories.tsx
  alert.stories.tsx
  alert-dialog.stories.tsx
  aspect-ratio.stories.tsx
  avatar.stories.tsx
  badge.stories.tsx
  breadcrumb.stories.tsx
  button.stories.tsx
  button-group.stories.tsx
  calendar.stories.tsx
  card.stories.tsx
  carousel.stories.tsx
  chart.stories.tsx
  checkbox.stories.tsx
  collapsible.stories.tsx
  combobox.stories.tsx
  command.stories.tsx
  context-menu.stories.tsx
  dialog.stories.tsx
  drawer.stories.tsx
  dropdown-menu.stories.tsx
  empty.stories.tsx
  field.stories.tsx
  hover-card.stories.tsx
  input.stories.tsx
  input-group.stories.tsx
  input-otp.stories.tsx
  item.stories.tsx
  kbd.stories.tsx
  label.stories.tsx
  menubar.stories.tsx
  native-select.stories.tsx
  navigation-menu.stories.tsx
  pagination.stories.tsx
  popover.stories.tsx
  progress.stories.tsx
  radio-group.stories.tsx
  resizable.stories.tsx
  scroll-area.stories.tsx
  select.stories.tsx
  separator.stories.tsx
  sheet.stories.tsx
  sidebar.stories.tsx
  skeleton.stories.tsx
  slider.stories.tsx
  sonner.stories.tsx
  spinner.stories.tsx
  switch.stories.tsx
  table.stories.tsx
  tabs.stories.tsx
  textarea.stories.tsx
  toggle.stories.tsx
  toggle-group.stories.tsx
  tooltip.stories.tsx
```

`direction.tsx` is a utility provider, not a displayable component — excluded from stories.

---

## 3. Storybook configuration

### `.storybook/main.ts`

- Framework: `@storybook/nextjs`
- Story glob: `src/stories/**/*.stories.@(ts|tsx)` and `src/stories/docs/**/*.mdx`
- Addons:
  - `@storybook/addon-docs` — autodocs, MDX support
  - `@storybook/addon-a11y` — accessibility audit panel per component
  - `@storybook/addon-viewport` — responsive breakpoint testing

### `.storybook/preview.tsx`

- Imports `../src/app/globals.css` so all Quill tokens and Tailwind utilities are available
- Global decorator wraps every story in a `<div>` with `bg-background` (paper) and appropriate padding
- Background options configured: `paper` (#F5EDDD, default), `paper-warm` (#EFE4CE), `paper-deep` (#E8DCC0)
- `parameters.layout` defaults to `'centered'`; individual stories override to `'padded'` or `'fullscreen'` where needed

### `.storybook/quill-theme.ts`

Built with `create` from `@storybook/theming`:

| Property | Value |
|---|---|
| `base` | `'light'` |
| `brandTitle` | `'Quill Design System'` |
| `brandImage` | inline SVG data URI — icon 2 (ink silhouette, terracotta nib) + "Quill" wordmark |
| `appBg` | `#F5EDDD` (paper) |
| `appContentBg` | `#F5EDDD` |
| `appPreviewBg` | `#F5EDDD` |
| `barBg` | `#EFE4CE` (paper-warm) |
| `colorPrimary` | `#C4684B` (terracotta) |
| `colorSecondary` | `#C4684B` |
| `appBorderColor` | `rgba(42,38,34,0.12)` (line-soft) |
| `appBorderRadius` | `8` |
| `textColor` | `#2A2622` (ink) |
| `textMutedColor` | `#8A7F72` (ink-muted) |
| `fontBase` | `'Inter', sans-serif` |
| `fontCode` | `ui-monospace, 'SF Mono', monospace` |

---

## 4. Logotype

**Icon:** Ink silhouette quill feather (option 2) — filled `#2A2622`, paper-warm barb lines, terracotta nib stroke. Defined as an inline SVG at `viewBox="0 0 48 48"`.

**Wordmark:** "Quill" in Fraunces, weight 400, italic, `font-variation-settings: 'opsz' 144, 'SOFT' 50, 'WONK' 0`.

**Lockup:** Icon in 52×52 paper-deep rounded square, wordmark beside it, "Design System" descriptor in Inter 500 uppercase tracked below.

Stored as `src/stories/assets/quill-logo.svg` and referenced in `quill-theme.ts` via `brandImage`.

---

## 5. Level C story pattern

Every story file follows this structure:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Component } from '@/components/ui/component'

const meta = {
  title: 'UI / ComponentName',
  component: Component,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',          // override per component where needed
    backgrounds: { default: 'paper' },
    docs: {
      description: {
        component: `
### Design tokens
\`--token-name\` · \`--token-name\` · ...

### Rules
Prose from DESIGN.md relevant to this component.
        `
      }
    }
  },
  argTypes: {
    // every public prop: control type, description, default value
  }
} satisfies Meta<typeof Component>

export default meta
type Story = StoryObj<typeof meta>

// One story per meaningful variant
export const Default: Story = { args: { ... } }
export const VariantName: Story = { args: { ... } }

// State stories where applicable
export const Disabled: Story = { args: { disabled: true, ... } }
export const Invalid: Story  = { ... }   // inputs/forms only

// Gallery — all variants in one view
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      {/* all variants side by side */}
    </div>
  )
}
```

### Layout overrides by component type

| Type | `layout` |
|---|---|
| Inline elements (Badge, Kbd, Separator, Spinner, Skeleton) | `'centered'` |
| Form elements (Input, Select, Checkbox, Slider…) | `'centered'` |
| Cards, surfaces, dialogs | `'centered'` |
| Sidebar | `'fullscreen'` |
| NavigationMenu | `'padded'` |
| Charts, Table | `'padded'` |

### `argTypes` completeness rule

Every prop that appears in the component's TypeScript interface must have an entry in `argTypes` with:
- `control`: appropriate control type (`'select'`, `'boolean'`, `'text'`, `'number'`, `'color'`)
- `description`: one sentence
- `table.defaultValue.summary`: the default if one exists

Internal/framework props (`asChild`, `ref`, `className`) are hidden with `table: { disable: true }`.

---

## 6. MDX documentation pages

### `Introduction.mdx`
- Quill logotype at 2× scale
- Brand one-liner: *"Skills, made by hand."*
- Three-column token preview: one paper swatch, one ink specimen, one terracotta accent
- Link to DESIGN.md in the repo

### `Colors.mdx`
Three sections with live CSS variable swatches:
1. **Papers** — `--paper`, `--paper-warm`, `--paper-deep` with hex + usage note
2. **Inks** — `--ink`, `--ink-soft`, `--ink-muted`
3. **Pigments** — terracotta, moss, indigo, gold (each with `-deep` variant)
4. **Hairlines** — `--line-faint` through `--line-strong` shown as border samples
5. **Semantic aliases** — `--surface-*`, `--text-*`, `--border-*`, `--success/warning/danger/info`

### `Typography.mdx`
- Type scale table: token → size → sample text at that size
- Fraunces presets: `--fraunces-display`, `--fraunces-accent`, `--fraunces-text`, `--fraunces-caption` rendered live
- Inter weight specimens: 400, 500, 600
- Eyebrow pattern: uppercase Inter + terracotta dash
- Rules from DESIGN.md §3

### `Spacing.mdx`
- Visual ruler: each `--space-*` token shown as a filled bar
- Usage note per step (e.g. "space-4/6: component internals", "space-24: section breathing room")

### `Elevation.mdx`
- Five cards, each with a different shadow level (`--shadow-xs` through `--shadow-pop`)
- Label + CSS variable name on each card
- Note on the sepia ink shadow formula

---

## 7. Dependencies to install

```bash
npx storybook@latest init --yes
npm install --save-dev @storybook/addon-a11y @storybook/theming
```

`@storybook/addon-docs` and `@storybook/addon-viewport` are included in the default Storybook init for Next.js.

---

## 8. Out of scope

- Dark mode stories (Quill has no dark mode)
- `direction.tsx` (utility provider, not a UI component)
- Storybook deployment/hosting (separate concern)
- Custom addon development
