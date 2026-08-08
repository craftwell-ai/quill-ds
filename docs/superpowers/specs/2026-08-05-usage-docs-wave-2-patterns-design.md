# Component Usage Documentation — Wave 2 (Patterns) — Design

**Date:** 2026-08-05
**Status:** Approved (brainstorm with Ryan, 2026-08-05)

## Purpose

Wave 1 (merged, v0.6.0) built the single-source usage-documentation system and
proved it on three pilots: Button, Dialog, and the Alerts pattern. Wave 2
documents the remaining 49 pattern stories, closing the largest gap identified
in Wave 1's exploration (patterns had zero usage documentation before Wave 1's
Alerts pilot). Reference: `docs/superpowers/specs/2026-08-04-component-usage-docs-design.md`.

## Scope (verified 2026-08-05)

Enumerated by reading `registry.json` and the actual story files on disk —
not assumed from Wave 1's phasing note:

- **50 usage files to write** (not 49): the registry has 51 `registry:block`
  items; Alerts is already documented (Wave 1); the remaining 50 need one
  usage file each.
- **Two structural edge cases**, both verified by reading the actual story
  files:
  - `src/stories/patterns/LoginVariants.stories.tsx` is a single story file
    that renders TWO registry blocks (`login-split-panel`, `login-minimal`)
    as two separate exported stories. It needs two usage files, not one.
  - `login-oauth` is a registry block whose story file
    (`src/stories/login-oauth.stories.tsx`) lives outside
    `src/stories/patterns/` entirely, under a one-off `Blocks /` Storybook
    category (confirmed via a full title-prefix enumeration: 55 `Components
    /`, 49 `Patterns /`, 1 `Blocks /` — 105 total, reconciling exactly).
    Decision: fold it into Wave 2 (it's conceptually a login pattern,
    alongside the other three login blocks) rather than leaving it orphaned
    for Wave 3.
