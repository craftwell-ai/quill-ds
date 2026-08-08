# Component Usage Documentation — Wave 3 (Primitives + Visual Pairs) — Design

**Date:** 2026-08-08
**Status:** Approved (brainstorm with Ryan, 2026-08-08)

## Purpose

Wave 2 (merged, v0.7.0) documented all 50 pattern blocks, closing the pattern
half of the catalog. Wave 3 closes the rest, in two parts:

1. **New usage docs for the 53 remaining primitive components** (Accordion,
   Badge, Select, Table, Tooltip, etc.) — the actual reusable building blocks,
   as opposed to Wave 2's demo compositions. After this, `KNOWN_UNDOCUMENTED`
   in `scripts/usage-coverage.test.mjs` is empty: every story in the catalog
   has a usage file.
2. **Visual Do/Don't pairs for the whole system** — not just Wave 3's 53 new
   primitives, but retrofitted onto Wave 1's `dialog` and `alerts` and all 50
   of Wave 2's patterns. `button` already has one (`src/stories/button.stories.tsx`,
   the `DoDont` story, rule id `one-primary`) and proves the mechanism works;
   every other documented item in the catalog currently has zero. Originally
   deferred to a hypothetical "Wave 4" in the Wave 2 spec's Out of scope
   section — pulled forward and combined with Wave 3 per Ryan's explicit
   request ("is it possible to do that for every component, pattern and
   block").

Explicitly **not** in scope: moving the Do/Don't example into the Rules
section of the rendered docs page. That was investigated during brainstorming
— Storybook's `Description` block renders a plain markdown string
(`node_modules/@storybook/addon-docs/dist/blocks.js`, `DescriptionBody` →
`<Markdown>`), which cannot embed a live React component. Doing so for real
would require a shared custom `docs.page` component replacing the current
`renderUsageDocs` markdown-string pipeline for every documented item — a
real architecture change. Ryan decided against it: the existing mechanism
(a separate `DoDont` story per item, same as `button` already does) is what
ships in Wave 3.

## Scope (verified 2026-08-08)

- **53 primitive components need new usage files** — enumerated directly
  from `src/stories/*.stories.tsx` (56 top-level story files) minus the 3
  already documented (`button`, `dialog`, `login-oauth`).
- **No naming mismatches**: every one of the 53 filenames kebab-derives
  cleanly to its expected usage name (verified with the same script used to
  find Wave 2's `settings`/`dashboard`/`error-404` mismatches — it found
  nothing this time).
- **No shared-file edge cases**: every file has multiple exported story
  *variants* (2–8 each — `Default`, `Disabled`, `AllVariants`, `Dark`, etc.),
  but that's the same shape as Wave 1's `button.stories.tsx` (13 exports, one
  `button.usage.mjs`), not Wave 2's `LoginVariants` problem (one file, two
  distinct registry blocks). No `MULTI_BLOCK_STORIES` fence additions needed.
- **No infra changes needed**: Wave 2's `modules.d.ts` generator
  (`scripts/build-usage.mjs`) and the coverage-fence override mechanism
  (`scripts/usage-coverage.test.mjs`) are already generic and reusable.
  Confirmed, not assumed — this is the first wave transition that doesn't
  need its own infra step.
- **No new test infrastructure needed for visual pairs either**: the
  "every visual rule has a rendered DoDont pair in its story file" test in
  `scripts/usage-coverage.test.mjs` and the `DoDontPair` component
  (`src/stories/DoDont.tsx`) already exist and already work — proven by
  `button`'s pilot. This wave is pure content authoring against existing,
  tested infrastructure.
- **All 53 primitives sit flat under `Components /`** in Storybook — unlike
  patterns, there's no existing sub-folder taxonomy to mirror, so Phase 1's
  batches use an editorial functional grouping instead (below).
- **Primitives are structurally heavier than patterns**: real variant/prop
  logic (`select.tsx` 208 lines, `calendar.tsx` 221 lines) vs. Wave 2's demo
  compositions (`badge-on-card.tsx` 14 lines) — grounding follows Wave 1's
  `button`/`dialog` pilots, not Wave 2's simpler pattern-grounding process.

## Design

### Phase 1 — New usage docs for 53 primitives (6 batches)

Grouped by function, not by an existing taxonomy (none exists for
components). Grouping this way lets an implementer writing a batch compare
genuine siblings for the `alternatives` field, the same benefit Wave 2's
category batches gave patterns:

1. **Form inputs** (9): Input, Textarea, NativeSelect, Select, Combobox,
   InputOTP, InputGroup, Label, Field.
2. **Form controls** (7): Checkbox, RadioGroup, Switch, Slider, Toggle,
   ToggleGroup, ButtonGroup.
3. **Overlays & menus** (11): AlertDialog, Drawer, Sheet, Popover, Tooltip,
   HoverCard, ContextMenu, DropdownMenu, Menubar, Command, NavigationMenu.
4. **Disclosure & layout** (10): Accordion, Collapsible, Breadcrumb,
   Pagination, Tabs, Sidebar, Resizable, ScrollArea, AspectRatio, Separator.
5. **Data display** (9): Avatar, Badge, ToneBadge, Card, Table, Item, Kbd,
   Empty, Skeleton.
