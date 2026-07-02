# Figma Foundations — Design Spec

**Date:** 2026-07-01
**Status:** Approved design, pre-implementation
**Phase:** 1 of 4 in the "Quill → Figma" effort. This spec covers **Foundations only** (tokens → Figma variables + text/effect styles). Components, Code Connect, and Patterns are later phases, each dependent on this one and specced separately.

## Context

The token foundation shipped: `src/tokens/quill.tokens.mjs` is the single source of truth and generates `tokens/quill.figma.json` (a W3C DTCG document with a `Primitives` group — color/font/radius/type/elevation/motion/fraunces — and a `Theme` group of semantic + ShadCN aliases that resolve to `{Primitives.color.…}`). Colors carry `$extensions.com.figma.modes.{Light,Dark}`.

The goal of the broader effort is a **visual source of truth in Figma** that mirrors the code design system, so design and code stay aligned. Foundations is the prerequisite: every Figma component and pattern binds to these variables and styles, so they must exist first.

**Sync philosophy (governs this and every later phase):** there is no automatic two-way sync between Figma and code. Instead we build **repeatable, one-direction sync steps** with a designated source of truth. For tokens and styles, **code is authoritative** (`quill.tokens.mjs`); Figma is a generated mirror. The Foundations sync must therefore be **re-runnable and non-destructive** — a re-run updates existing variables/styles in place (matched by name), never duplicates them — so "edit token in code → re-sync → Figma updates" works from day one.

## Goals

- A new dedicated Figma library file, **"Quill Design System"**, containing:
  - **Variables:** a `Quill Primitives` collection (Light/Dark modes) + a `Quill Semantic` collection (aliases), generated from the DTCG.
  - **Text styles:** a curated named set derived from `globals.css` typography.
  - **Effect styles:** the 5 elevation shadows.
- The whole sync is **MCP-native** (Figma MCP `figma-generate-library` / `use_figma`), driven by `tokens/quill.figma.json`, and **idempotent** (re-run updates in place).
- The file is **published as a team library** so later phases and other Figma files consume it.
- Code stays the source of truth; a re-run after a token change updates Figma without duplication or drift.

## Non-goals (this phase)

