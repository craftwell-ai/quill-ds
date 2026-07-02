# Quill → Figma sync

**Target file:** Quill Design System — `Dcf8lEB7Ash71iNl7WN4Jq`
(<https://www.figma.com/design/Dcf8lEB7Ash71iNl7WN4Jq>) · team: RP Designs (Pro) · project 98994984

**Source of truth:** code. `src/tokens/quill.tokens.mjs` → `npm run build:tokens` → `tokens/quill.figma.json` (DTCG) → this sync. Figma is a generated mirror.

## Re-run the foundation sync

1. Ensure `tokens/quill.figma.json` is current: `npm run build:tokens`.
2. Load the `figma-use` skill, then call the Figma MCP `use_figma` on file `Dcf8lEB7Ash71iNl7WN4Jq` with:
   - `const DTCG = <contents of tokens/quill.figma.json>;` prepended, followed by the contents of
     `figma/sync-foundations.figma.js`, then `await syncFoundations(DTCG)`.
3. The sync **upserts by name**: existing variables/styles update in place; nothing duplicates.
   Running it a second time creates zero new objects.

## What this manages

- Variables: `Quill Primitives` collection (modes: Light, Dark) + `Quill Semantic` collection (aliases → Primitives).
- Text styles (`Display/*`, `Heading/*`, `Body/*`, `Accent`, `Eyebrow`).
- Effect styles (`Elevation/xs·sm·base·lg·pop`, light values).

**Not managed here:** dark-mode elevation (Figma effect styles can't hold modes) — deferred to the component phase. Components, Code Connect, and patterns are later phases.

## Built (verified 2026-07-02)

- `Quill Primitives` collection, modes **Light/Dark** — **67 variables**:
  18 color, 12 `spacing/*`, 8 `corner-radius/*`, 5 `border-width/*`, 10 `type/*`, 4 `font/*`, 10 `shadow/*/*`.
- `Quill Semantic` collection, single mode — 47 alias variables (text 5, surface 3, border 3, status 5, shadcn 31).
- 12 text styles (`Display/*`, `Heading/*`, `Body/*`, `Accent`, `Eyebrow`).
- 5 **mode-aware** effect styles (`Elevation/xs·sm·base·lg·pop`): each shadow's color is bound to a
  `shadow/*/*` variable, so the same style adapts Light↔Dark automatically (no separate dark set).
- `Foundations Specimen` frame (node `10:2`) — swatches, type, and elevation bound to the variables/styles; verified in both Light and Dark.
- **Idempotency verified:** re-running the full sync reports 0 created / all updated (no duplicates).

### Not representable in Figma (genuine platform limits — stay CSS-only)
- **Motion** (easing/duration/transform) — Figma has no motion variable type.
- **Fraunces optical axes** (opsz/SOFT/WONK) — the Plugin API exposes no variable-font-axis control;
  text styles use base Fraunces (Regular/Italic), which is the closest available.
Both are marked `$type: other` / CSS-only in the DTCG and documented on the Storybook Tokens page.

## Publish as a library (manual — required)

The Plugin API / MCP cannot publish a team library. In Figma, open the file → **Assets** panel → **Publish** (or the file menu → Publish library) → confirm. Later phases (components, patterns) consume the published library.