- Every one of the 50 remaining registry blocks already has a written
  `meta.use_when` sentence in `registry.json` (confirmed: 51/51 blocks have
  both `use_when` and `intent` populated) — this seeds `useWhen[0]`
  verbatim, per the rule Wave 1 established (`usage.useWhen[0]` must equal
  the registry's `meta.use_when` byte-for-byte for documented blocks).

## Design

### 1. Generate `modules.d.ts` instead of hand-maintaining it

Wave 1's final review flagged this as worth doing once the catalog scales
past the 3 pilots: `.storybook/modules.d.ts` needs one exact-literal
`declare module` block per usage file (a wildcard doesn't type-check under
this repo's tsconfig — verified in Wave 1). Hand-writing 50 more blocks
across 7 separate batch tasks is repetitive and error-prone.

Extend `scripts/build-usage.mjs` (the same generator that already writes
`public/usage/*.md` and injects registry `docs`/`description`/`use_when`
fields) to also emit `src/usage/modules.d.ts` from `ALL_USAGE`, with the
same explanatory header comment the hand-written version already carries.
Add a staleness test to `scripts/build-usage.test.mjs` alongside the
existing ones. This is infrastructure, done once, before any pattern
content is written — later tasks never touch this file directly.

### 2. Coverage-fence adjustments for the two edge cases

`scripts/usage-coverage.test.mjs`'s `storyFileFor(name)` helper and the
`KNOWN_UNDOCUMENTED` allowlist both currently assume one story file maps to
exactly one usage-file name. Two small, explicit fixes:

- Add a lookup table (or equivalent) mapping `login-split-panel` and
  `login-minimal` to the shared `LoginVariants.stories.tsx` file, so the
  fence's file↔usage-name check handles a file producing multiple usage
  entries.
- Add `login-oauth` → `src/stories/login-oauth.stories.tsx` as an explicit
  case, since it falls outside the `patterns/` directory the fence
  currently scans by default.

Both are done as part of the infrastructure step (alongside `modules.d.ts`
generation), before the content batches start, so no batch task needs to
touch the fence itself.

### 3. Seven content batches, grouped by Storybook's existing taxonomy

Each pattern story already lives under one of seven navigational categories
(`Patterns / Auth`, `/ Data`, `/ Forms`, `/ Marketing`, `/ Nav`, `/ Shells`,
`/ State`) — using that existing structure instead of inventing a new
grouping means the batches match how the catalog is already organized and
navigated:

1. **Auth** (7 files → 8 usage files): Forgot password, Login, Login
   variants (→ login-split-panel + login-minimal), OTP verification, Sign
   up, Signup — social first, plus `login-oauth`.
2. **Data I** (7): Activity feed, Analytics charts, Badge on card, Calendar
   page, Calendar range, Chat, Data table.
3. **Data II** (7): Invoice, Kanban board, Notifications, Order summary,
   Profile card, Search results, Stat cards.
4. **Forms** (6): Checkout, Contact form, File upload, Newsletter signup,
   Settings, Wizard.
5. **Marketing** (9): Announcement banner, FAQ, Feature section, Footer,
   Hero, Pricing, Stats band, Team section, Testimonial.
6. **Nav + Shells** (9): Command palette, Navbar, Theme selector, Dashboard,
   List + detail, Mail inbox, Page header, Sidebar navigation, Tabs page.
7. **State** (4): Cookie consent, Empty state, Error 404, Onboarding
   checklist.

`8 + 7 + 7 + 6 + 9 + 9 + 4 = 50` — reconciles exactly with the scope count
above. Each batch is one SDD task: a fresh implementer writes that batch's
usage files, wires the corresponding story files' `docs.description.component`
the same way Wave 1's pilots did, and a task-scoped reviewer checks the
whole batch before it's marked complete — identical process discipline to
Wave 1, sized so a reviewer can meaningfully hold a batch in mind at once.

### 4. Content sourcing per pattern

- `useWhen[0]`: transcribed verbatim from `registry.json`'s existing
  `meta.use_when` — not fresh writing.
- `summary`: freshly authored, one line, matching Wave 1's pilots' voice
  (states the job, not a generic description). This value *replaces* the
  pattern's registry `description` once written (Wave 1's post-review
  addendum already wired `injectRegistryDocs` to derive `description` from
  `summary` for any documented item), so it carries real weight, not just
  internal docs.
- `tokens`: read from the actual block source
  (`registry/blocks/<name>.tsx`) for the CSS custom properties it consumes
  — not guessed or copied from a similar pattern.
- `alternatives` and `rules`: genuine per-pattern judgment — what
  neighboring pattern would you reach for instead, and what's a real
  do/don't for this one. Batching by category is intended to help here: an
  implementer writing all of Auth together can cross-reference consistently
  ("use login-minimal instead of login when...").
- `a11y`: grounded in what the block's actual markup does (labels, focus
  order, keyboard behavior), not boilerplate.

No visual Do/Don't pairs in Wave 2 — explicitly out of scope, deferred to
Wave 4 per the original spec's phasing.

## Testing

No new test infrastructure beyond the coverage-fence adjustment in §2 and
the `modules.d.ts` staleness test in §1. The existing suites
(`usage-schema.test.mjs`, `usage-coverage.test.mjs`, `build-usage.test.mjs`,
extended `build-llms.test.mjs`) already validate every new entry
automatically — schema shape, story↔usage mapping, generated-file
staleness. Each batch task shrinks `KNOWN_UNDOCUMENTED` by exactly the
entries it documents; the existing "allowlist only shrinks" invariant
enforces this without any new test code.

## Out of scope

- Visual Do/Don't pairs and deep accessibility passes (Wave 4).
- The 55 remaining top-level component stories (Wave 3).
- Any change to the usage-file schema itself — Wave 2 uses exactly what
  Wave 1 shipped.

## Success criteria

- All 50 remaining registry blocks (51 total minus Alerts) have a usage
  file; `KNOWN_UNDOCUMENTED` in the coverage fence is empty for patterns.
- `modules.d.ts` is generated, not hand-maintained, and staleness-tested.
- Every documented pattern's registry `description` derives from its
  `summary` (verified by the existing mechanism from Wave 1).
- `login-split-panel`/`login-minimal` (shared file) and `login-oauth`
  (cross-directory file) are fully covered by the coverage fence, not
  silently exempted.
