# Quill DS — full repository audit

**Date:** 2026-09-09
**Audited at:** `00b8d13` (local). Remote `main` was 26 commits ahead at `6685c40`, v0.8.28 — those commits touched only `CHANGELOG.md`, `package.json` and two generated version strings, **no source**, so every finding here applies to `main` unchanged.
**Method:** seven independent agents, each given a non-overlapping area and no shared context, plus a dependency/secrets pass and adjudication of every contradiction. Contested and headline claims were re-verified by hand; those are marked **re-verified**.

---

## Verdict

The engineering underneath Quill is strong. The token pipeline is deterministic and byte-reproducible, the test suite is fast and green (111 + 388 tests, no flakes, no skips), the drift-audit design is genuinely well-reasoned, and the usage-doc layer is better than most commercial design systems ship.

Three things are wrong, and they share one cause.

1. **Six defects reach consumer apps today.** Two make shipped components render wrong, one makes an accessibility guarantee false, one silently fails colorblind users, one has stopped all downstream releases for 16 days, and one leaves a whole theme half-installed.
2. **The system's intent does not reach agents.** An agent building from the published material guessed on 6 of 12 design decisions and produced the system's own written anti-reference. The answers exist in `DESIGN.md`; nothing publishes them.
3. **The documentation actively misleads in specific, copyable places** — not merely stale: two colour values are the pre-accessibility versions, and 8 of 9 component examples do not compile.

**The shared cause:** the system has no mechanism that fails when a change is only half-propagated. Everything generated from `quill.tokens.mjs` is perfect. Everything hand-maintained beside it drifts, silently, and CI cannot tell.

---

## 1. Ship-blockers

### 1.1 ToneBadge's gold and indigo tones produce no styling — **re-verified**

`registry/lib/tone-badge.tsx` references Tailwind colour names that the theme never defines. In Tailwind v4 a utility only exists if a matching `--color-*` entry is present in `@theme`; these are absent, so no rule is generated.

| Tone | Tint (default) | Solid |
|---|---|---|
| moss, terracotta, neutral, muted | ok | ok |
| gold | `text-gold-text` missing | `bg-gold-text` missing |
| indigo | `bg-indigo/20`, `text-indigo-deep` missing | `bg-indigo-deep` missing |

The theme defines `--color-indigo-brand` and `--color-gold-deep`; the component asks for `--color-indigo` and `--color-gold-text`. A rename fixes indigo. Gold needs `--color-gold-text` added to the palette map.

Two consequences beyond "looks wrong":

- **The solid variants are invisible.** `cn()` (tailwind-merge) drops `Badge`'s default `bg-primary` because `bg-gold-text` *looks* like a background utility, then that utility compiles to nothing. Result: `text-paper` (cream) on an unstyled chip — roughly 1.06:1 on a Dawn card.
- **A deliberate accessibility fix is inert.** The comment at `tone-badge.tsx:23` explains that `gold-text` was chosen precisely because `gold-deep` fails AA on tints. That reasoning is correct and the plumbing was never built.

Fix: `scripts/build-tokens.mjs:110-118` (`paletteMap`) and the four class strings.

### 1.2 The chart palette is not colorblind-safe, contrary to its own guarantee — **re-verified independently**

`src/tokens/quill.tokens.mjs:69` states the UI pigments were rejected for chart duty because "terracotta↔moss adjacency fails deuteranopia separation (ΔE 3.2 on Dawn; target ≥8)", and that the replacement cuts were "validated against all six palette checks per theme."

I simulated all three dichromacies (Viénot–Brettel–Mollon) and computed ΔE2000 for all ten pairs in all five themes. A separate agent did the same with a different implementation; both agree on which pairs fail.

| Theme | Deficiency | Pair | ΔE2000 |
|---|---|---|---|
| classic-dark | protanopia | 3 ↔ 5 | **0.34** |
| classic-light | protanopia | 3 ↔ 5 | **0.88** |
| classic-light | deuteranopia | 1 ↔ 5 | **0.98** |
| classic-dark | deuteranopia | 1 ↔ 5 | **2.00** |
| Dawn | protanopia | 3 ↔ 5 | 3.93 |
| Dawn | deuteranopia | 1 ↔ 5 | 4.78 |
| Dusk / intelligent | protanopia | 3 ↔ 5 | 5.40 |