6. **Feedback, status & rich media** (7): Alert, Progress, Spinner, Sonner,
   Calendar, Carousel, Chart.

`9 + 7 + 11 + 10 + 9 + 7 = 53` — reconciles exactly.

Each batch: write the full usage file (summary, `useWhen`, `alternatives`,
`rules`, `a11y`, `tokens` — same schema Wave 1/2 shipped, no schema changes),
wire the story file's `docs.description.component` via `renderUsageDocs`
exactly like every prior wave, **and** write the Do/Don't example(s) for
this batch's items alongside the content (see "Visual pair authoring"
below) — new content and its visual examples are written together, not in
a separate pass.

### Phase 2 — Retrofit visual pairs onto already-shipped docs (8 batches)

Reuses Wave 2's exact category groupings verbatim (no reason to redesign
proven batches), plus one new small batch for the Wave 1 pilots that predate
the pattern system:

1. **Wave 1 pilots** (2): `dialog`, `alerts` (`button` already has one).
2. **Auth** (8): forgot-password, login, login-split-panel, login-minimal,
   login-oauth, otp-verification, signup, signup-social.
3. **Data I** (7): activity-feed, analytics-charts, badge-on-card,
   calendar-page, calendar-range, chat, data-table.
4. **Data II** (7): invoice, kanban, notifications, order-summary,
   profile-card, search-results, stat-cards.
5. **Forms** (6): checkout, contact-form, file-upload, newsletter,
   settings, wizard.
6. **Marketing** (9): announcement-banner, faq, feature-section, footer,
   hero, pricing, stats-band, team-section, testimonial.
7. **Nav + Shells** (9): command-palette, navbar, theme-selector,
   dashboard, list-detail, mail-shell, page-header, sidebar-nav, tabs-page.
8. **State** (4): cookie-consent, empty-state, error-404, onboarding.

`2 + 8 + 7 + 7 + 6 + 9 + 9 + 4 = 52` — reconciles exactly (53 total
documented Wave 1/2 items minus `button`, which is already done).

Each batch: review the item's existing rule(s). If at least one genuinely
shows well as a rendered side-by-side comparison, flip it to `visual: true`
and write the example. If none of the existing rules are visual in nature
(a security caveat, a data-timing rule, an accessibility behavior — not a
layout/spacing/emphasis one), write one additional rule that is, rather than
forcing a bad-fit visual onto an unsuitable rule. Not every item needs a
visual pair on every rule — `button` shipped with 3 rules and only 1 marked
`visual: true`; that ratio is the expectation, not an exception.

### Visual pair authoring (applies to both phases)

Mechanically identical to `button`'s existing pilot
(`src/stories/button.stories.tsx`, rule id `one-primary`):

- Add (or reuse) a `DoDont` story in the item's `.stories.tsx` file:
  `export const DoDont: Story = { parameters: { controls: { disable: true } }, render: () => <DoDontPair usage={usage} id="<rule-id>" doExample={...} dontExample={...} /> }`.
- `doExample`/`dontExample` are real, rendered instances of the actual
  component — not illustrations or descriptions — built the correct way and
  the wrong way respectively.
- The caption text is pulled from `usage.rules.find(r => r.id === id)` at
  render time (`src/stories/DoDont.tsx`), so it is structurally impossible
  for the example to drift from the written rule.
- `scripts/usage-coverage.test.mjs`'s existing "every visual rule has a
  rendered DoDont pair in its story file" test enforces the pairing already
  — no new test needed, it just starts actually checking something once
  rules are marked `visual: true`.

## Testing

No new test infrastructure, for either phase. `usage-schema.test.mjs`,
`usage-coverage.test.mjs` (including its already-built visual-pair check),
`build-usage.test.mjs`, and `build-llms.test.mjs` validate every new entry
and every new visual pair automatically.

## Out of scope

- Moving the Do/Don't example into the Rules section of the rendered docs
  page (would require a new custom `docs.page` architecture — investigated
  and explicitly declined this wave, see Purpose).
- Any change to the usage-file schema — Wave 3 uses exactly what Wave 1
  shipped.
- Deep, dedicated accessibility audits beyond what's naturally grounded in
  each item's actual markup/ARIA behavior while writing its `a11y` field
  (same depth Wave 1's `button`/`dialog` pilots already established).

## Success criteria

- All 53 primitives have a usage file; `KNOWN_UNDOCUMENTED` in the coverage
  fence is **completely empty** — zero entries, components and patterns
  both. This is the last wave; after this the entire catalog is covered.
- Every one of the ~105 documented items (53 new + 52 retrofit) has been
  reviewed for a visual-pair opportunity; each `visual: true` rule has a
  passing `DoDontPair` in its story file, verified by the existing coverage
  test.
- Each batch (14 total across both phases) verified live in Storybook before
  commit — docs page renders correctly, the Do/Don't example renders
  correctly in both themes — same discipline Wave 2 used.
- Any real bugs found while grounding docs against source (Wave 2 found two:
  a colorblind-accessibility issue in `analytics-charts`, an accent-token
  bug in `stats-band`) get flagged to Ryan the same way, not silently
  documented around.