- Building Figma **components** for the 55 UI components (Phase 2).
- **Code Connect** mapping (Phase 3).
- **Patterns** / composed screens (Phase 4).
- Pulling designer-made Figma changes back into code (a later, deliberately-governed reverse-sync; out of scope here).
- Dark-mode **elevation** parity (see Constraints — Figma effect styles can't hold modes).

## Locked decisions

- **New dedicated library file** "Quill Design System" (not an existing file).
- **Full foundation:** variables **+** text styles **+** effect styles.
- **Approach 1 — MCP-native:** the Figma MCP creates everything from the DTCG; no third-party plugin (Tokens Studio is the fallback only if Plugin-API variable creation proves unworkable at scale).
- **Figma Professional** plan confirmed → Light/Dark modes and library publishing are available.
- **Re-runnable sync:** upsert by name, never recreate.

## Architecture

```
src/tokens/quill.tokens.mjs  ──build:tokens──▶  tokens/quill.figma.json  (DTCG, code-authoritative)
                                                        │
                                          Figma MCP (use_figma / figma-generate-library)
                                          upsert-by-name Plugin API sync
                                                        ▼
                        Figma file "Quill Design System"
                          ├─ Collection: Quill Primitives   (modes: Light, Dark)
                          │    color/*, radius/*, type/*, font/*
                          ├─ Collection: Quill Semantic      (single mode; aliases → Primitives)
                          │    text/*, surface/*, border/*, status/*, shadcn/*
                          ├─ Text styles     (Display/*, Heading/*, Body/*, Accent, Eyebrow)
                          └─ Effect styles   (Elevation/xs·sm·base·lg·pop — light values)
                          → published as a team library
```

### Variables — two collections

- **`Quill Primitives`** — modes **Light / Dark**. Every raw value lives here:
  - `color/*` — per-mode values from the DTCG `$extensions.com.figma.modes`.
  - `radius/*`, `type/*` (font sizes as numbers), `font/*` (families as strings) — identical in both modes.
  - Theme-switching happens on this collection.
- **`Quill Semantic`** — **single mode**. The `Theme` group (`text/*`, `surface/*`, `border/*`, `status/*`, `shadcn/*`) as **aliases** to Primitives variables. A frame goes dark by setting the *Primitives* collection to Dark; semantic aliases resolve through. This is the standard "one collection owns modes, semantic layer is thin aliases" pattern.
- Names use `/` groups so Figma builds tidy folders (`color/pigment/terracotta/deep`, `radius/lg`, `text/accent`).

### Text styles (curated, from `globals.css`)

Family + size + line-height/letter-spacing. Color is **not** baked in — layers get color from Semantic variables, keeping type theme-aware.

| Group | Font (axes) | Styles (size) |
|---|---|---|
| `Display/` | Fraunces, display axes | XL (88), L (64), M (48) |
| `Heading/` | Fraunces, text axes | L (32), M (24), S (18) |
| `Body/` | Inter | L (18), Base (15), S (14), XS (12) |
| `Accent` | Fraunces italic, accent axes | editorial accent |
| `Eyebrow` | Inter, uppercase, tracked | micro label |

### Effect styles

The 5 elevation tokens (`Elevation/xs·sm·base·lg·pop`) as drop-shadow effect styles (each a 2-shadow composite, supported by Figma), using the **light** shadow values.

## Re-runnable sync (the key property)

The sync program (Plugin-API JS driven by the MCP) reads `tokens/quill.figma.json` and **upserts**: for each collection/mode/variable/style, find by name and update if present, create if absent. It never deletes or duplicates on re-run. The reusable sync snippet and the target Figma **file key** are recorded in the repo (e.g. under `figma/`) so the sync is version-controlled and repeatable by later phases and after any token change.

## Verification

- After each build step, read back with the Figma MCP (`get_variable_defs`, `get_design_context`) and confirm: both collections exist; Primitives has Light+Dark modes; variable counts match the DTCG; a spot-set of Semantic aliases resolve to the correct primitive; text/effect styles exist with expected values.
- Build a **specimen frame** (color swatches in both modes, a type ramp, an elevation row) and screenshot it via the MCP for a visual check.
- **Idempotency check:** run the sync twice; the second run reports only "updated/'unchanged'", creating zero new variables/styles (no duplicates).
- Human review of the published Figma file before declaring done.

## Constraints & risks

- **Figma MCP auth + edit access** to the new file is required (the `claude.ai Figma` connector showed Connected this session; edit access to the target file is assumed).
- **Dark-mode elevation:** Figma effect styles can't hold modes, so dark shadows aren't represented here. Deferred to the component phase (likely a parallel "(dark)" effect-style set or variable-bound shadow color). Flagged, not silently dropped.
- **Plugin-API scale:** creating ~100+ variables with modes + cross-collection aliases via the Plugin API is fiddly; build incrementally and verify each step. Tokens Studio import is the fallback for the variable bulk if needed.
- **Library publishing** may require a human action in the Figma UI depending on MCP capabilities; the plan will note where a manual publish step is needed.

## Repo artifacts (what lands in git)

The deliverables live mostly in Figma. In the repo:
- The reusable **sync snippet / procedure** and the target **file key** (under `figma/`), so the sync is re-runnable and versioned.
- A short **token → Figma name map** reference (optional; may be derivable from the DTCG).

## Future phases (out of scope here)

2. **Components** — Figma components for the 55 UI components, variant sets bound to these variables/styles.
3. **Code Connect** — map Figma components ↔ code (`.figma.ts`, `@figma/code-connect`).
4. **Patterns** — composed example screens (often Figma-authoritative → implemented in code).
