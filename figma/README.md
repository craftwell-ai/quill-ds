# Quill → Figma sync

**Target file:** Quill Design System — `Dcf8lEB7Ash71iNl7WN4Jq`
(<https://www.figma.com/design/Dcf8lEB7Ash71iNl7WN4Jq>) · Figma Pro team, project 98994984

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

## Re-synced 2026-07-10

Re-run after the a11y token overhaul: created `color/line/control` (the solid
field-border primitive added after the last sync), updated 18 colors / 44
scalars / 47 semantic aliases / 14 text styles / 5 elevation styles in place.
`border/field` and `shadcn/input` now alias `line/control`. Zero new objects
besides the one genuinely new variable — idempotency verified.

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

## Component sync — pull & push (bi-directional, code is the ultimate SOT)

Beyond the foundation sync above, individual components round-trip between Figma and
code. The philosophy: **bi-directional transport, one-way authority** — edits may
originate on either side, but when they disagree, code wins. Proven end-to-end
2026-08-12 on the Test fixture.

**The fixture pair** (keep it — it's the sanity check for this workflow):

- Code: `src/components/ui/test-card.tsx`, story `Sandbox / Test`
- Figma: `❖ Test` page, component node `371:7` (binding map lives in the
  component's description)

### Pull (a designer changed a component in Figma → land it in code) — ~2 min

1. Read the component node via `use_figma` (works on the Pro plan; load the
   `figma-use` skill first). Capture per property: the **bound variable name**
   (`boundVariables` + resolve IDs to names) and the raw value, plus text styles,
   effect style, characters, and child structure.
2. Diff against the code twin. Bound variables map 1:1 to classes
   (`shadcn/card`→`bg-card`, `corner-radius/xl`→`rounded-xl`, `spacing/8`→`p-8`,
   `Elevation/lg`→`shadow-lg`, `border-width/1`→`border`). Unbound values that
   match a token (12px→`gap-3`) translate too — bound is certain, unbound is inferred.
3. Apply **surgical edits** to the existing source file. Component INSTANCES in the
   Figma design (e.g. ❖ Button) map to the real code components (`<Button variant=…>`),
   never hand-rolled markup.
4. Verify in Storybook (HMR) against a Figma screenshot of the node.
5. Ship through the normal branch → PR → CI → merge flow.

Out of scope by design (code-side judgment fills these in): behavior, responsive
rules, accessibility semantics, edge cases. Figma under-describes them; that's
expected, not a bug.

### Push (code changed → update the Figma twin) — ~1 min

1. Edit code first; verify in Storybook.
2. One `use_figma` script updates the **existing** node in place: `setBoundVariable`
   for radius/padding/gap/stroke-weight, `setBoundVariableForPaint` for fills/strokes,
   `setEffectStyleIdAsync` for elevation, font-load → `characters` for text. Update the
   component `description` binding map to match.
3. **Upsert, never recreate** — same rule as the foundation sync. Recreating breaks
   node identity and orphans instances. The push doubles as parity repair: re-assert
   bindings that Figma-side hand-editing dropped.

### Why there is no fully-automatic version

Headless (no-Figma-open) variable reads/writes need the Variables REST API, which is
Enterprise-only. On this plan the Plugin API via MCP requires a live session — so both
directions run on request ("pull it" / "push it") rather than on a schedule. Detection
of drift is still automated at the token level (Tier 1/2 in `scripts/DRIFT-AUDIT.md`);
component-level parity is the on-demand Tier 3 sweep (see `figma/components/README.md`,
"Sync audit").
