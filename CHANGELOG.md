# Changelog

All notable changes to the Quill Design System. Follows [semver](https://semver.org):
breaking token/API changes bump major (minor while pre-1.0), new features bump minor,
fixes bump patch.

**Release routine (every feature/fix PR):** bump `version` in `package.json`, add an
entry here, and after merge tag the commit (`git tag vX.Y.Z && git push --tags`) and
publish a GitHub release. The homepage footer reads `package.json` directly, so the
displayed version updates with the bump.

## [0.2.12] — 2026-07-20

### Added
- **Chart color system.** New `color.chart` token group with three ramps per
  theme: `--chart-series-1..5` (categorical — terracotta/indigo/gold/plum/moss,
  chart-only cuts re-stepped above the OKLCH 0.10 chroma floor),
  `--chart-seq-1..5` (sequential moss ramp, monotonic emphasis), and
  `--chart-div-1..5` (diverging terracotta↔indigo around a neutral midpoint).
  Figma gains the 15 matching `color/chart/*` primitives (4 modes, Dev Mode
  code syntax); `shadcn/chart-1..5` re-aliased to the series cuts in both code
  and Figma.

### Fixed
- The old chart palette (raw pigments + ink-soft) failed colorblind-safety
  checks in every theme — terracotta↔moss adjacency scored ΔE 3.2 (deuteranopia)
  on Dawn, and most slots sat below the data-mark chroma floor. Every new
  series palette passes all six palette checks (CVD ≥ 8, normal-vision ≥ 15,
  lightness band, chroma floor, 3:1 contrast) per theme ground, enforced by a
  new token test.

## [0.2.11] — 2026-07-20

### Added
- Figma Wave C complete (16/16 overlays/compounds), each token-bound on its own
  `❖` page: Dialog, Alert Dialog, Sheet (Right/Bottom), Drawer, Popover,
  Hover Card, Dropdown Menu, Context Menu, Menubar, Command, Combobox,
  Toggle Group, Slider, Input OTP, Table, Toast (Default/Success/Destructive).
  Composes existing component instances (Button, Badge, Avatar, Label, Input,
  Kbd, icons) throughout; deferrals and build lessons recorded in
  `figma/components/README.md`.

## [0.2.10] — 2026-07-20

### Added
- Figma Wave B complete (11/11 composites): new token-bound component sets
  **❖ Field** (Orientation × State, composing Label/Input/Switch instances),
  **❖ Button group** (horizontal/vertical fused outline segments), and
  **❖ Input group** (inline search shell with Kbd instance; block prompt box).
  Wave C scope locked in `figma/components/README.md` (16 overlays/compounds,
  deferrals noted).

## [0.2.9] — 2026-07-20

### Fixed
- Figma accent drift: the live Figma file's `status/link`, `shadcn/ring`, and
  `shadcn/sidebar-ring` variables still aliased `color/pigment/terracotta/deep`
  from before v0.2.6 made moss the default accent — re-aliased to
  `color/pigment/moss/deep` to match code and the DTCG export. The ❖ Theme
  selector pattern page now lists Moss first with the selected check (matching
  the v0.2.6 dropdown order). `figma/components/README.md` accent section
  updated to document the moss pinning.

## [0.2.8] — 2026-07-20

### Changed
- Dependency sweep: all runtime and dev dependencies updated to latest —
  notably @base-ui/react 1.6, shadcn 4.13 (registry rebuilt), Storybook 10.5.3,
  react-day-picker 10, Next 16.2.10, React 19.2.7, Tailwind 4.3.3, vitest 4.1.10,
  Playwright 1.61.
- Calendar: `table` classNames key renamed to `month_grid` for react-day-picker
  10 (the old key was removed upstream; visual output unchanged).
- Held back: TypeScript stays on 5.9 and ESLint on 9.39 — `eslint-config-next`
  16.2 (typescript-eslint, eslint-plugin-import/react/jsx-a11y) does not yet
  support TS 7 / ESLint 10. `@types/node` pinned to ^24 to match the Node 24
  runtime used locally and in CI.

## [0.2.7] — 2026-07-13

### Changed
- Foundations color plate swatches use theme vars (`var(--paper)`,
  `var(--ink)`, `var(--terracotta)`, …) instead of hardcoded Dawn hexes, so
  the plate re-cuts with the active theme. Caption drops the contradicted
  "no pure white, no pure black" claim and fixes the "papers tones" typo.

## [0.2.6] — 2026-07-13

### Changed
- **Default accent is Moss** (was Terracotta) — `--accent-pigment` /
  `--accent-pigment-text` now resolve to moss/moss-deep in `:root` and every
  theme block; the Figma token export pins to `moss.deep`. Stored user choices
  still win; `data-accent` switching is unchanged.
- Moss moved to first position in the accent list of the theme dropdown (both
  the `theme-selector` registry block and the homepage nav).
- Hero content sits 20px lower on desktop (`lg:` and up); tablet and mobile
  unchanged.

## [0.2.5] — 2026-07-13

### Changed
- "Paper first" principle card reads "Every surface, a texture you can almost
  feel with a typeset that has an unhurried editorial rhythm." — the old copy
  claimed "no pure white, no pure black," which the Classic themes now
  contradict.
- DESIGN.md caught up with the four-theme reality: themes are named Dawn and
  Dusk, the no-pure-white/black rule is scoped to the brand themes with the
  Classics documented as the sanctioned exception, the paper metaphor is
  explicitly digital paper, and the token source of truth points to
  `src/tokens/quill.tokens.mjs` instead of dead paths.

## [0.2.4] — 2026-07-11

### Changed
- Hero caption reads "Optimized for agentic development."

## [0.2.3] — 2026-07-11

### Changed
- Hero caption reads "Architected for agentic deployments." (was "Curated for
  AI-powered products.").

## [0.2.2] — 2026-07-11

### Changed
- Footer drops the nav links (Storybook / GitHub / Foundations) — logo and
  tagline left, version stamp right.

## [0.2.1] — 2026-07-11

### Changed
- Footer version stamp reads `v0.2.1` instead of `Quill v0.2.1`.

## [0.2.0] — 2026-07-11

### Added
- **Two new themes** — Classic Light (`data-theme="classic-light"`, pure white) and
  Classic Dark (`data-theme="classic-dark"`, pure black), running the pigments at
  +50% OKLCH chroma. Dawn stays the default; Dusk stays `data-theme="dark"`.
- **User-selectable accent** — `data-accent="terracotta | moss | indigo | gold"`
  drives eyebrows, accent italics, links, and focus rings. New `gold-text` primitive
  carries gold's AA text cut. A token test enforces 4.5:1 across all 16
  theme × accent combinations.
- **Theme selector pattern** — `theme-selector` registry block + Storybook story:
  a dropdown with Theme and Accent sections, persisted to localStorage. Storybook
  toolbar gains Theme and Accent menus.
- Nested theme islands: `[data-theme]`/`[data-accent]` on any subtree now re-resolves
  aliases (previously only an `<html>`-level switch worked).

### Changed
- **Links follow the accent** — default link color is now terracotta-deep
  (was fixed indigo). Focus rings follow the accent too (were ink).
- Homepage theme switch replaced with the selector dropdown; hero declaration
  watermark is grayscale, inverted on dark themes.

## [0.1.0] — 2026-07-10

Baseline: token pipeline (Dawn/Dusk), 30+ components, 49 installable pattern blocks,
shadcn registry at `/r/*`, Storybook, homepage, Figma foundations + pattern pages,
CI quality gate (drift, lint, types, token tests, a11y, build).