Normal vision is fine — all ten pairs are well separated. So the palette works for most viewers and collapses for colorblind ones, which is the inverse of the claim.

Two specific points. The replacement improved the terracotta↔moss pair from ΔE 3.2 to 4.78 but never reached the stated target of 8, so **the documented fix did not achieve its documented goal**. And it introduced a worse gold↔moss collision, which is invisible at ≤2 series and certain at 5.

`src/tokens/quill.tokens.test.mjs` checks contrast and ramp monotonicity. It performs no colour-vision simulation at all, so nothing caught this.

### 1.3 Downstream releases have been broken for 16 days

`library-sync` has failed every run since 2026-08-24: **29 failures, 7 successes**. No consumer app has received a design-system update since August. The error is identical every time — the sync token cannot read check results, the exact item your notes carried as outstanding.

Three defects compound it:

- **One app's failure aborts the rest.** The per-app loop sits inside a single `try`, so app 1 throwing means apps 2–4 are never attempted. The logs show four apps identified and zero result lines.
- **The status poll is unguarded**, converting a permissions error into a fatal.
- **The auto-merge failure is swallowed by a bare `catch`** that cannot distinguish "this repo has no branch protection" from "the token cannot merge here".

Minimum fix is the token permission. The real fix is a `try`/`catch` per app.

### 1.4 No `@theme` block ships, so Quill's own utilities are dead in consumer apps

Enumerated across all 54 registry items: none carries an `@theme` block, a `cssVars` field, or a `css` field. The published theme file defines the pigments as plain custom properties, which Tailwind v4 does not turn into utilities.

Every `bg-moss/20`, `text-ink-muted`, `font-heading`, `text-2xs` and `rounded-4xl` in shipped block code therefore resolves to nothing downstream. The theme picker's four accent swatches render as blank circles. ToneBadge loses all tone styling even for the tones that work here.

This is the structural issue already identified in `docs/superpowers/specs/2026-09-08-agent-readability-design.md` (W19) and independently rediscovered by three of the seven agents. It is the single highest-leverage fix in the repo.

### 1.5 `--warning` fails AA text contrast on every light ground

| Theme | Colour | Page | Card | Well |
|---|---|---|---|---|
| Dawn | `#9A7D4E` | 3.33 | 3.08 | 2.85 |
| Classic Light | `#A57928` | 3.91 | 3.65 | 3.40 |

All six fail 4.5:1. Dark themes pass comfortably.

The system already contains the fix and does not use it: `gold.text` exists with a comment naming these exact ratios as the reason it exists. `--warning` still points at `gold-deep`. On dark themes the two are identical, so switching costs nothing there and fixes all six light failures (Dawn becomes 6.37, Classic Light 6.44).

Related, same class: `--info` is the only status token pointing at a base pigment cut rather than a deep one, and fails on Dawn card (4.26) and well (3.94).

### 1.6 The Intelligent theme is half-shipped

Added in v0.8.24 with cockpit grounds, a teal pigment, two new status tokens and two instrument fonts. The token layer is complete and correct — all 42 mode-varying primitives and all 51 aliases are present, with full accent coverage. Everything *around* it was missed:

| Surface | State |
|---|---|
| `dark:` variant selector (`globals.css:6`) | omits it, so **80 `dark:` utilities across 23 files render their light treatment on a near-black ground** |
| Theme picker block (shipped to consumers) | offers four themes; a stored `intelligent` also fails validation on restore |
| `public/llms.txt` | renders it literally as `` `intelligent` → undefined `` |
| Storybook | absent entirely — no preview, no a11y coverage |
| Chart `THEMES` map | excludes it, so chart dark values never apply |
| Every document in the repo | zero mentions of "intelligent" or "teal" |
| `CHANGELOG.md` | the feature is unrecorded and untagged |
| Shadows | verbatim Dusk copies; the elevation hairline sits at 1.01 contrast on its darker ground, effectively invisible |
| Instrument fonts (Inter, JetBrains Mono) | declared, never loaded anywhere |

---

## 2. Is the system agent-readable? Measured, not assumed

An agent was given a realistic brief (dashboard app, app shell, metrics, chart, table, settings, empty state, dark mode) and access only to what a real consumer agent has: the published site, the registry, the shadcn CLI, and public shadcn docs. It could not read this repo.

