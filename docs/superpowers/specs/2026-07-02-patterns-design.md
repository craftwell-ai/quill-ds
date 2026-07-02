# Patterns (Blocks) — Design Spec

**Date:** 2026-07-02
**Phase:** Phase 4 (Patterns). Depends on the component library (built from the same Quill components). Runs after / alongside the Components phase.
**Intent:** An **expansive** catalog of common, genuinely useful UI patterns ("blocks") — shadcn-style — with Quill styling applied, present in **both** Storybook (a `Patterns` section) and Figma (a `Patterns` page group), kept visually distinct from Components.

## Goal

Give consumers ready-to-use, Quill-styled compositions for the situations they hit repeatedly — auth, app shells, data views, forms, marketing, empty/error states — so a SkillDeck can assemble screens fast without redesigning primitives.

## Principles

- **Code-first, one source of truth.** Each pattern is a Storybook story that **composes existing Quill components** (`src/components/ui/*`). Because they use Quill components, **Quill styling + dark mode flow automatically** — no restyling.
- **Distinct section.** Storybook: top-level **`Patterns / <Category> / <Name>`** (already reserved in the sidebar taxonomy + storySort). Figma: a **`Patterns`** page group, one **`❖ <Pattern Name>`** page per pattern (mirrors the per-item page rule).
- **No hardcoded values** (Figma side): every pattern screen is assembled from **component instances** + token-bound containers/spacing — nothing literal, so token/variant changes propagate.
- **Accessibility holds.** Patterns pass the enforced a11y suite (landmarks, headings, labels, focus order) — patterns are where a11y regressions hide, so each is tested.
- **Curate for value, breadth over exhaustiveness of low-value blocks.** Include the widely-useful; skip niche/duplicative shadcn blocks. Note anything intentionally deferred.

## Target catalog (expansive — grouped)

**Auth** — Login · Sign-up · Forgot-password · OTP verify · Two-column auth (form + brand panel)
**App shells** — Dashboard shell (sidebar + header + content) · Settings layout (nav + panel) · Two-column app · Page header (title + actions + breadcrumbs)
**Data** — Data table (sortable, filterable, paginated, row actions) · Stats/KPI card row · List + detail · Activity feed / timeline · Table toolbar (search + filters + bulk actions)
**Forms** — Profile/settings form · Multi-section form (card sections) · Form with validation states · Form in a dialog/sheet · Filter form / faceted search
**Cards** — Card grid · Pricing table · Feature grid · Product/notification cards · Media object list
**Marketing** — Hero · Feature section · CTA band · Testimonial · Logo cloud · Footer
**Comms / state** — Empty states (several) · Error / 404 / 500 · Loading / skeleton screens · Cookie/consent bar · Toast/notification demos · Confirmation dialogs
**Navigation** — Top navbar · Sidebar nav · Command menu (⌘K) · Tabs page · Breadcrumb page · Pagination footer

(Each becomes one Storybook story + one Figma `❖` page. Order of build: highest-use first — auth, dashboard shell, data table, settings form, empty/error states, then the rest.)

## Storybook structure

```
src/stories/patterns/<category>/<Name>.stories.tsx   → title: 'Patterns / <Category> / <Name>'
```
- Each story renders the composed pattern at a realistic width; `parameters.layout: 'fullscreen'` for shells/pages.
- A `play` function asserts key structure (landmarks/headings present) so a11y + composition are tested.

## Figma structure

- A `Patterns` page group; one `❖ <Pattern Name>` page each.
- Each pattern = a frame assembled from **instances** of the Figma component sets (Components phase) + token-bound layout frames (auto-layout, spacing/color/radius bound to variables).
- Built via `use_figma` (compose instances; no re-drawing). Screenshot-verify against the Storybook render.
- Depends on the Components phase having produced the component sets the pattern instances reference.

## Architecture / artifacts

| Artifact | Responsibility |
|---|---|
| `src/stories/patterns/**` | code-first pattern stories (compose Quill components) |
| `figma/patterns/<name>.figma.js` | re-runnable `use_figma` builder per pattern (upsert `❖ <Name>` page; compose instances; bind layout tokens) |
| `figma/patterns/README.md` | catalog, build order, dependencies on component sets, file key |

## Verification

- `test-storybook` green + **0 a11y** for every pattern story (landmarks/headings/labels/focus verified via `play`).
- Dark mode: each pattern renders correctly under `[data-theme="dark"]`.
- Figma: each `❖` pattern page present; screenshot parity vs Storybook; read-back confirms instances + token-bound containers (no literals).
- Idempotent Figma builders (upsert by page/frame name).

## Dependencies & sequencing

- **Requires** Components phase component sets (patterns instance them in Figma; code patterns need the components, which exist).
- Build **incrementally**: ship a first wave (auth, dashboard shell, data table, settings form, empty/error) code-first in Storybook, then mirror to Figma, then expand. Each pattern is independently testable and mergeable.

## Out of scope

- New primitive components (those are the Components phase). Patterns only *compose*.
- Content/copywriting beyond realistic placeholder.
- Full responsive breakpoint matrices per pattern (note where a mobile variant is worth a second story).
