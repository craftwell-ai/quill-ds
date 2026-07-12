# Changelog

All notable changes to the Quill Design System. Follows [semver](https://semver.org):
breaking token/API changes bump major (minor while pre-1.0), new features bump minor,
fixes bump patch.

**Release routine (every feature/fix PR):** bump `version` in `package.json`, add an
entry here, and after merge tag the commit (`git tag vX.Y.Z && git push --tags`) and
publish a GitHub release. The homepage footer reads `package.json` directly, so the
displayed version updates with the bump.

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