**Result: 6 of 12 decisions were guesses.**

| Told by the system | Guessed |
|---|---|
| Which block for each screen | Install prerequisites (Tailwind v4, `shadcn init`, importing the theme, the missing `@theme`) |
| Theme and accent attributes | Dark mode without a flash |
| Typefaces | Content max-width and measure |
| Chart colour rules | Page padding and section rhythm |
| Empty-state rule | Status badge treatment |
| — | Brand voice for every line of copy |

Two findings matter more than the count.

**It built the anti-reference.** Working faithfully from every published source, it produced a hero-metric row above an identical card grid — which `PRODUCT.md` names, verbatim, as the thing to avoid: "the generic SaaS/shadcn default look: white cards, blue accents, hero-metric rows, identical card grids." Nothing in the agent-readable material said not to, and `llms.txt` recommends exactly those two blocks for a dashboard.

**The answers exist and are unpublished.** `DESIGN.md` §5 specifies the container widths (1400px, 800px prose), gutters (48/24px) and section rhythm it guessed at. §10 holds the entire voice spec. §11 holds a Do/Don't list that would have changed its code. Both files return 404 on the site. Storybook's introduction even links to `DESIGN.md`, a dangling reference for anyone outside the repo.

**On intent legibility, its verdict:** "I could see the mechanics clearly and the point of view barely at all." The three named principles that would have fixed this — *Paper first*, *One italic word*, *A gentle settle* — exist only in the marketing HTML of the landing page, which no agent has a reason to parse.

Where the system does state judgement, it is excellent. The chart-token rules, the "reach for instead" cross-references, and the tone-matching guidance were singled out as real taste, encoded. There is just not enough of it, and none of it covers composition or voice.

**One contradiction it hit** deserves fixing regardless: `usage/tone-badge.md` says render every uppercase pill through ToneBadge, and `data-table.tsx` — the canonical status-badge block — uses a plain `Badge`. All 51 blocks do. The component the docs insist on has no consumer in the system itself.

---

## 3. Documentation accuracy

`DESIGN.md` opens by claiming to be "everything an agent or developer needs to design on-brand." Measured against source:

| Measure | Checked | Wrong |
|---|---|---|
| Hex values | 28 | 2 |
| Distinct CSS variables named | 95 | **24 do not exist** |
| File and path claims | 18 | 13 |
| Component code samples | 9 | **8** |

The distinction that matters is **misleading** versus **under-informed**.

**Actively misleading** — confident, specific, wrong:

- **Two colour values are the pre-accessibility versions.** `--terracotta-deep` is listed as `#944A33` (actually `#8A4530`) and `--moss-deep` as `#5E6E43` (actually `#4C5936`). Both were darkened by explicit commits to clear AA. Anyone copying from the spec reintroduces the exact failure those commits fixed.
- **The component section documents a library that no longer exists.** Props like `variant="primary"`, `withArrow`, `tier`, `interactive`, `label`/`invalid`/`multiline` are all gone; `Eyebrow` and `ProductCard` do not exist; a global named `window.QuillDesignSystem_a37217` appears nowhere in the codebase.
- **`--accent` means something different from what the doc says.** The doc says terracotta; it is the shadcn hover wash, a beige. A wrong name errors loudly. A right name with a wrong meaning does not.
- **The public token reference page renders 11 variable names that do not exist**, because its walker joins the object path while the build script strips the `pigment` namespace. It emits `--pigment-moss` where the real token is `--moss`. This is the page an agent is most likely to copy from.
- **The interaction language is wrong.** All five state descriptions contradict the shipped button: hover is not terracotta, focus is not a 2px ink outline but a 3px accent ring.

**Merely under-informed** — silent but nothing false: no mention of teal, the intelligent theme, the run-status tokens, the chart system or the shadcn alias layer. `Colors.mdx` and `Elevation.mdx` are in this category and are otherwise excellent, because they render live from source.

That split is the whole lesson. **Where docs are generated, they held. Where they are prose, they rotted.**

---

## 4. Everything else, by area

### Build pipeline
Deterministic and byte-reproducible; all ten committed artifacts currently in sync. Real issues:

