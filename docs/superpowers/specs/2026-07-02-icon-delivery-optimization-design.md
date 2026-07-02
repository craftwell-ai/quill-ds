# Icon Delivery Optimization — Design Spec

**Date:** 2026-07-02
**Context:** The icon system currently inlines a single ~721KB map of 1000 icons that `<Icon>` imports wholesale — not tree-shakeable, ships whole even to render one icon (flagged by the whole-branch review). Decision: support the **entire Material Symbols Outlined library** via `<Icon name>` while keeping the initial bundle tiny. This supersedes the "top-1000 map" delivery; the icon *API* (`<Icon name="…">`) is unchanged.

## Goal

Any Material Symbol (Outlined 200) renderable by name, with **near-zero initial bundle cost** — only icons actually rendered are loaded, and the common ones render instantly with no flash.

## Approach — sync core + lazy long-tail (hybrid)

1. **Sync core set** — the icons actually used by the design-system components (usage-derived, ~40–60). Generated into `icons.core.mjs` (~30–40KB) and imported **synchronously**. These render instantly (no layout shift / flash) and cover every icon the components themselves use.
2. **Lazy full library** — every outlined icon becomes its own tiny module (`src/components/ui/icons/<name>.mjs` → `export default { viewBox, paths }`). `<Icon>` loads a non-core icon on demand via a **dynamic import expression** `import(\`./icons/${name}.mjs\`)`, which the bundler auto-code-splits into a per-icon chunk. No giant loader map in the bundle. A module-level `Map` caches resolved icons so each loads once.
3. **Type safety** — `IconName` = the full library union, generated to `icons.generated.d.ts`, so every name is type-checked (autocomplete across the whole library).

Initial bundle carries only `<Icon>` + the core map. A rare icon costs one small async chunk on first render; thereafter it's cached.

## Why hybrid (not pure-lazy or per-icon-only)

- **Pure lazy** (even core icons async) → flash/layout-shift on every icon, bad for buttons/inputs. The sync core avoids this for the icons that matter most.
- **One big lazy chunk** (`icons.full.mjs` loaded once) → simpler, but one rare icon pulls the whole tail (~MBs). Per-icon chunks load only what's used.
- **Hybrid** gives instant common icons + granular lazy loading of the long tail — the best of both.

## Component behavior

```
<Icon name="check" />          // core → sync render, instant
<Icon name="rocket_launch" />  // non-core → renders a same-size reserved <svg> placeholder,
                               //   dynamic-imports the chunk, swaps in on load (cached after)
```
- Placeholder reserves the icon's box (via `size`) so there's no layout shift.
- `aria-hidden`/`role`/`currentColor`/sizing contract unchanged from today.
- Unknown name (not in the library) → throws in dev, renders nothing in prod (documented).

## Architecture / files

| File | Responsibility |
|---|---|
| `scripts/build-icons.mjs` (updated) | emits: `icons.core.mjs` (sync core), per-icon `icons/<name>.mjs` for the full outlined set, `icons.generated.d.ts` (full `IconName` union). Core set = usage-derived (grep `<Icon name=>` + `icon:'…'`) ∪ a small curated common list. |
| `src/components/ui/icons/<name>.mjs` | generated per-icon data (gitignored; produced by `build:icons`) |
| `src/components/ui/icons.core.mjs` | generated sync core map (committed) |
| `src/components/ui/icons.generated.d.ts` | generated full `IconName` union (committed) |
| `src/components/ui/icon.tsx` | sync-core-first render + lazy dynamic import + cache + placeholder |
| `package.json` | `build:icons` wired into `predev`/`prebuild`/`pretest` so per-icon modules exist before any build/test |
| `.gitignore` | ignore `src/components/ui/icons/` (generated, ~7.8k files) |

The old single `icons.generated.mjs` (721KB) is removed.

## Build-order + tooling

- Per-icon modules are **generated, gitignored**, and rebuilt by `build:icons`; a `pre*` hook guarantees they exist for `dev`, `build`, `test-storybook`, and `test:tokens` (fixes the cold-checkout hazard the review flagged, for both core and lazy).
- **Next.js dynamic import:** per `AGENTS.md`, verify `import(\`./icons/${name}.mjs\`)` behavior against the local Next.js docs before relying on it (Turbopack must code-split the `icons/` directory by name). If the expression form isn't supported, fall back to a generated `loaders.mjs` of explicit `() => import('./icons/<name>.mjs')` thunks (larger, but static) — the spec's dynamic-expression form is preferred for bundle size.

## Verification

- `test-storybook` stays green (230/230); the Icon gallery renders (core sync; a lazy example loads).
- New story/test: a non-core icon renders after its async chunk resolves (Storybook `play` awaits it); no layout shift (placeholder reserves size).
- Bundle check: the initial chunk no longer contains the full icon data — only `<Icon>` + core (e.g. inspect the built output or a size assertion in a test).
- `build:icons` idempotent; a cold checkout builds and runs green via the `pre*` hooks.
- `IconName` includes the full library (spot-check an obscure icon type-checks).

## Migration notes

- Existing `<Icon name="…">` usages are unchanged (same API). Ones referencing icons not in the core still work — they lazy-load (but most component icons will be in the core by construction).
- The manifest/popularity machinery (`build-manifest.mjs`) is retained only to seed the **core** common list; the full library no longer depends on a 1000-cap.

## Risks

- **Next dynamic-expression import** support (mitigated by the loaders.mjs fallback + AGENTS.md verification).
- **~7.8k generated files** — gitignored; ensure the `pre*` hooks and Storybook/Next globs handle the directory. Generation time is a one-off per build (fast — string ops).
- **SSR/first-paint** for lazy icons — placeholder avoids layout shift; core covers above-the-fold component icons.
