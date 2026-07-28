# Changelog

All notable changes to the Quill Design System. Follows [semver](https://semver.org):
breaking token/API changes bump major (minor while pre-1.0), new features bump minor,
fixes bump patch.

**Release routine (every feature/fix PR):** bump `version` in `package.json`, add an
entry here, and after merge tag the commit (`git tag vX.Y.Z && git push --tags`) and
publish a GitHub release. The homepage footer reads `package.json` directly, so the
displayed version updates with the bump.

## [0.2.23] — 2026-07-28

### Changed
- test(drift): deliberately stale llms.txt version to exercise self-heal

## [0.2.22] — 2026-07-28

### Changed
- chore(ci): Bump dependabot/fetch-metadata from 2 to 3

## [0.2.21] — 2026-07-28

### Fixed
- **Dependabot security updates failed three times on their first cycle**, and
  would have kept failing every cycle. Enabling them in 0.2.20 was right — they
  immediately caught and auto-merged a real `@hono/node-server` advisory (#39) —
  but the updater also attempts advisories it cannot resolve and errors out when
  it can't. `postcss`, `sharp` (both via `next`) and `brace-expansion` (via
  `eslint-config-next`) are transitive and only fixable inside a held major, so
  each produced a failed run. That is the same recurring false alarm
  `scripts/DRIFT-AUDIT.md` exists to prevent, reintroduced through a different
  door. All three are now in `ignore`, which governs security updates as well as
  version updates.
- Safe because none is a direct dependency: the real fix always ships inside a
  `next` or `eslint-config-next` release, and neither of those is ignored. They
  also stay visible — the weekly audit still lists every high/critical it cannot
  resolve, so the bot that can't act is silenced without silencing the report
  that says when that changes.

### Changed
- `@hono/node-server` and `@modelcontextprotocol/sdk` bumped by the first
  autonomous security merge (#39) — opened, verified, and merged with no human
  in the loop.

## [0.2.20] — 2026-07-27

### Added
- **The drift loop now closes itself.** Four workflows turn the watch tiers into
  action. The original rule is not relaxed, only automated — *fixes still go
  through the normal PR flow*; what changed is that a bot opens the PR and merges
  it once the required check is green. **Nothing writes to `main` directly**, so
  an automated fix that is wrong surfaces as a red PR rather than a broken
  `main`.
  - `dependabot-auto-merge.yml` — minor/patch dependency PRs merge themselves
    once green; majors get a comment and wait for a human, matching
    `dependabot.yml`'s grouping rule.
  - `self-heal.yml` — rebuilds the generated files and opens a repair PR when the
    committed output has drifted. This is the failure that left `public/llms.txt`
    advertising 50 blocks for a day (0.2.18); it now fixes itself. Runs on push to
    `main`, plus every 6h as a backstop.
  - `release.yml` — tags and publishes a version that has no tag, and opens a
    patch-bump PR when commits accumulate on `main` without one. Without this the
    version would freeze while dependencies moved beneath it, and both the
    homepage footer and `llms.txt` read `package.json`.
  - `claude-repair.yml` — on a red `main`, Claude diagnoses and opens a fix PR.
    **Off by default**, and its PRs are never auto-merged.
- `scripts/release.mjs` (+ tests) — CHANGELOG-section extraction and patch-bump
  preparation, kept testable rather than smeared across YAML. Publishing fails
  loudly rather than cutting a release with empty notes.

### Changed
- Repo settings required by the above: auto-merge enabled, workflow
  `GITHUB_TOKEN` raised to write, Dependabot alerts + **security** updates
  enabled (the latter is a separate toggle from the version updates added in
  0.2.18, and was off — transitive CVEs were never being PR'd).

### Notes
- **`AUTOMATION_TOKEN` is required or the loop stalls.** A PR opened with the
  default `GITHUB_TOKEN` does not start a workflow run, so CI never reports and
  auto-merge waits forever. `self-heal` and `release` use a fine-grained PAT and
  fall back to `GITHUB_TOKEN` with a warning in the run summary. Dependabot's own
  PRs are unaffected.
- The deterministic tiers automate work with a right answer; Claude repair
  automates judgement, which fails differently — see the reasoning in
  `scripts/DRIFT-AUDIT.md`.

## [0.2.19] — 2026-07-27

### Fixed
- **The drift audit's "actionable advisory" test was a false-alarm generator**,
  and would have emailed a red run every Monday from here on. It trusted npm's
  per-advisory `fixAvailable` flag, which is wrong two ways. It is *not
  deterministic*: when several advisories share one root cause (a `minimatch`
  ReDoS reaching us through `eslint-config-next`), npm marks an arbitrary one
  `fixAvailable: true` and the rest major-only — three consecutive runs on an
  unchanged lockfile blamed `eslint-plugin-react`, then `eslint-plugin-import`,
  then `eslint-plugin-react`. And `fixAvailable: true` does not mean fixable: a
  real `npm audit fix` churned 22 packages and cleared none of the 17
  advisories. Actionability is now *measured* — the fix is simulated against a
  throwaway copy of the manifest + lockfile (`npm audit fix
  --package-lock-only`), then re-audited there, and the run fails only if the
  high/critical count actually drops. Deterministic across runs, leaves the repo
  untouched, and reports "couldn't measure" as an unknown rather than as
  success. Note `npm audit fix --dry-run --json` is not usable for this: despite
  the flag it emits a plain-text `add <pkg>` list, so parsing it as JSON silently
  measures zero remaining advisories every time.
- **Dependabot's `actions` group had no `update-types` filter**, so majors were
  batched instead of arriving individually for a human read — the npm groups had
  the filter, this one didn't. Its first run bundled `actions/checkout` and
  `actions/setup-node` v4 → v7 together; both are included here (CI green), and
  the group is now restricted to minor/patch like the rest.

### Changed
- Dependency bumps from Dependabot's first run, consolidated into one release
  (PRs #34–#37, each independently CI-green): Storybook 10.5.3 → 10.5.5 across
  all six packages, `next` + `eslint-config-next` 16.2.11 → 16.2.12,
  `@material-symbols/svg-200` 0.45.9, `playwright` 1.62.0, `recharts` 3.10.1,
  `shadcn` 4.13.1 → 4.16.0, and the two GitHub Actions pins to v7. The
  registry-build bump is the notable one: the generated-files gate confirms
  `shadcn` 4.16 emits byte-identical `public/r` output. Held as before:
  `@types/node`, `eslint` 9, `typescript` 5.9.

## [0.2.18] — 2026-07-27

### Added
- **Dependabot (`.github/dependabot.yml`) — the "act" arm of the drift loop.**
  Tier 2 already *reported* dependency staleness weekly; nothing opened the PR
  that fixed it (0.2.17's bumps were done by hand). Dependabot now files them on
  the same Monday 13:00 UTC window as the audit, and required CI proves each
  bump before it can merge. Carries the audit's zero-false-alarm rule two ways:
  the three deliberately held majors (`@types/node` pinned to the Node 24
  runtime, `eslint` 9, `typescript` 5.9 — the latter two blocked by
  `eslint-config-next` 16.2) are *ignored* rather than retried into a red PR
  every week, and lockstep families are grouped so they cannot be split — all
  Storybook packages as one PR, `next` + `eslint-config-next` as another.
  GitHub Actions pins (`actions/checkout`, `actions/setup-node`) are now watched
  too; nothing in the repo tracked them before.

### Fixed
- **`main` had been red since 0.2.17 and nothing stopped it.** The three commits
  after PR #32 (`f2f9912`, `be3da66`, `4233d5c`) were pushed straight to `main`,
  skipping the PR flow; CI ran on each push and failed on all three. Two real
  defects had been sitting on `main` for a day:
  - `public/llms.txt` was never regenerated after `login-oauth` was added, so
    the published AI-consumption file advertised 50 blocks and omitted the new
    one entirely — an LLM reading it could not know the block existed.
  - `scripts/build-tokens.test.mjs` pinned `--gold-text` to the literal
    `#826637`, which two legitimate AA retunes (`#755C32`, then `#68522D`) left
    behind. The assertion now derives the expected value from the token source;
    the real 4.5:1 contrast guarantee is owned by the 16-combo WCAG test, which
    passed throughout. A frozen hex there only duplicated that check badly and
    turned CI red for a correct design change.

### Changed
- **`main` is now genuinely protected.** The `Lint · types · tests · build`
  check was running on every PR but was never *required* — the branch had no
  protection rule and no ruleset, so a red PR merged as easily as a green one.
  It is now a required status check (strict), with force-pushes and branch
  deletion blocked. Admin enforcement is off, preserving the documented
  emergency-push path.

## [0.2.17] — 2026-07-22

### Changed
- Patch-bumped `next` and `eslint-config-next` 16.2.10 → 16.2.11, and
  `react`/`react-dom` 19.2.7 → 19.2.8 (surfaced by the weekly drift audit).
  Held as before: `@types/node` (pinned ^24 to the runtime), `eslint` 9, and
  `typescript` 5.9 — `eslint-config-next` 16.2 still rejects ESLint 10 / TS 7.
  The two upstream `next`→`sharp`/`postcss` high advisories did not clear in
  16.2.11 and remain held (drift audit reports but does not fail on them).

## [0.2.16] — 2026-07-22

### Added
- **Drift audit (self-healing "watch" layer), de-risked into three tiers**
  (`scripts/DRIFT-AUDIT.md`):
  - **Tier 1 — CI invariants:** new `scripts/repo-invariants.test.mjs` (current
    version has a CHANGELOG entry; every registry item's files exist), and the
    CI "Generated files in sync" step now also regenerates the registry and
    `llms.txt` and diffs `public/r` + `public/llms.txt` — so a forgotten
    `build:registry`/`build:llms` fails CI. Deterministic, per-PR, no noise.
  - **Tier 2 — scheduled report:** `npm run drift-audit`
    (`scripts/drift-audit.mjs`) reports dependency freshness, security
    advisories, and release housekeeping. Runs weekly via
    `.github/workflows/drift-audit.yml` (native GitHub Actions — no cloud cost,
    no interactive auth), failing only on an *actionable* high/critical advisory
    (a real, non-major fix), so upstream-held advisories don't trigger weekly
    false alarms.
  - **Tier 3 — Figma↔code parity:** an on-demand interactive check (documented,
    kept out of the headless path). Baseline run confirms the live Figma file is
    in sync — accent aliases → moss.deep, `shadcn/chart-1..5` → the series cuts,
    all 20 series hexes match.

## [0.2.15] — 2026-07-22

### Added
- **`llms.txt`** — a machine-readable reasoning layer served at
  `/llms.txt`, generated by `scripts/build-llms.mjs` from the token source,
  registry, and intent vocabulary (so it can't drift). Covers the theming
  contract (`data-theme`/`data-accent`), token vocabulary, the chart
  fixed-order rule, the intent taxonomy, and all 50 blocks with their
  `use_when` and install URLs — the "when/why/how" layer AI agents read to build
  with Quill correctly. Wired into the build (`build:llms`) and guarded by
  `scripts/build-llms.test.mjs`.

## [0.2.14] — 2026-07-21

### Added
- **Registry intent metadata.** All 50 blocks now carry a `meta` object with an
  `intent` array (from a controlled 14-tag vocabulary in
  `scripts/registry-intent-tags.mjs`) and a `use_when` sentence — the semantic
  layer that lets the catalog be searched by meaning and lets AI agents pick the
  right block. `meta` is schema-native to shadcn and passes through
  `shadcn build` into `public/r/*.json`. Convention documented in
  `registry/README.md`; enforced by `scripts/registry-meta.test.mjs`.
- `DEFAULT_ACCENT` constant in `scripts/build-tokens.mjs` — single source of
  truth for the default accent (moss), consumed by the drift guard below.
  Generated output is byte-identical.

### Fixed
- Registry base description said "terracotta accents" — stale since v0.2.6 made
  moss the default. Corrected to "moss accents", and a new test ties the copy to
  `DEFAULT_ACCENT` so this class of drift fails CI instead of shipping.

## [0.2.13] — 2026-07-21

### Changed
- Foundations docs pages (Colors, Typography type scale, Spacing, Elevation)
  now render live from `src/tokens/quill.tokens.mjs` instead of hardcoding
  values — the same no-drift pattern as the Tokens page. This retires real
  drift: Typography claimed `text-4xl` was 36px (it's 64px), Colors listed a
  wrong `--terracotta-deep` hex, called terracotta "the single accent"
  (moss has been the default since v0.2.6), and said the ring is ink (it
  follows the accent). Colors gains a **Data visualization** section
  documenting the series palette and the seq/div ramps.
- Chart story uses `var(--chart-1/2)` instead of raw pigments (the exact
  CVD-failing pair v0.2.12 replaced) and documents the fixed-order rule.
- `chart.tsx`: the `ChartConfig` theme selector now targets Quill's
  `data-theme` attribute (both dark-scheme themes) instead of a `.dark` class.
- Lint output de-noised: generated icon modules are excluded (1,004
  machine-written `import/no-anonymous-default-export` warnings gone), two
  stale `eslint-disable` directives removed — 1,009 warnings → 3 real ones.
- Figma: ❖ Analytics charts re-bound from pigment fills to
  `color/chart/series/*` (two-series chart = series 1+2 in fixed order with
  matching legend; bar chart = series 3).

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