- `prebuild-storybook` builds the registry *before* the icons it inlines, so a run that changes the icon set ships a stale `icon.json`. CI has the correct order; `package.json` does not.
- Six generated artifacts have no test-suite staleness guard; three have no CI guard. `public/usage/*.md`, `registry.json` and `modules.d.ts` are checked by tests but not CI, and `build:usage` never runs in CI at all — and since it *writes* `registry.json` which `build:registry` reads, CI can compare two equally stale sides and pass.
- `injectMarkers` throws on a missing marker but silently corrupts on reversed or duplicated ones.
- `build-manifest.mjs` still carries an escaping bug that `build-icons.mjs` documents as fixed, so one of its two extraction branches never matches.
- 26 of 106 published usage pages contain literal `&lt;` entities, because the Storybook escaper is reused for raw markdown.

### Components
- One shipped icon name (`draft`, in `file-upload`) is outside the 89-name core set and renders blank in consumer apps. The consumer icon cut has no lazy loader and types names as plain `string`, so nothing catches it. 79 of 80 other names are fine.
- `mail-shell` cancels its own focus ring (`outline-none` plus an outline *colour*, no style), leaving keyboard-focusable rows with no visible indicator.
- Three inputs ship with placeholder text and no accessible name. The other 27 are correctly labelled.
- Checkout's payment radios are `sr-only` with no focus treatment on the visible proxy, so tabbing shows nothing.
- Seven blocks reference a font variable that only exists inside this repo, so their headings downgrade to Georgia everywhere else — visibly two different serifs beside `font-heading` blocks.
- Four overlay primitives use pure black, against the house rule.
- Consistency drift: two card-edge treatments, three top-padding values for one slot, five hand-rolled avatars beside four using the primitive, and two sidebar implementations of very different quality.
- No block uses `useId`; every form id is a hardcoded string, so two instances on one page break label association.

### Tests
111 token/script tests and 388 story tests, all passing, no flakes, no skips, under 30 seconds total. Accessibility is genuinely enforced and fails the run. Weaknesses:

- **Coverage config excludes everything that ships** — it measures `src/components/**` only, not the 51 blocks or the consumer cuts.
- **Storybook renders the wrong default accent.** Stories default to terracotta; the shipped default is moss. All 388 accessibility checks validate a scheme no consumer gets. Only 4 of 388 stories test a non-default theme; three of the five themes have zero rendered coverage.
- **The consumer icon cut is never rendered or type-checked** by anything, and it has broken once before.
- **The icon staleness test cannot fail**, because the pretest hook regenerates the file it reads.
- Five a11y opt-outs are blanket rather than per-rule, and because one component renders both halves of a Do/Don't pair, switching it off also silences the *correct* example. Two of the five give no justification; one cites a convention that does not exist. The right pattern is already in the repo — `progress.stories.tsx` disables exactly one rule.
- Two source-grep tests and one tautology that cannot fail.

### CI and automation
- **`claude-repair` has never executed.** 50 triggers, 50 skips, because both the feature flag and the API key it needs do not exist. The documentation lists it among the working workflows, so red `main` waits for a human, silently.
- **A dependency PR is stuck right now and no bot can heal it.** The bump changes generated icon typings; the self-heal bot only watches `main`, never PR branches. Generated-file drift introduced *by* a dependency bump is unhealable by design.
- **`figma-parity` reports green daily while watching one placeholder node named `Test`.** The baseline has not moved since 2026-08-13 and the Figma PR bot has never opened a PR. Additionally, any uncaught exception in that script exits 1, which the workflow captures into a variable and never reads, so a dead Figma token produces an unbroken run of green checks.
- **Two bots will fail the moment a repair PR stays open**, because they check out without full history and then force-push with a lease that cannot resolve. Reproduced end to end. Currently masked by branch-delete-on-merge.
- A half-failed publish permanently strands a release: the tag exists, so every later run reports "already tagged" and exits 0, and the release event that drives `library-sync` never fires.
- `drift-audit.mjs` crashes on the exact defensive path its own comment describes, because neither caller checks the `null` the helper returns.

**Security.** No secrets are exposed: both `.env` files are ignored, untracked, and never committed, and no credential-shaped string appears in any tracked file. Dependencies on `main` are healthy — 0 critical, 1 high (a dev-only YAML parser, not reachable), 4 moderate all fixed by an open PR correctly held for human review. Three latent items:

1. **`claude-repair` is triggerable from an outside fork.** Its `workflow_run` filter matches the *triggering* branch, and a fork's default branch is also `main`. The agent then reads attacker-influenced logs while holding write credentials on the base repo. Not exploitable today only because the flag and key are absent. Add an `event == 'push'` check before ever enabling it.
2. **`enforce_admins` is off**, so the automation token can push directly to `main`. The documented guarantee that "nothing writes to a default branch" is script discipline, not enforcement.
3. **Default workflow permission is write**, and `ci.yml` has no `permissions:` block — so `npm ci` runs dependency lifecycle scripts with a write-capable token on auto-merging dependabot branches.

---

## 5. Recommended sequence

**Now — consumer-visible breakage**

1. Add `--color-gold-text` and fix the indigo names, so ToneBadge works. (Section 1.1)
2. Point `--warning` at `gold-text` and `--info` at `indigo-deep`. Two token edits, eight contrast failures resolved. (1.5)
3. Add `[data-theme="intelligent"]` to the dark variant selector. One line, 80 dead utilities restored. (1.6)
4. Add Checks-read to the sync token, and wrap the per-app loop in its own try/catch. (1.3)
5. Re-cut chart series 3 and 5, then add colour-vision simulation to the token tests so the guarantee is enforced rather than asserted. (1.2)

**Next — the structural fix**

6. Ship the token layer through shadcn's `cssVars` and `css` fields. This closes 1.4, makes the type and radius scales real in apps, and lets `DESIGN.md`'s foundations be generated from the token source instead of hand-written. Already specified as W19 in the agent-readability spec.
7. Correct `DESIGN.md`'s misleading sections and the token reference page's variable names before publishing any of it to agents. (Section 3)
8. Publish `DESIGN.md` §5, §10 and §11 into `llms.txt`. The cold-read test says this alone converts four of its six guesses into told answers and would have prevented the anti-reference.

**Then — close the holes that let this happen**

9. A staleness guard for `public/r/*` and the usage layer, and `build:usage` in CI.
10. A test that every token named in any agent-facing text exists in the shipped theme.
11. A test that every place enumerating themes agrees with `MODES`. This one check would have caught five of the six Intelligent-theme gaps.
12. Fix the Storybook default accent, and add theme coverage beyond Dawn.

Items 10 and 11 are the ones that matter longest. Every finding in section 1.6 and most of section 3 exists because a value was added in one place and not the four others, and nothing failed.

---

## 6. What was cleared

Worth recording, because the audit was adversarial and these held up.

- Token pipeline is deterministic; two full runs byte-identical. All ten committed artifacts in sync.
- All 42 mode-varying primitives and 51 aliases present in every theme; zero unresolved tokens across all 25 theme × accent contexts; zero value conflicts between the site and registry cuts across 679 declarations.
- All four accents clear AA on page, card and well in all five themes — minimum 5.19 across 60 combinations.
- Core text, surface pairs and status tokens (other than warning and info) clear 4.5:1 everywhere; minimum 4.53.
- Sequential chart ramps are monotonic and single-hue in all five themes; diverging ramps have a genuinely neutral midpoint and symmetric ends.
- Figma DTCG export carries all five modes on all 99 leaf tokens.
- No skipped, `.only`, or swallowed tests. No flakes across repeated runs. Accessibility genuinely gates the suite.
- All 51 blocks are rendered and accessibility-checked by at least one story.
- Zero hand-rolled tag pills, zero hardcoded focus-ring colours, zero emoji, and every icon-only control carries an accessible name.
- Server/client boundaries are correct in all 51 blocks; no state-in-render, no prop mutation, no controlled/uncontrolled switches.
- `release.yml` and `self-heal.yml`: 185 of 185 green. The dependabot held-majors reasoning is sound and matches observed history. The pattern-scan workflow is the best-engineered piece in the fleet.
- No secrets exposed anywhere, in the working tree or in history.

---

## Appendix — the one-line explanation

Everything generated from `src/tokens/quill.tokens.mjs` is correct. Everything hand-maintained next to it has drifted. The fix is not to write better documentation; it is to generate more of it, and to add tests that fail when a value exists in one place and not its four siblings.
