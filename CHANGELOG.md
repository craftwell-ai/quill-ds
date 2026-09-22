# Changelog

All notable changes to the Quill Design System. Follows [semver](https://semver.org):
breaking token/API changes bump major (minor while pre-1.0), new features bump minor,
fixes bump patch.

**Release routine (every feature/fix PR):** bump `version` in `package.json`, add an
entry here, and run `npm run build:llms` (llms.txt embeds the version). **Never tag or
publish a release by hand.** After the PR merges, the release bot
(`.github/workflows/release.yml`) tags the commit and publishes the GitHub release
within a minute, and that release is what triggers `library-sync` into the apps; a
manual tag races the bot and can leave a tag with no release behind it. The homepage
footer reads `package.json` directly, so the displayed version updates with the bump.

## [0.10.4] — 2026-09-22

Pass 1 of the Figma type audit. Nothing an app receives changes.

### Changed
- **Figma: four text styles take the line height their size renders in code.** The audit
  (0.10.3) found the code's answer nearly uniform per style — 207 of 227 matched `Body/S`
  layers render exactly `text-sm`'s 13.6px on a 142.857% line, while the style held
  160% — so these are style-level changes, not a layer-by-layer pass:

  | style | was | now |
  |---|---|---|
  | `Body/S` | 160% | 142.857% (`text-sm`) |
  | `Body/XS` | 150% | 133.333% (`text-xs`) |
  | `Label/Default` | 140% | 142.857% (`text-sm`, Medium) |
  | `Label/Small` | 140% | 133.333% (`text-xs`, Medium) |

  In the sync snippet they say `leading: 'paired'` — the size's own line height from the
  export — which clears three of the ten hand-typed values in `TYPED_METRICS` and corrects
  `Body/XS`, which had been given the `ui` role (150%) though nothing at `text-xs` renders
  it. Run in the library: those four styles moved, nothing else; the 445 layers bound to
  them (all auto-height, none fixed) reflowed 2–3 px shorter per line. Re-audited on a fresh dump of all 94 roots: **657 of 871 matched layers now exact (75%), up from 206 (24%)**; line-height mismatches 631 → 156. A QA pass compared every pattern and template page against its Storybook capture after the reflow: 49 of 50 clean — no clipped text, no overlap, no frame that failed to shrink. The one flag (the app-page template's stat-card delta row, 159 px in a 154 px card) is a horizontal overflow from the 672 px composition, present before this change; it is on the pass-2 list.

## [0.10.3] — 2026-09-21

### Fixed
- **Seven shipped blocks rendered their display type in Georgia, not Fraunces.** `hero`,
  `navbar`, `footer`, `error-404`, `testimonial`, `feature-section` and `dashboard` set
  the face with `font-[family-name:var(--font-fraunces,Georgia,serif)]`. `--font-fraunces`
  is set by next/font in the Quill **site's** layout and nowhere else — not the shipped
  theme file, not the CLI payload, not Storybook — so everywhere but quilldesignsystem.com
  the fallback won: the hero headline, the wordmark and the 404 numeral were Georgia in
  every app and in every story. They use `font-heading` now, as the other 14 display
  uses in the blocks already did. Browser-checked before and after: Georgia → Fraunces on
  each. The Do / Don't pair stories for Testimonial and Error 404 hand-built the same
  class and moved with them, and the Typography docs page drew its "Fraunces" specimens
  through the same variable. Found by the Figma type audit: Figma had it right.
- **Guard: shipped code reads no CSS variable an app never receives.** The utility check
  could not see this — a bracketed value with a fallback always "resolves". Quill-shipped
  code reads eight variables in all; the only ones outside the theme are the
  `--color-<series>` names a `ChartContainer` defines at runtime.

### Added
- **The Figma type audit** (`scripts/figma-type-audit/`, report in
  `docs/audits/2026-09-21-figma-type-audit.md`): every Figma text layer's size, line
  height, tracking, weight, family and case against the browser's computed style for the
  same words. First run: 1,077 layers in 94 roots, 871 matched, **206 exact (24%)**, 631
  off on line height. The answer is nearly uniform per style — 207 of 227 matched
  `Body/S` layers render exactly `text-sm`'s 13.6px / 142.857% — so four style-level
  changes settle most of it. No Figma layer is changed by this release.

## [0.10.2] — 2026-09-21

### Fixed
- **`dark:` follows Quill's dark themes in an app.** Stock shadcn primitives carry 71
  `dark:` tweaks (`dark:bg-input/30`, `dark:aria-invalid:ring-destructive/40`…). A stock
  app defines that variant as `.dark *`, so on `data-theme="dark"` none of them fired:
  Dusk, Classic Dark and Intelligent rendered differently in an app than in Storybook,
  where the site defines the variant. The `quill` item now ships
  `@custom-variant dark (&:is(.dark *, [data-theme="dark"] *, …))` in its `css` field —
  the CLI writes the at-rule into the app's main stylesheet, where Tailwind processes it.
  The rule keeps `.dark *` on purpose: Tailwind honours the last definition of a custom
  variant (compiled: stock then ours → ours), and an app toggling shadcn's stock class
  must keep working. Derived from the theme list, so a new dark theme joins by itself.
  The theme **file** cannot carry it (it is imported outside the Tailwind entry), so the
  theming docs now give file-channel apps the one line to add. None of Quill's own
  blocks uses `dark:`; they re-cut through the tokens.
- **`onboarding`: the progress track was invisible to WCAG 1.4.11.** The block
  hand-builds its bar, and drew the empty track in `muted` — 1.07 to 1.25:1 against the
  page and the card in every theme, where a non-text boundary needs 3:1. It is `input`
  now (3.04 to 4.56:1), the role the Progress primitive took for the same reason in
  0.9.39 and the one the role guidance names for "the empty track of a switch, slider or
  progress bar". The only hand-built track in the shipped blocks; the Figma twin's track
  (`585:80`) is rebound to `semantic/input` to match.

## [0.10.1] — 2026-09-21

Closes step 5 of the token-unification plan, and fixes what a dry run of the CLI
install into tech-careers turned up. An app on the file channel receives nothing new
but one sentence in the agent rules; an app installing through the CLI receives a far
smaller, cleaner merge.

### Changed
- **The sanctioned tints are declared in the token source.** Which opacities the system
  uses on purpose (`destructive` at 10%, `muted` at 50%, the four ToneBadge washes…)
  was a table inside the Figma sync snippet — a design decision the token source knew
  nothing about. It is now `tokens.tints`; the export resolves each to the variable it
  is cut from (`Tints`), the sync reads that, and `roles.test.mjs` fails if the snippet
  grows a table of its own again. Re-run in the library: 0 created, 13 updated, no
  value or scope changed.

### Fixed
- **A CLI-installed app got 271 classes nobody asked for.** The shadcn CLI registers
  every colour in `cssVars.light` as a `--color-*` theme key, and Quill put all of
  `:root` there — so `npx shadcn add @quill/quill` wrote `bg-dk-paper`,
  `bg-cd-indigo-deep`, `bg-int-ink` and 268 more into the stylesheet an app's agents
  read (measured with the real CLI in a scratch clone of tech-careers: 103 theme keys
  asked for, 374 written). `cssVars.light` now carries only the contract roles — the
  keys the CLI is built to map — and every other `:root` declaration rides in
  `css[':root']`, which the CLI writes verbatim and registers nothing for. Same
  install, re-run: 134 keys (the 103 asked for plus the CLI's 31 harmless
  self-references for the contract), **no unasked `--color-*`**, every variable still
  declared, theme switching intact.
- **`--space-0_5`, `--space-1_5` and `--space-2_5` never reached a CLI-installed
  app.** The payload builder's pattern did not allow an underscore, so the three
  half-steps were silently dropped from `cssVars`. Found by the new "nothing dropped on
  the way" assertion; they ship now.
- **library-sync would have migrated a file-channel app unasked.** It decided an app
  was CLI-installed by counting `cssVars.light` names in its stylesheet. With that
  field reduced to the contract roles, every stock shadcn stylesheet matches — checked
  against tech-careers' real `globals.css`: 32 of 32 — and the bot would have run
  `shadcn add --overwrite` on it, rewriting its fonts and radii. Detection now counts
  Quill's own variables (`css[':root']`), which no stock app carries: tech-careers as it
  is → not merged; the same app after a CLI install → 270 of 270. Items released before
  the split fall back to the old field.

### Decided
- **`--space-*` stays.** Nothing reads it — not shipped code, not the site, not
  tech-careers — because components write `p-4`. It stays because it is the CSS name
  behind Figma's `space/*` and the documented scale, and dropping a public variable
  buys nothing. What makes that honest is now a test: every `--space-N` must equal the
  step Tailwind renders for `p-N` (0.25rem × N), so the variable and the class can
  never disagree. The docs say to write the class in a component.
- **The six bracketed motion values stay.** All six (`duration-[0.35s]`,
  `ease-[cubic-bezier(0.22,1,0.36,1)]`, three of each) sit in one file,
  `src/components/ui/navigation-menu.tsx` — a stock shadcn primitive Quill restyles
  through tokens and does not ship. Rewriting stock primitive internals is how a system
  drifts off upstream; no shipped block or example uses a motion utility at all.

## [0.10.0] — 2026-09-21

One token, one name. A colour had three spellings — `color/paper/base` in Figma,
`--paper` in CSS, `bg-paper` as a class — and the colour contract every component
speaks was labelled with the name of the library its role names came from. **No CSS
name, class or value changes in this release**: the shipped stylesheet holds the same
473 declarations. What moved is what things are called in Figma, in the token source
and in the docs.

### Added
- **Every colour role says what it is for.** The agent docs named 3 to 12 of the 31
  roles and said when to use none of them — and the names do not explain themselves:
  seven surface roles are three colours (`card` = `popover` = `sidebar`; `secondary` =
  `muted` = `accent`), `primary` is ink, and `accent` is the pale highlight rather than
  the accent. `src/usage/roles.mjs` now carries one *use for / never for* line per role,
  per status role and per sanctioned tint, grounded in how shipped code uses each
  (842 class uses measured; counts and examples in `docs/drafts`). One source, four
  outputs: a generated span in DESIGN.md, the Tokens section of llms.txt, a compact
  1.8 KB form in the agent-rules file apps install (its budget moves 18 → 19.5 KB for
  this and nothing else), and Storybook's Colors page. Two rules the names hide are
  now written down: list and menu items highlight with `accent` while standalone
  controls and table rows wash with `muted`; a prose link follows the accent while a
  link-styled Button is ink. `ring` has a second sanctioned job: the one selected or
  featured item in a set.
- **Status roles have classes: `text-success`, `text-warning`, `text-info`,
  `text-working`, `text-queued`, `text-link`.** Six of the eight status roles were read
  nowhere in the repo and no utility reached them, so an agent had no way to write a
  success or warning colour. Each clears 4.5:1 as text on page, card and well in all
  five themes (the existing contrast test); none is sanctioned as a fill.
  `--text-accent-color` stays a variable — the theme applies it to `a` and
  `.fraunces-accent`.

### Changed
- **The colour contract is named `semantic`.** The 31 roles components speak
  (`bg-background`, `text-muted-foreground`, `border-border`) stay shadcn-compatible,
  so stock primitives and third-party blocks still land on Quill's palette with no
  edits — but the contract is Quill's own and is now named for what it is. Token source
  `shadcn` → `semantic`; Figma `shadcn/*` → `semantic/*`; the export's five
  `Theme` buckets → one `semantic` group of 39 (the 31 roles plus the eight status and
  accent roles: `text-accent-color`, `link`, `success`, `warning`, `danger`, `info`,
  `working`, `queued`, now `tokens.status` in the source).
- **A Figma variable is its CSS name with one group level.** `color/pigment/terracotta/deep`
  → `color/terracotta-deep`, `color/line/base` → `color/line`, `spacing/2_5` →
  `space/2_5`, `corner-radius/lg` → `radius/lg`, `type/sm` → `text/sm`. The rule lives
  in `build-tokens.mjs`: the export carries every variable's `name` and, where it
  differs, its `legacyName`. 121 variables were renamed **in place** in the library —
  the same 155 ids before and after, so every binding survives. The sync now finds a
  variable under its legacy name and renames it rather than creating a twin beside it
  (it upserts by name, so a re-run under new names would have orphaned every binding);
  re-run against the library: 0 created, 0 renamed.
- The parity bot reads names from `figma/sync-state.json`, never from Figma, so the
  repo's tables moved with the rename: 181 names there, 694 in
  `figma/pattern-baseline.json`, the three name shapes `classFor()` parses, the drift
  fixtures, both Figma skills and the build log.

### Deprecated
- **Eleven aliases that duplicated the contract** (ten surface, text and border aliases, and `--danger`, which is `--destructive`). No shipped component and no utility
  ever used them. They are still emitted, so an app that wrote `var(--text-strong)`
  keeps its colour; they are gone from the docs, parked in Figma as `deprecated/*`
  (hidden from publishing, never deleted — a consuming file may be bound to one), and
  `deprecated-tokens.test.mjs` keeps them out of this repo's code. Removal in a later
  minor. Use instead:

  | retired | use |
  |---|---|
  | `--surface-page` | `--background` · `bg-background` |
  | `--surface-card` | `--card` · `bg-card` |
  | `--surface-well` | `--muted` · `bg-muted` |
  | `--text-strong` | `--foreground` · `text-foreground` |
  | `--text-body` | `--ink-soft` · `text-ink-soft` |
  | `--text-muted-color` | `--muted-foreground` · `text-muted-foreground` |
  | `--text-on-ink` | `--primary-foreground` · `text-primary-foreground` |
  | `--border-card` | `--border` · `border-border` |
  | `--border-field` | `--input` · `border-input` |
  | `--border-divider` | `--line-faint` |
  | `--danger` | `--destructive` · `text-destructive` |

### Fixed
- **DESIGN.md told agents to "reach for" tokens that do nothing.** Its semantic-alias
  list named three variables that never existed (`--text-muted`, `--text-accent`,
  `--accent-pressed`), called `--accent` terracotta when it is the pale hover surface
  (`paper-deep`), and listed the ten aliases above, which no class can reach. The
  section is now generated from `roles.mjs`; a guard fails on a retired or
  never-existing name in DESIGN.md, PRODUCT.md, AGENTS.md, README.md, llms.txt or the
  agent-rules file. `token-truth.test.mjs` now reads DESIGN.md and PRODUCT.md as well,
  and on its first run found five more variables defined in neither stylesheet:
  `--focus-ring`, `--focus-ring-danger`, `--scrim`, `--shadow-btn-hover` and
  `--grain-noise` (plus `--tracking-wide`, now `tracking-label`). Focus is `--ring`, the
  accent's text cut, in every theme. DESIGN.md also listed CTAs under moss (actions are
  ink) and links under indigo (links follow the accent).
- **Figma: every icon was bound to a retired variable.** The icon sync preferred
  `text/strong` for the 91 glyph fills and `surface/page` for the gallery ground —
  the Icons page was outside the earlier binding audit. Both now bind
  `semantic/foreground` / `semantic/background` (the same ink and paper, so nothing
  moved), in the library and in `figma/sync-icons.figma.js`.
- `mail-shell` hovered its thread rows with `muted`; list items highlight with `accent`
  (the same colour, the right name).
- The site's own page used six of the retired aliases through bracketed values
  (`text-[var(--text-strong)]`); it speaks the contract now (32 swaps, each to the same
  primitive).

## [0.9.61] — 2026-09-21

### Added
- **Every type size declares the line height its class renders.** `text-sm` has always
  drawn 13.6px on a 142.857% line, `text-base` on 150%: Tailwind's default pairings,
  inherited silently when Quill re-cut the sizes and written down nowhere. They now
  live in the token source (`textLeading`) and ship under Tailwind's own key
  (`--text-sm--line-height`), so the `text-*` utilities read them with no new class to
  learn. **Nothing renders differently** — a before/after compile of all ten sizes
  resolves to the same ratios; `2xs` still inherits. The type table in DESIGN.md,
  llms.txt and the agent-rules file gained a generated Line column.

- **Leading and tracking roles: `leading-display / -heading / -ui / -reading`,
  `tracking-display / -label / -eyebrow`.** The scale was documented as numbers to type
  (`leading-[1.7]`, `tracking-[0.15em]`) under the names snug / tight / wide — names
  Tailwind already owns with other values (`leading-snug` is 1.375, `tracking-wide`
  0.025em) and that shipped components use, so redefining one would re-space text that
  never asked. Roles are named for the text they set, which also tells an agent when to
  reach for one. Each ships as a class and as a variable. The base layer (`body`,
  `h1`–`h6`) now reads them instead of typing 1.7 / 1.2 / 1.05 / −0.03em in two
  stylesheets, and the 8 bracketed values in shipped code (hero, faq, feature-section,
  stats-band, team-section, invoice, ToneBadge) plus 12 on the site became roles. **Every
  swap is value-identical** (compiled side by side), and Tailwind's own names still hold
  Tailwind's values. Only values shipped code uses earned a token: the documented
  −0.02em and 0.2em had no user and are gone from the docs. Guards:
  `build-tokens.test.mjs` (roles ship; none reuses a Tailwind name) and
  `type-metrics.test.mjs` (no bracketed value where a role names it; no typed number in
  the base layer).

### Fixed
- **Figma's text styles read their family and size from tokens.** They were the one
  layer typed by hand beside the tokens, and had drifted where nothing checked:
  Heading/S and Body/L sat at 18px while `lg` is 18.4, and the Eyebrow at 11 while
  code and DESIGN.md both say `text-xs` (12). The sync snippet now names token keys
  and resolves them from the export; all three are corrected in the library. It also
  generates one `Text/<size>` style per `text-*` utility (size + line height), so a
  layer whose code twin is a bare `text-sm` has an exact style to bind to instead of
  Body/S at 160%. `scripts/figma-text-styles.test.mjs` runs the resolution against the
  real export. Curated styles take a leading or tracking role wherever their value
  already equals one (re-run in the library: 23 updated in place, none moved). Still
  typed, in a list that may only shrink: nine values that are no role and mostly
  disagree with code (every h1–h6 tracks at −0.03em, not −2 or −1; `text-sm` draws a
  142.857% line, not 160 or 140) — moving them re-spaces bound layers, so they wait for
  a visual pass — and `Accent` at 28px (no token holds an inherited size).

## [0.9.60] — 2026-09-21

### Changed
- **The indigo utilities are spelled like their variable: `bg-indigo`,
  `text-indigo-deep`.** Every other pigment's class already matched its CSS variable
  (`--moss` → `bg-moss`, `--teal` → `bg-teal`); indigo alone shipped as
  `bg-indigo-brand` for `--indigo`, on the 0.8.29 reasoning that the plain name belonged
  to Tailwind. It does not: Tailwind defines only numbered shades (`indigo-500`), and a
  compile holding both shows `bg-indigo` reading `var(--indigo)` with `bg-indigo-500`
  untouched, which is how `teal` has always shipped. The mismatch had already cost one
  bug (0.8.29: ToneBadge asked for `bg-indigo` and rendered an unstyled chip).
  `indigo-brand` and `indigo-brand-deep` stay as deprecated aliases, so an app on the
  old spelling keeps its colour. ToneBadge, the theme selector's accent swatch and its
  story use the new names, and `build-tokens.test.mjs` now fails on any colour utility
  named differently from the variable it reads.
- **Dependencies.** The two Dependabot merges the release bot had queued as 0.9.59 ride
  in this release, which supersedes that proposal: `next` and `eslint-config-next`
  16.3.4 → 16.3.5, `@material-symbols/svg-400` 0.47.2 → 0.47.4, `tailwind-merge`
  3.6.0 → 3.7.0, `@types/node` 24.13.4 → 24.13.5.

## [0.9.58] — 2026-09-19

### Fixed
- **Figma: Accordion twin re-cut to the code's anatomy.** A property-level check of
  the Accordion (computed styles from the live story vs the twin's node dump) found the
  twin still off in nine ways the screenshot pass had accepted: trigger text at
  Body/Base 15.2 px Regular instead of text-sm 13.6 px Medium with the h3-inherited
  −0.03em tracking; item padding 16 instead of `py-2.5` (10); a hand-drawn 18 px
  chevron beside the label instead of a 16 px `icon/keyboard_arrow_down` at the right
  edge; content in muted-foreground instead of the shipped body colour (`ink-soft`);
  a bottom rule under the last item (`not-last:border-b`); and placeholder copy. Fixed
  in place; the baseline text map follows. Remaining, by design of the tools: Figma
  rounds line height to whole pixels (19 vs 19.43), so ruled items measure ≤ 1 px
  shorter than the DOM.

## [0.9.57] — 2026-09-19

### Changed
- **Figma: every pattern page and template is a master component.** The 47 mirrored
  pattern frames were converted in place to main components (same pages, new node ids,
  code-twin descriptions), and the three page examples in `registry/examples` now exist
  as `❖ Example: app page / auth page / marketing page` template components composed
  from the block components as instances. `figma/sync-state.json` gained a `templates`
  map and the pattern guards (coverage, content parity, re-stamp, the daily presence
  check) cover templates exactly like blocks (`scripts/figma-stamp.mjs sourcePath`).
- **Figma: tint variables.** The opacity modifiers code puts on tokens
  (`bg-destructive/10`, `ring-foreground/10`, `bg-muted/50`, the ToneBadge pigment
  tints, …) are now 13 alpha-carrying `tint/*` variables in the Primitives collection,
  derived per mode by `syncTints()` in `figma/sync-foundations.figma.js`; 97 tinted
  paints bind them. A paint-level opacity on a bound colour is dropped when a component
  is instanced inside another component — the template pages drew every tinted badge
  and card ring solid until this change.

### Fixed
- **Figma ↔ Storybook visual parity sweep** (44 twins, 47 pattern pages, 3 templates,
  compared by screenshot against the Storybook render, then re-verified by an
  independent QA pass with pixel samples). Drift found and fixed in Figma: destructive
  Badge drawn solid (label invisible) and its stat-cards instance; unchecked Checkbox and
  Radio had no border; checked Radio drawn inverted; checked Checkbox glyph thin and
  grey; destructive Alert had a destructive border; InputGroup send arrow drawn
  ink-on-ink; Breadcrumb, Pagination, search-result titles and the sidebar-nav crumb
  drawn muted although they are links; Pagination active cell filled instead of
  outlined and missing its Previous/Next labels; Dialog and both Sheet variants had no
  close button; Command search row drawn as a plain row instead of the input-group
  field; Badge link variant underlined at rest; Sheet footer order reversed; Popover,
  Dropdown menu, Context menu and Combobox rings at full strength; every ❖ component
  page on a grey canvas instead of paper.
- `notifications` block: `flex-row` on the grid `CardHeader` was inert, so "Mark all
  read" wrapped under the title — now `flex flex-row`; page re-stamped.

## [0.9.56] — 2026-09-18

### Changed
- chore(figma-sync): adopt Figma twins into the parity baseline

## [0.9.55] — 2026-09-18

### Fixed
- **Adopt matcher anchors on a real class string** (CRA-221). When the only class a
  twin derives sits in a one-class cva variant value (Tabs: `default: "bg-muted"`),
  the entry now anchors on the file's first class string instead of giving up; a
  directive such as `'use client'` is never taken for one, so a later repair can
  never rewrite it. Tabs adopts on the next run — 29 of 29.

## [0.9.54] — 2026-09-18

### Changed
- chore(figma-sync): adopt Figma twins into the parity baseline

## [0.9.53] — 2026-09-18

### Changed
- **Every mirrored pattern page is now stamped** (CRA-223). The 22 pages built
  in July were rebuilt in Figma from today's blocks — copy, icons, component
  instances and the shipped Card anatomy (16 px spacing, foreground ring at
  10 %, Fraunces titles at weight 500, a muted footer band) — and stamped with
  their block hash, so `figma-restamp.test.mjs` holds 47 of 47 and the content
  check in `figma-pattern-parity.test.mjs` covers every page. Thirteen earlier
  pages still on the old card recipe were patched to the same anatomy.
- **The Figma parity workflow takes a `snapshot` input** that re-reads every
  mirrored frame into `figma/pattern-baseline.json` and opens a PR — the step
  after pages are rebuilt, runnable without a local Figma token.

### Fixed
- **Adopt matcher** (CRA-221): a spacing variable takes its unprefixed
  definition (`[--card-spacing:--spacing(4)]`, not the `data-[size=sm]:`
  override), a left padding is accepted as `pl-N`, and a one-class cva variant
  value (`default: "bg-muted"`) counts as a class string — Card, Tabs and
  Select adopt on the next run.
- **Pattern content expectation** drops Base UI's inline clip-path helper text
  (Progress rendered an "x"), reads `placeholder`/`value` only from fields, not
  from radios or buttons, and lets a chart block (recharts) show more strings
  than the server render, never fewer.

## [0.9.52] — 2026-09-18

### Changed
- chore(figma-sync): adopt Figma twins into the parity baseline


## [0.9.51] — 2026-09-18

### Changed
- **Adopt matcher reads code the way it is written** (CRA-221). A class counts
  when it sits behind a variant prefix (`data-unchecked:bg-input`), on an axis
  (`gap-x-2` for `gap-2`), behind a spacing variable the file defines
  (`gap-(--card-spacing)` = `gap-4`), or as `rounded-full` for `rounded-4xl`.
  A candidate may name the base component's file (`alsoIn`) for inherited
  classes, or declare itself detection-only with an `anchor` when its code is
  styled by CSS variables. Thirteen twins were pushed to today's code in Figma
  (Card, Alert, Tabs, Select, Pagination, InputGroup, Dialog, AlertDialog,
  HoverCard, Menubar, Command, ToggleGroup, InputOTP) and Switch's track padding
  unbound, so the remaining sixteen candidates can adopt.

## [0.9.50] — 2026-09-18

### Added
- **Pattern content parity** (CRA-223). `figma/pattern-baseline.json` records
  what every mirrored Figma frame shows (texts, icon components, top-level
  instances, bound variables); the daily run diffs all 47 frames against it
  and names the page when Figma moves. `scripts/figma-pattern-expect.mjs`
  renders every block with react-dom/server, and
  `scripts/figma-pattern-parity.test.mjs` requires each stamped page to show
  exactly the block's strings and carry its icons — the check that would have
  caught the 2026-09-12 copy change on its own. All 25 stamped pages pass.

### Changed
- **Icons on pattern pages are instances** of the `icon/*` components (36
  composed vectors replaced), the Feature section eyebrow reads "Why Quill"
  with the style doing the uppercasing, and `error-404` names `arrow_back`
  instead of rotating `arrow_forward` (page re-stamped).

## [0.9.49] — 2026-09-18

### Changed
- chore(figma-sync): adopt Figma twins into the parity baseline (#193)

## [0.9.48] — 2026-09-18

### Added
- **Component coverage guard** (CRA-221). `figma/sync-state.json` now declares a
  status for every file in `src/components/ui`: 15 under the daily check, 29
  candidates (every Wave B / Wave C twin joins ToneBadge and Switch), 13
  declined with reasons (the twelve July deferrals plus the Icon wrapper and
  the ToneBadge site shim). `scripts/figma-component-coverage.test.mjs` fails
  when a primitive has none of the three.

## [0.9.47] — 2026-09-18

### Added
- **Button icon slot in Figma** (CRA-222). The Button twin gains Icon start /
  Icon end booleans and instance-swap properties over the full icon set, with
  the icon colour following each variant; the 24 icon-only variants swap their
  glyph the same way. Every icon button across the 47 mirrored pattern pages is
  now a real instance with its icon on — including the Invoice "Download PDF"
  button that started this — and the buttons the July pages never had were
  added. The daily check's Button baseline carries the new start / text / end
  structure.

### Changed
- **Icon sync is an upsert** (`figma/sync-icons.figma.js`): existing `icon/*`
  components keep their ids (17 had live instances in the Wave B/C twins), new
  ones are created, orphans reported. Re-run 2026-09-18: 91 icons, 40 refreshed
  in place, 51 created.

## [0.9.46] — 2026-09-18

### Added
- **Figma re-stamp guard** (CRA-219). Each mirrored pattern page now records the
  hash of its block source at the last sync (`codeHash` + `syncedAt`) or a
  `stale` reason; the token source records its hash at the last foundations
  sync. `scripts/figma-restamp.test.mjs` fails when a block or the token source
  changes without Figma being re-synced, naming `node scripts/figma-stamp.mjs`.
  25 pages are stamped (the 24 built 2026-09-18 plus Invoice, repaired the same
  day); 22 July pages are declared stale pending CRA-223.

### Fixed
- **Foundations sync writes all four modes** (CRA-220). `sync-foundations.figma.js`
  hard-coded Light and Dark, so Classic Light / Classic Dark values never
  reached Figma after their first build. Re-run 2026-09-18 against the current
  export; the token source is stamped.
- **Figma-side repairs recorded** (CRA-218): ToneBadge tint opacity (the
  bound-paint opacity rule, now in the build log), Kanban column fills, four
  stale pigment values, and the ❖ Invoice page brought to parity with its
  Storybook render.

## [0.9.45] — 2026-09-18

### Added
- **The last four pattern pages in Figma (session C: flows)** — ❖ Signup,
  ❖ Login — OAuth (provider marks inlined from the source; GitHub and Apple
  bound to foreground), ❖ Wizard, ❖ Onboarding. Every block now has a declared
  Figma status: 47 of 51 mirrored, 4 declined with reasons, 0 missing. The
  daily parity run checks all 47 pages are still in place.

## [0.9.44] — 2026-09-18

### Added
- **Ten more pattern pages in Figma (session B: app pages)** — ❖ Dashboard,
  ❖ Data table, ❖ List detail, ❖ Settings, ❖ Tabs page, ❖ Profile card,
  ❖ Notifications, ❖ Search results, ❖ Kanban, ❖ Chat — composed from the
  component twins and now `mirrored` in `figma/sync-state.json`. Coverage:
  43 of 51 blocks mirrored, 4 not built yet, 4 declined.
- **ToneBadge Figma twin** (`❖ Tone badge`, set 577:75): Tone × Size × Solid =
  24 fully token-bound variants matching `registry/lib/tone-badge.tsx`. Data
  table uses it, and the ❖ Invoice "Paid" chip (a plain Badge since July)
  was swapped in place. Listed as a parity-baseline candidate.

### Fixed
- The Figma build log's "Accent" heading, dropped by the 0.9.43 edit, is back.

## [0.9.43] — 2026-09-18

### Added
- **Ten pattern pages in Figma (session A: marketing and shells).** ❖ Hero,
  ❖ Navbar, ❖ Footer, ❖ Feature section, ❖ Testimonial, ❖ Pricing, ❖ Page
  header, ❖ Error 404, ❖ Empty state and ❖ Cookie consent, each composed from
  the component twins (Button, Badge, Separator, Breadcrumb instances) with
  container tokens bound. They are now `mirrored` in `figma/sync-state.json`,
  so the daily parity run checks they stay in place. Coverage: 33 of 51 blocks
  mirrored, 14 not built yet, 4 declined.

## [0.9.42] — 2026-09-18

### Added
- **Block-to-Figma coverage guard.** The block folder has 51 blocks; Figma held
  pattern pages for 23 of them, and nothing said so — the daily parity bot
  watches atoms, and the only record of the pattern pages was a build log.
  `figma/sync-state.json` now carries `patterns`: one entry per block,
  `mirrored` (❖ page + pattern frame ids), `missing` (24, not built yet) or
  `declined` (4, reason recorded). `scripts/figma-pattern-coverage.test.mjs`
  fails when a block has no entry or an entry has no reason; the daily
  `figma-parity` run fetches the mirrored pages at depth 1 and fails when a
  page is gone, renamed, or has lost its frame.

## [0.9.41] — 2026-09-16

### Changed
- **`@quill` is listed in shadcn's registry directory** (shadcn-ui/ui#11915,
  merged 2026-09-16), so `npx shadcn@latest add @quill/<item>` works with no
  `components.json` entry. README and the llms.txt quick start now lead with
  that and keep the URL pin as the fallback. The README's "list everything"
  line said `view @quill/registry`, which fails because the index is not an
  item; it now says `search @quill`, which lists all 58. (CRA-213)

## [0.9.40] — 2026-09-15

### Changed
- chore(figma-sync): adopt Figma twins into the parity baseline

## [0.9.39] — 2026-09-15

### Changed
- **Adopted parity entries no longer carry the keys the REST response could
  not fill.** A property with neither a binding nor a raw value (Separator's
  stroke, radius, padding and gap, for instance) warned "not verifiable" on
  every daily run without saying anything. `pruneSnapshot` drops such keys —
  and a null effect style — from every adopted entry, and the ten entries
  already in `figma/sync-state.json` are cleaned the same way once. The check
  skips absent keys, so nothing that could be verified is lost. (CRA-179)

## [0.9.38] — 2026-09-15

### Changed
- chore(figma-sync): adopt Figma twins into the parity baseline

## [0.9.37] — 2026-09-15

### Changed
- **Parity adoption matches code the way shadcn writes it, and covers the
  twins the first pass could not name.** The first adoption run brought one
  of fifteen Wave A components under the daily check; the other fourteen fell
  to three causes, all fixed here. A padding binding is now accepted in the
  `px-N` form code writes; derived classes may sit in more than one class
  string (cva keeps variant classes apart from the base — Badge's `bg-primary`
  lives in its `default` variant); a component with no binding that maps to a
  class is adopted for Figma-side detection, anchored on its first class
  string. `figma/sync-state.json` now names all 136 variables in the file
  (read from Figma; the 35 it already named all agreed), and the Button and
  Toggle candidates point at the component sets rebuilt after the August
  audit (`359:267`, `356:183`). A padding re-binding repairs the `px-` form
  in kind. (CRA-179)

## [0.9.36] — 2026-09-15

### Changed
- chore(figma-sync): adopt Figma twins into the parity baseline

## [0.9.35] — 2026-09-15

### Added
- **The Figma parity check can adopt the twins that already exist.**
  `figma/sync-state.json` now lists `candidates` — Wave A's 15 component sets,
  from `figma/components/README.md` — and the Figma parity workflow gains an
  `adopt` input that runs `figma-drift.mjs --adopt`: each candidate is read
  over the REST API (a variant set through its default variant), its bindings
  are translated to classes, and it enters the baseline only when one class
  string in its code file carries all of them. Candidates that disagree are
  listed in the run summary instead — that disagreement is real drift for a
  human to settle with `/figma-pull` or `/figma-push`, never adopted blind.
  Adoption PRs land on `auto/figma-adopt` and do not self-merge. Five unit
  tests cover variant choice, class derivation, the literal match, and both
  adoption outcomes. (CRA-179)

## [0.9.34] — 2026-09-15

### Added
- **Three page compositions, shipped as registry examples.**
  `@quill/example-app-page` (sidebar-nav shell → page-header → stat-cards →
  data-table), `@quill/example-marketing-page` (navbar → hero → feature-section
  → pricing → testimonial → footer) and `@quill/example-auth-page`
  (login-split-panel alone) install to `components/examples/` and pull their
  blocks in as dependencies. Their `docs` carry the composition order and the
  spacing, layout and composition rules from the token source — the same span
  DESIGN.md, llms.txt and the agent-rules file render — so "how do these fit
  together" now reaches an agent through shadcn's own examples channel.
  Described once in `src/usage/examples.mjs`; listed under "Examples" in
  llms.txt and the agent-rules file; rendered in Storybook under Examples.
  They ship as `registry:component` because shadcn's published schema has no
  `registry:example` type (the CLI keeps it internal). (CRA-205, spec W5; D4
  taken as the spec's own three pages)

### Changed
- **`sidebar-nav` is a real shell now.** It accepts `children`; the demo card
  grid stays the default, and when a page is passed in the top bar keeps to
  the trigger and the workspace name so the page owns its breadcrumb.
- **`testimonial`** caps at 520px instead of fixing that width, so it no
  longer overflows a phone inside a page.
- The site resolves `@/components/quill/*` to `registry/blocks/*` (tsconfig
  paths), so the examples compile here through the same imports an app uses.

## [0.9.33] — 2026-09-15

### Changed
- **Every story names its component, and every component carries its
  description.** `LoginVariants.stories.tsx` documented two blocks in one file,
  so the Storybook MCP manifest had no `component` to key its entry on; it is
  now `LoginSplitPanel` and `LoginMinimal`. The manifest takes a component's
  description from react-docgen — the JSDoc directly above its definition, not
  the story's docs parameters — so every documented component (the blocks, the
  two shipped components, and the site's primitives) now carries its usage
  summary as that one-line JSDoc, kept equal to `src/usage` by
  `component-descriptions.test.mjs`. llms.txt links the manifest. (CRA-212)

## [0.9.32] — 2026-09-15

### Changed
- chore(deps): Bump @storybook/addon-mcp from 0.7.0 to 10.6.0

## [0.9.31] — 2026-09-14

### Changed
- **Dead-file sweep.** `scripts/build-manifest.mjs` takes its in-use icon list
  from the same scanner `build:icons` uses (the inline `git grep` it carried had
  a branch that could never match) and is exposed as `npm run
  build:icon-manifest`; the manifest is regenerated with it. `figma/sync-icons.figma.js`
  names the modules that exist (`icons.core.mjs`, weight 400) and `figma/README.md`
  gains the re-run procedure it pointed at. The unused `@chromatic-com/storybook`
  addon, five create-next-app SVGs and the unreferenced `quill-logo.svg` are
  removed. `icon.tsx` drops an unused catch binding, so lint is warning-free for
  it. The Figma-parity fixture story stays published, with a comment saying
  why and how to hide it. (CRA-211)

## [0.9.30] — 2026-09-14

### Changed
- **Two blocks now render their status through ToneBadge.** `invoice` marks
  "Paid" on the moss tint and `data-table` maps Active → moss and Invited → gold
  through one `STATUS_TONE` table, so the shipped `tone-badge` finally has
  in-repo consumers: a copyable single-status example and a copyable
  status-column mapping, both rendered in Storybook and covered by the
  accessibility run. The two items declare `@quill/tone-badge` as a registry
  dependency in place of `badge` (ToneBadge brings Badge in itself), and their
  usage docs name the tones they use. (CRA-210)

## [0.9.29] — 2026-09-14

### Fixed
- **The Dependabot unstick run fired by a push to `main` could never act.** A push
  is exactly the moment GitHub is still recomputing every open PR's
  mergeability, so the first listing reported UNKNOWN for all of them and the
  run left them alone — seen on its first live run, minutes after the previous
  release landed. `scripts/dependabot-unstick.mjs` now re-lists while any state
  is UNKNOWN, up to eight times fifteen seconds apart, and leaves whatever is
  still undetermined to the six-hourly run. Three tests cover the poll, its
  budget, and the no-poll case.

## [0.9.28] — 2026-09-14

### Fixed
- **Dependabot pull requests no longer strand after the regenerate step.** Once
  `dependabot-regenerate.yml` pushes rebuilt files onto a dependency PR,
  Dependabot stops rebasing that branch. Every release then moves `main`, the
  PR turns BEHIND (protection requires up-to-date branches) or DIRTY, GitHub
  runs no `pull_request` workflow on a conflicting PR, and auto-merge waits
  forever — #135 sat that way for days and its recreation #162 was conflicting
  again within hours. New `dependabot-unstick.yml` runs after every push to
  `main` and six-hourly: for each open Dependabot PR that is BEHIND or DIRTY,
  settled for ten minutes and not already asked since its last commit, it
  comments `@dependabot recreate` with `AUTOMATION_TOKEN` (Dependabot honours
  commands only from a user with write access). Comments only; the decision
  logic is pure and tested. (CRA-207)

## [0.9.27] — 2026-09-14

### Fixed
- **Published usage pages no longer print `&lt;`.** The Storybook escaper,
  which must turn `<button>` into `&lt;button>` so MDX does not swallow it, was
  reused for `public/usage/*.md`, so 26 of 106 pages read "Native &lt;button>
  semantics" to every agent that fetched them. The renderer now takes a
  target: `mdx` keeps the entity, `markdown` wraps tag-like text in backticks.
  A test fails if an entity ever reaches a published page again.

### Changed
- **The four shadcn-studio commands ship with the repo.**
  `.claude/commands/{cui,rui,iui,ftc}.md` were gitignored, so `AGENTS.md`
  documented commands that existed on one machine only. They are committed,
  and `AGENTS.md` now says what they need: the shadcn-studio MCP server in your
  own Claude Code settings, and a licence for the `@ss-*` registries in
  `components.json`.
- **Pattern-scan decisions are recorded.** `scripts/pattern-scan.decided.json`
  had been empty since July, so the weekly report re-raised the same six
  candidates every Monday. All six (`shell`, `queue`, `crew`, `link`, `logo`,
  `brand`) are declined with a reason and move to the report's "Already
  decided" section. The "already in Quill but rebuilt" findings are a
  findability problem, which the agent-rules file (0.9.24) now addresses inside
  each app.

## [0.9.26] — 2026-09-14

### Added
- **MIT license.** The repo had no LICENSE file, which made it "all rights
  reserved" by default even though the registry model copies code into every
  consuming app. `LICENSE` (MIT, Ryan Phillips / Craftwell), `"license": "MIT"`
  in `package.json`, a line in the README, and a License entry in llms.txt's
  Links so agents can see the terms. Required for listing in the shadcn
  registry directory, which only accepts open-source registries.

## [0.9.25] — 2026-09-14

### Changed
- **The registry is named `quill`, matching its `@quill` namespace.** shadcn
  derives a listed registry's namespace from `registry.json`'s `name` and its
  health check scores a "matching registry name", so `quill-ds` (the repo's
  name) would have listed as `@quill-ds` and failed that check. Both consumer
  apps already install from `@quill`. llms.txt's title no longer depends on the
  slug. Groundwork for listing Quill in the shadcn registry directory.

## [0.9.24] — 2026-09-14

### Added
- **`@quill/agent-rules` — Claude Code rules for the app, installed by the CLI**
  (spec item W10). `npx shadcn@latest add @quill/agent-rules` writes
  `.claude/rules/quill.md` at the project root, where Claude Code loads it in
  every session: the theming contract, the foundations and principles, the
  icon core names, a block index grouped by intent, the primitives that have
  Quill-specific rules, and the update and verify commands. The shadcn MCP
  strips `docs` and `meta` before an agent sees an item, so until now nothing
  inside an app told its agent Quill's rules or even which blocks exist — the
  weekly pattern scan kept finding shipped blocks rebuilt by hand. Generated by
  `scripts/build-agent-rules.mjs` from the same sources as llms.txt and the
  base item's install docs; nothing is written twice, and there is no version
  stamp, so the file changes only when its content does. Verified with the
  real CLI in a scratch app.
- **The release bot refreshes it.** `library-sync` now treats a `~/` target as
  the project root (never relocated under `src/`), so an app that carries the
  rules file gets it rewritten on every release that changes it (spec F17).
  Consumer apps have to install it once; the downstream `qa-review` write
  surface in command-center needs `.claude/rules/quill.md` added before its
  sync PRs will pass.

### Changed
- llms.txt's quick start gains the rules-file step, and `## Links` the item.
- `npm run build:agent-rules` runs before `build:registry` in every chain
  (package.json, AGENTS.md, CI, self-heal, dependabot-regenerate);
  `registry/agent-rules/` joins the generated-files gate.

## [0.9.23] — 2026-09-14

### Added
- **llms.txt now carries Foundations, Principles and an Agent quick start**
  (spec items W7, W8, W9). An agent reading Quill from outside got the
  mechanics — themes, tokens, blocks — and none of the point of view; the
  2026-09-09 cold-read test had it guess six of twelve design decisions and
  build the hero-metric-row dashboard the system exists to avoid. The new
  sections give it type, spacing, layout, radii, elevation and motion; the
  three named principles (paper first, one italic word, a gentle settle) with
  the rules underneath them; the do/don't list and the anti-references; and a
  six-step quick start that ends with the update rule (`--overwrite`, never
  `--yes`) and the verification commands.
- **Those sections are rendered from the token source, not typed.**
  `src/usage/foundations.mjs` is the one renderer, and it now also fills the
  generated spans in `DESIGN.md` (§4 Typography, §5 Spacing & layout, §6 radii /
  elevation / motion, §11 principles) on `npm run build:llms`, so the human doc
  and the agent doc cannot disagree. The hand-written prose it replaces named
  `--text-md`, `--container`, `--gutter*`, `--radius-pill` and a whole
  `--leading-*` / `--tracking-*` scale that never shipped, and said hover and
  accent italics were terracotta when the accent axis owns them. Only rules
  that transfer to an app built with Quill are included; Quill's own product
  identity stays in PRODUCT.md.
- **A token-truth test** (`scripts/token-truth.test.mjs`, spec W17): every
  `--token` named in the usage modules, the foundations, the principles and
  llms.txt must be a custom property the built theme item actually delivers.
- **llms.txt is discoverable**: `public/robots.txt` points at it, the page head
  carries `<link rel="alternate" type="text/plain" href="/llms.txt">`, and the
  homepage footer links it. The spec's optional root content negotiation
  (serving the registry index at `/` to the shadcn user agent) is deliberately
  not done: it costs CDN cache fragmentation on the homepage for a convenience
  the documented `@quill/<name>` and `/r/<name>.json` paths already cover.

### Changed
- `DESIGN.md` joins the generated-files gate in CI, self-heal and
  dependabot-regenerate (only the marked spans are rewritten; the prose around
  them stays hand-written).

## [0.9.22] — 2026-09-14

### Changed
- chore(deps): Bump the react group with 4 updates

## [0.9.21] — 2026-09-14

### Fixed
- **The sync now refreshes the token layer in apps that hold it merged into
  their main stylesheet.** `library-sync` rewrote only the shipped
  `app/quill-theme.css`. An app installed with `npx shadcn add @quill/quill`
  also carries the `cssVars`/`css` layer merged into its `globals.css`, and that
  copy — which wins the cascade — went stale on every release. The sync now
  detects that shape from the app's `components.json` and stylesheet (at least
  half of the item's `cssVars.light` properties declared there; never assumed)
  and, when the theme file changed, runs the real CLI against the released
  `public/r/quill.json` with `--overwrite`, which upserts every value in place
  (a tampered stylesheet comes back byte-identical). Neither current app holds
  the merged layer, so their syncs are unchanged; a dry run against the real
  fleet confirmed it.
- **The "apps are falling behind" alarm can fire now.** It read `app.full_name`,
  a key the app discovery never sets, so every run since 0.9.10 asked GitHub for
  `/repos/undefined/pulls`, logged "could not read sync history" for each app,
  and stayed silent. It reads `app.full`; the fetcher is injectable and a test
  pins the URL. The first dry run with the fix reported command-center two
  releases behind — its sync PRs were superseded by the next release before
  that app's checks could finish.

## [0.9.20] — 2026-09-14

### Fixed
- **A CLI install could not switch theme or accent: the registry `css` blocks
  shipped keys without `--`.** shadcn's CLI prepends `--` to `cssVars` keys but
  writes `css` keys verbatim, and `scripts/build-tokens.mjs` reused the same
  stripped-key helper for both. In an app installed with
  `npx shadcn add @quill/quill`, every declaration inside the four `[data-theme]`
  and four `[data-accent]` blocks landed as `paper: var(--dk-paper);` — invalid
  CSS that browsers drop — so `data-theme` and `data-accent` did nothing through
  the merged stylesheet; only the still-shipped `app/quill-theme.css` file made
  them work, and only when the app imported it. The blocks now carry proper `--`
  keys. Verified with the real CLI in a scratch app, including that re-running
  with `--overwrite` upserts every value in place and leaves the stylesheet
  byte-identical. A new test pins the two key shapes. Neither existing app was
  affected: both predate the `cssVars` delivery and import the file.

## [0.9.19] — 2026-09-14

### Added
- **The `icon` item now ships install-time docs, a usage page and the list of
  names it actually contains** (spec item W3). It was the only registry item
  with no `docs` and no usage module, so an agent installing `@quill/icon` had
  no guidance and no way to know which names exist — and the consumer `<Icon>`
  draws an unknown name as a blank box. `src/usage/icon.usage.mjs` derives the
  core-set list from `icons.core.mjs` (never hand-typed), so
  `public/usage/icon.md`, the item's `docs` and llms.txt always name exactly
  what ships; `src/stories/icon.stories.tsx` adds the story the usage system
  requires plus a gallery of the core set.
- **Every registry item must carry install-time docs.** `scripts/registry-meta.test.mjs`
  now fails on any item without a substantive `docs` field (the W14 half that
  would have caught the undocumented `icon` item).

## [0.9.18] — 2026-09-14

### Fixed
- **`DESIGN.md` described a component library that does not exist.** §7 cited
  `components/forms/Button.jsx` and four more `.jsx` files, a `window.QuillDesignSystem_…`
  bundle, and props (`withArrow`, `accent`, `label`/`invalid`/`multiline`,
  `initials`, `interactive`) that the stock shadcn primitives never had; §4 named
  `tokens/fonts.css`; §6 said hover turns terracotta and focus is a 2px ink
  outline, which `button.tsx` and `input.tsx` contradict; §3 listed four themes.
  `AGENTS.md` sends every agent to this file before a visual change, and no test
  read it. §7 now documents the real Button, Input, Avatar and Card APIs at their
  paths, Eyebrow as the recipe it is, States and Cards match the shipped
  classes, Activation names Intelligent (with `--int-*` alongside `--dk-*` /
  `--cl-*` / `--cd-*`), the fonts line points at the theme's `@import`, and the
  "related files" block points at the token source, the shipped theme, the
  registry and the usage pages instead of five files that were never here.
  Spec item W13; this was the precondition for W5, W7 and W10.

### Added
- **A path guard for the agent-facing docs.** `scripts/repo-invariants.test.mjs`
  now fails when `DESIGN.md`, `PRODUCT.md` or `AGENTS.md` names a path (in
  backticks) that neither exists in the repo nor is a registry install target —
  the same hand-maintained-list failure that `theme-enumeration` and
  `consumer-reachability` guard elsewhere.

## [0.9.17] — 2026-09-14

### Fixed
- **`file-upload` rendered a blank where its pending-file icon should be, in
  every consumer app.** The core icon set that ships with the `icon` item was
  derived from `name="literal"` props only, so the block's
  `name={done ? 'check' : 'draft'}` never registered `draft`, and the consumer
  `<Icon>` draws an unknown name as an empty, size-reserved box. The site never
  noticed because it lazy-loads the whole library. The scanner
  (`scripts/build-icons.mjs`) now sees every quoted name inside a `name={…}`
  expression, `draft` is in `icons.core.mjs` and `public/r/icon.json`, and a new
  test fails whenever a shipped file references an icon the core set lacks.

### Added
- **The consumer `<Icon>` warns once per unknown name in development**
  (`registry/lib/icon.tsx`, spec decision D5). Production still renders the
  size-reserved blank; developers now see
  `[quill] <Icon name="…"> is not in the bundled core set` in the console
  instead of hunting for a missing glyph.

## [0.9.16] — 2026-09-14

### Fixed
- **The changelog header told contributors to tag releases by hand.** It said to
  `git tag vX.Y.Z && git push --tags` and publish a GitHub release after merge,
  which `AGENTS.md` forbids: the release bot tags and publishes within a minute of
  a merge, skips a version whose tag already exists, and `library-sync` only fires
  on a *published release*. An agent following the header would either race the
  bot or leave a tag with no release and no downstream sync. The header now
  describes the bot-owned routine (bump, entry, `build:llms`, nothing else).
- **The documented regenerate order built the registry before the icons.**
  `AGENTS.md` and the `prebuild-storybook` script ran `build:registry` before
  `build:icons`, while CI and self-heal run icons first. The `icon` registry item
  inlines `icons.core.mjs`, so the documented order shipped a stale
  `public/r/icon.json` after any icon-set change and cost a red CI run. Both now
  use the CI order: tokens → icons → usage → registry → llms.

## [0.9.15] — 2026-09-13

### Added
- **The base `quill` item now ships install-time docs** (W2 of the agent-readability
  spec). This is the one item every consuming app installs and the only moment the
  shadcn CLI prints guidance — and it shipped with no `docs` field at all. Apps
  received the token layer with nothing said about the five `data-theme` values, the
  four `data-accent` values and which is default, the chart-token rule, the fonts
  already being `@import`ed, or where `llms.txt` is.
  Generated from `src/tokens/themes.mjs` and the token source by
  `src/usage/theme-docs.mjs`, never hand-written: DESIGN.md's own Activation section
  had drifted a whole theme out of date, which is the failure this avoids.
  **It also states the update rule.** `--yes` does not overwrite a changed file —
  only `--overwrite` does; `--yes` prompts in a terminal and silently skips when
  non-interactive. A consumer app's CLAUDE.md has been telling agents to update
  Quill with `--yes`, so those updates have been no-ops that reported nothing.
- **Every block publishes its intent through `categories`** (W4), shadcn's own
  schema-level field, alongside the existing `meta.intent`. The shadcn MCP strips
  `meta` before search, so `meta.intent` alone never reaches an agent browsing the
  registry. `meta.intent` stays the source; a test guards the copy from drifting.

### Notes
- **W1 was considered and skipped.** The spec has `description` become
  `summary + " Use when: " + useWhen[0]`. Measured against the real data, the two
  fields are near-paraphrases for most items ("The standard email-and-password
  sign-in card…" vs "You need the standard email-and-password sign-in…"), so
  appending would roughly double every description — printed on every MCP `list`
  call — for almost no added signal. The existing descriptions already discriminate
  between siblings. Worth revisiting only as a hand-picked subset where `use_when`
  states a criterion the description does not.

## [0.9.14] — 2026-09-13

### Changed
- **"Sepia" retired; "ink-toned" is the word.** The token is `--ink` and §2 groups
  them as Inks, so "sepia" was only a qualifier meaning *warm brown-black, not
  neutral black*. Six references are gone — the colour table now says "warm
  near-black", and the Storybook Colors, Elevation and Brand pages describe ink
  rather than a sepia formula.
- **`ink-toned type` is now consistent across all six surfaces.** The base registry
  item's description said "ink-toned text" while DESIGN.md, PRODUCT.md, README, the
  site metadata and the homepage all said "type" — and the registry description is
  the one consumer apps and their agents actually read. It ships, so `public/r/*`
  and `llms.txt` are regenerated.

### Removed
- **The rest of the tier ladder.** 0.9.13 deleted the §2 table but missed three
  more: the §3 Dusk tier-tints table, and the `Badge` and `ProductCard` component
  entries that carried `tier="heirloom"`. Both of those entries documented files
  that do not exist (`components/display/Badge.jsx`,
  `components/surfaces/ProductCard.jsx`) and `ToneBadge` — the component that does
  ship — sits directly below with the correct `tone` vocabulary. Two of the seven
  stale `.jsx` paths in §7 go with them.
- **Six numero glyphs in `scripts/figma-drift.test.mjs`** fixture strings, missed
  because earlier sweeps covered `src/` and `registry/` but never `scripts/`.

## [0.9.13] — 2026-09-12

### Changed
- **Retired the artisanal brand voice for the editorial one.** The brand moved
  from maker to curator — an exclusive, premium and trusted product agency
  rather than a letterpress shop. DESIGN.md led the change; PRODUCT.md, README,
  the site metadata, the homepage copy and `registry.json`'s description still
  carried handcrafted / parchment / botanical / sepia / drawn-by-hand, and
  PRODUCT.md cited DESIGN.md for a line that had been deleted. The base item's
  description ships to consumers, so `public/r/quill.json` and `llms.txt` are
  regenerated with it.
- **Documented what the pigments have always done.** The colour table said
  terracotta was "the signature" and later "optional tier" while
  `quill.tokens.mjs` had moss as the default accent and terracotta as
  `danger`/`destructive` all along. Moss is now named as the signature and
  terracotta as danger/destructive, with both diverging chart poles noted.
- **Deleted the tier ladder** (Everyday/Featured/Signed/Heirloom). No tokens
  backed it, `ToneBadge` takes `tone` rather than `tier`, and a commerce
  taxonomy is product content — the design system is product-agnostic.
- **§9 imagery rewritten.** It named three portrait assets that do not exist
  and banned photography; both are gone, replaced by the illustration sourcing
  rule. The "never photographic" and stock-photo bans are lifted.

### Removed
- **Product and personal identifiers from the docs.** A retired product's name,
  the owner's name, and another app's name appeared across eight spec files,
  this changelog, and `scripts/DRIFT-AUDIT.md`. Decision attributions keep every
  date and decision and now read "the owner"; a candidates table's per-app
  columns became App A / App B, matching the generic placeholders
  `pattern-scan.mjs` already documents. One more repo slug was removed from
  five comments and spec lines describing the origination gate — the gate keys
  off the presence of `app/quill-theme.css`, never a name, so nothing changed
  behaviourally. The sync target in `library-sync.test.mjs` stays, as do the
  consumer apps named as verification evidence in the agent-readability spec,
  where the names *are* the finding rather than a for-instance.

## [0.9.12] — 2026-09-11

### Changed
- **Recorded the Figma theme-mode decision** in `figma/README.md`. The DTCG export
  is generated from `MODES` and now carries five modes; a Figma variable collection
  on the Professional plan holds four. Figma mirrors the four editorial themes and
  Intelligent stays code-only — it was built from an approved Mission Control comp
  rather than designed in the library, and has never depended on a Figma mode.
  Written down so the next person treats it as a deliberate line rather than drift,
  and so the foundations sync skips the fifth mode instead of failing on it.

## [0.9.11] — 2026-09-11

### Added
- **Dependency bumps that move generated output now heal themselves.** Some
  dependencies are *inputs* to the generators — `@material-symbols/svg-400` is
  the icon library, so bumping it changes `icons.core.mjs` and the `IconName`
  union. Dependabot only edits `package.json` and the lockfile, so the
  "Generated files in sync" gate reported drift, correctly refused to merge, and
  the PR sat red permanently. PR #135 has been stuck that way since 2026-09-09,
  and every future icon bump would have been too.

  Nothing else could reach it: `dependabot-auto-merge` only flips the switch,
  `self-heal.yml` regenerates on `main` only, and `claude-repair.yml` triggers on
  `main` too (and is disabled). Three tiers of automation, none applicable.

  `.github/workflows/dependabot-regenerate.yml` rebuilds on the dependabot branch
  and pushes — **but only when the resulting diff is confined to the generated
  paths**. Anything outside them means the bump changed real behaviour, and it
  says so and stops rather than committing over a genuine failure.

### Fixed
- **`registry.json` was missing from the generated-files gate.** v0.9.8 made
  `build-tokens.mjs` write the `cssVars`/`css` payload onto it, which quietly made
  a committed file generated without the gate knowing. Drift would only have been
  caught indirectly, via the `public/r` output built from it. Added to the path
  list in both `ci.yml` and `self-heal.yml`.

## [0.9.10] — 2026-09-11

### Added
- **library-sync now shouts when an app falls behind.** Delivering a release is
  not the same as an app taking it, and until now the only record of the
  difference was a pull request in someone else's repository. `tech-careers` was
  delivered six consecutive releases and merged none of them; every run reported
  "auto-merge armed", every PR was closed by the next release as superseded, and
  nobody looked for seventeen days.

  `staleness()` reads an app's own `quill-sync/*` pull requests — no state file
  and no commit-back, because that history *is* the record — and reports the last
  version it actually merged plus how many releases since were delivered and not
  taken. Two consecutive misses raises a `> [!WARNING]` block in the run summary
  naming the app, the last version it took, and every version it skipped.

  One miss stays quiet: the PR may still be in flight. The run is never failed
  for it either — a red check in an app is the safety net working, and failing
  the release for that is the recurring false alarm `scripts/DRIFT-AUDIT.md`
  exists to prevent.

  Replayed against tech-careers' real pull-request history, it would have fired
  at **v0.9.1** on 2026-09-09 — the second miss — and stays correctly silent at
  the first, and today.

## [0.9.9] — 2026-09-11

### Added
- **A guard against half-propagated theme changes.** `scripts/theme-enumeration.test.mjs`
  asserts that every hand-typed theme or accent list agrees with the token
  source. The Intelligent theme shipped on 2026-08-26 and was still missing from
  five such lists sixteen days later — everything *generated* from `MODES` had it
  from day one, only the typed copies lagged, and nothing failed.

  Three checks, each verified by deliberately breaking it:
  - the four remaining lists (`quillThemes`, `quillAccents`, `THEME_OPTIONS`,
    `ACCENT_OPTIONS`) must match `ALL_MODES` / `tokens.accents` exactly. These
    four cannot be derived — each entry carries an icon name, a swatch class or
    an inlined SVG path the token source does not own.
  - no default theme or accent may be restated as a literal in the Storybook
    preview config. That is how every story previewed on terracotta for months
    after the shipped default became moss.
  - **an unregistered list naming 2+ members of a known set must name them all.**
    A guard that only checks the sites someone remembered to register would miss
    the next one, so this sweeps `src/`, `registry/` and `.storybook/` for any
    partial enumeration.

## [0.9.8] — 2026-09-11

### Fixed
- **The token layer now actually reaches consumer apps.** The `quill` registry
  item carries `cssVars.theme` (79 entries), `cssVars.light` (292) and `css`
  (the five `[data-theme]` and four `[data-accent]` blocks), so the shadcn CLI
  merges them into the app's *main* stylesheet. Until now the site's
  `@theme inline` block was never shipped at all: 17 Quill-only pigments,
  `font-heading` (used in 10 blocks) and `text-2xs` compiled to nothing
  downstream, so `ToneBadge` — one of only two components Quill ships — rendered
  unstyled in every consumer app.

  Spec item **W19**, decision **D8**. The obvious cheaper fix does not work and
  was ruled out by experiment first: a Tailwind v4 `@theme` block only produces
  utilities when it sits in the same stylesheet as `@import "tailwindcss"`, and
  the theme file is imported separately from the consumer's `layout.tsx`. Adding
  `@theme` to `registry/themes/quill.css` leaves it inert. `cssVars` does not
  have that problem because the CLI merges it into the main stylesheet.

  `cssVars` offers only three buckets (`theme`/`light`/`dark`) and Quill has five
  themes and four accents, so the mode and accent blocks ride in `css`, which
  takes arbitrary selectors. All nine survive intact.

  Verified end-to-end, not inferred: the generated item was installed into a
  scaffolded Next 16 + Tailwind v4 app with the real `shadcn add`, and every
  previously-dead utility compiles — `font-heading` → `Fraunces, Georgia, serif`,
  `text-2xs` → `.7rem`, `bg-moss/20` → `color-mix(in oklab, var(--moss) 20%,
  transparent)`. `consumer-reachability.test.mjs`'s known-gap list went from 20
  entries to **empty**, which is the machine-checkable version of the same claim.

  The item still ships `app/quill-theme.css` as well, so apps that already have
  that file keep receiving updates through `library-sync`. Retiring the file, and
  the hand-written token mirror in `craftwell-command-center`, is follow-up work.

## [0.9.7] — 2026-09-11

### Added
- **A guard for the gap between what Quill renders and what Quill ships.**
  `scripts/consumer-reachability.test.mjs` enumerates every Tailwind utility used
  in `registry/**` and asserts each one resolves from what a consumer actually
  receives — the built `public/r/quill.json`, Tailwind v4's own theme, and the
  variables `shadcn init` writes. It deliberately never reads
  `src/app/globals.css`: reading the site's stylesheet is precisely the mistake
  that let the ToneBadge fix be declared done while reaching no consumer.

  It reads the **built registry item** rather than `registry/themes/quill.css`
  so that it survives the cssVars/css migration untouched — and so turning its
  known-gap list empty becomes the proof that migration worked.

  20 utilities are unreachable today and are recorded in a `KNOWN_UNREACHABLE`
  list that may only shrink: the 17 Quill-only pigments, `font-heading` (used in
  10 blocks) and `text-2xs`. Both directions were verified by deliberately
  breaking them — injecting a bogus utility fails the first test naming the file,
  and simulating a fixed token fails the staleness test until the entry is
  deleted. A stale entry cannot silently stop guarding.

## [0.9.6] — 2026-09-11

### Added
- **The Intelligent theme is now selectable in both theme pickers.** It shipped
  in v0.8.25 but neither picker knew about it, so no user could reach it without
  hand-writing `data-theme="intelligent"` — `registry/blocks/theme-selector.tsx`
  (the block consumers install) and the homepage's own `THEME_OPTIONS`. Both now
  offer all five. Icon is `star_shine`, Material's sparkle — the glyph older
  releases called `auto_awesome` — chosen as the AI cue for the cockpit theme.
  Verified in a browser in both pickers.

  No new icon plumbing was needed: `coreNames()` in `scripts/build-icons.mjs`
  derives the sync core map by grepping `icon: '…'` across `src` **and**
  `registry`, so adding it to a block pulled it into the map consumers receive
  (89 → 90 icons). The homepage keeps hand-inlined weight-500 paths, so its
  sparkle was taken at the same weight rather than the 400 the repo installs —
  a 400-weight glyph would have sat visibly lighter beside its four neighbours.

### Fixed
- `theme-selector`'s usage doc described "the four Quill themes" in its summary
  and `use_when`. That summary is also the registry item's `description` and its
  llms.txt entry, so the miscount reached consumers and agents both.

## [0.9.5] — 2026-09-11

### Fixed
- **Storybook could not show the Intelligent theme, and the catalog previewed
  every story on the wrong accent.** `.storybook/preview.tsx` kept three separate
  hand-typed copies of the theme set — the canvas-ground map, the toolbar items,
  and the `ThemeProvider` list — and all three stopped at four when the fifth
  theme shipped in v0.8.25. So it could not be selected, and would have rendered
  on Dawn cream if it had been. Separately, the accent default still read
  `terracotta` after the shipped default became `moss` at v0.2.6, so the entire
  catalog had been previewing a variant rather than the default for months.
  All four lists now derive from the token source. Verified in a browser: the
  toolbar offers five themes and a story renders on the cockpit ground.
- **The stats band failed WCAG on its headline numbers, in every consumer app.**
  `registry/blocks/stats-band.tsx` colored them with `--accent-pigment`, the
  *decorative* cut. On a Dawn card that is 2.9:1 for moss — the default accent —
  and 2.1:1 for gold, against a 3:1 large-text minimum. It passed review only
  because Storybook was previewing terracotta, the one accent that squeaks by at
  3.07:1. Now uses `--accent-pigment-text`, the same cut `--link` and `--ring`
  already take, which clears 5.97:1 on moss. The usage guidance said to use the
  decorative cut too; corrected, with the reason recorded.

### Changed
- Theme and accent metadata moved from `scripts/build-tokens.mjs` to
  `src/tokens/themes.mjs`, and `MODES.label` is now the short human name with
  prose composing its own qualifiers. `build-tokens.mjs` imports `node:fs`, so it
  could never be read by a browser — which is precisely why five hand-typed
  copies of the theme list grew up around it. The new module is pure data and is
  imported directly by Storybook; `build-tokens.mjs` re-exports it, so every
  existing caller is unchanged.

## [0.9.4] — 2026-09-11

### Fixed
- **`llms.txt` published `intelligent → undefined` for sixteen days.** The
  Intelligent theme shipped in v0.8.25 and `MODES` gained it, but `THEME_NAMES`
  in `build-llms.mjs` was a hand-typed object with four keys sitting beside the
  generator — so the fifth theme interpolated as the literal string `undefined`
  into the file every coding agent reads to learn how to theme Quill. The same
  line also still described a "four-theme" token layer. Theme display names now
  live on `MODES` itself as `label`, and both the theme list and the spelled-out
  counts are derived rather than restated. Three guards added, each confirmed to
  fail against the pre-fix output: every mode must carry a non-empty label,
  `llms.txt` must contain no `undefined` and must name every mode, and the prose
  count must match the real number of themes.
- **The theme file told consumers the wrong install URL.** `registry/themes/quill.css`
  line 2 — the copy-paste command at the top of the file every consumer installs —
  still named `quill-ds.vercel.app` after the move to `www.quilldesignsystem.com`.
  The header sits above the `@quill-tokens` markers, so no generator was ever
  going to correct it. Fixed, and pinned to `registry.json`'s `homepage` by a test.

### Changed
- **README replaced.** It was untouched `create-next-app` boilerplate — it told
  readers to edit `app/page.tsx` (the file is at `src/app/page.tsx`) and described
  the Geist font (Quill uses Fraunces and Raleway). Now documents what Quill is,
  how to install it from the registry, the five themes and four accents, the
  generated layer and its build commands, and the repo's conventions. Every URL
  in it was checked live.

### Removed
- `src/components/ui/direction.tsx` — a six-line re-export of Base UI's
  `DirectionProvider` with no importer, no story, no usage file, and no registry
  entry. Stock shadcn scaffolding that was never used; the only orphaned file in
  the repo.
- `~/.claude/commands/quill-setup.md` and `quill-app.md` (outside this repo,
  archived to `~/.claude/commands-archive/`) — retired per decision D3 in
  `docs/superpowers/specs/2026-09-08-agent-readability-design.md`. Both loaded
  Inter as the body font where the theme ships Raleway, and both pointed at the
  retired `quill-ds.vercel.app` registry domain, so any new app scaffolded with
  them started miswired. `/web-app-setup` is the current path.

## [0.9.3] — 2026-09-09

### Fixed
- **The force-with-lease fix in 0.9.1 was incomplete.** Fetching the sync branch
  into a tracking ref is not enough: the bare `--force-with-lease` still rejects
  with **"stale info"**, because it wants a reflog it considers authoritative and
  a shallow explicit-refspec fetch does not give it one. Verified against a real
  clone of an app — the tracking ref was present, the reflog had an entry, and
  the push was still refused. The lease is now taken against the exact object
  fetched (`--force-with-lease=<branch>:<oid>`), which is deterministic and does
  not depend on reflog interpretation. The same clone accepts that push. The
  bare form is kept for the case where the branch is new upstream, where it is
  correct.
- **The per-app summary truncated the error to its first line**, which threw away
  the stderr `run()` had just been taught to capture. That is why a "stale info"
  rejection was reported as a bare "Command failed: git … push" with no reason
  attached, and why 0.9.1 looked like it had worked. The whole message is now
  reported, newlines collapsed, capped at 400 characters.

## [0.9.2] — 2026-09-09

### Fixed
- **An app the sync cannot merge is no longer treated as a failed sync.** Two of
  the four Quill-styled apps require no checks at all. That gives GitHub nothing
  to wait for, so `gh pr merge --auto` is refused, and the poll it falls back to
  cannot read `CheckRun` results because **fine-grained PATs can no longer be
  granted `Checks: read`** — verified 2026-09-09 against the live permission
  picker, which offers no such permission and jumps from "Attestations" straight
  to "Code quality". Neither route being open was fatal, so every release turned
  red for those two apps forever. The update is still written, pushed and
  proposed; only the merge waits for a human, which is exactly what the script's
  own contract already says about a red check: "reported, never fatal". Those
  apps now report `PR open — no auto-merge available and check status
  unreadable, left for review` and are counted in a separate
  "delivered but waiting on a human" line rather than failing the run.

### Notes
- The real fix for an affected app is to make one of its existing checks
  required; that restores `--auto` and the sync completes unattended. Applied to
  `tech-careers` (branch protection) and `craftwell-command-center` (ruleset) by
  enabling auto-merge — both now report "auto-merge armed". `god-sent` and
  `commanddeck` require nothing and are deliberately left as review-only.

## [0.9.1] — 2026-09-09

### Fixed
- **The library sync could not push to an app whose sync branch already existed.**
  `--force-with-lease` needs a remote-tracking ref to lease against, and the app
  is cloned `--depth 1` of its default branch only — so on a re-run, or when a
  previous release left its PR open, there is no
  `refs/remotes/origin/quill-sync/vX.Y.Z` and git rejects the push with
  **"stale info"** without comparing anything. Reproduced directly: the same push
  is rejected before a fetch and succeeds after one. The branch is now fetched
  into a tracking ref first, with the failure path covering the ordinary case
  where the branch is new upstream. (Same defect class the 2026-09-09 audit found
  in `self-heal.yml` and `figma-parity.yml`, which check out without
  `fetch-depth` and then force-push.)
- **`run()` dropped the reason a command failed.** `execFileSync`'s error message
  is only the command line; the cause lives in stderr, which was discarded. A
  push rejected for "stale info" and one rejected for "permission denied" read
  identically in the per-app summary — that ambiguity cost a debugging cycle
  today. stderr is now attached to the thrown error, first four lines.

## [0.9.0] — 2026-09-09

Minor, not patch: this changes the colour of every chart in every consuming app.
Per the routine above, a breaking token change bumps minor while pre-1.0.

### Fixed
- **The categorical chart palette called itself colourblind-safe and was not.**
  `quill.tokens.mjs` stated the UI pigments were rejected for series duty partly
  because "terracotta↔moss adjacency fails deuteranopia separation (ΔE 3.2 on
  Dawn; target ≥8)", and that the replacement cuts were "validated against all
  six palette checks per theme". Simulating protanopia, deuteranopia and
  tritanopia across all 5 themes × 10 pairs says otherwise:

  | Theme | Deficiency | Pair | ΔE2000 |
  |---|---|---|---|
  | classic-dark | protanopia | 3 ↔ 5 | **0.34** |
  | classic-light | protanopia | 3 ↔ 5 | **0.88** |
  | classic-light | deuteranopia | 1 ↔ 5 | **0.98** |
  | classic-dark | deuteranopia | 1 ↔ 5 | **2.00** |
  | Dawn | protanopia | 3 ↔ 5 | 3.93 |
  | Dawn | deuteranopia | 1 ↔ 5 | 4.78 |

  Two things follow. The documented fix never reached its own target — it moved
  terracotta↔moss from 3.2 to 4.78, not to 8. And it introduced a worse gold↔moss
  collision, invisible in a 2-series chart and certain in a 5-series one.

  **Cause.** Three of the five hues — terracotta 35°, gold 84°, moss 128° — sit in
  the red-yellow-green arc, which is exactly the arc red-green deficiency
  collapses. The cuts held all five at roughly ONE lightness (Dawn: 0.606 / 0.605 /
  0.584 for series 1/3/5) and separated them by hue alone. Beautiful for normal
  vision; identical for roughly 8% of men.

  **Fix.** The series are now a lightness ramp as well as a hue wheel, because
  under dichromacy hue collapses and lightness is what survives. Worst pair across
  all 5 themes × 3 deficiencies × 10 pairs is now **ΔE 8.53**, against the target
  of 8. Constraints held throughout:
  - **hues unchanged** — max drift 0.4°, so the brand identity is untouched
  - **chroma never raised** above each cut's previous value, so nothing gets louder
  - **contrast ≥ 3:1** on page, card and well in every theme (worst 3.05)
  - **normal-vision separation improves** in 4 of 5 themes

### Added
- **Colour-vision simulation in the token tests** (Viénot–Brettel–Mollon 1999 +
  ΔE2000), covering 10 pairs × 3 deficiencies × 5 themes = 150 assertions. The
  previous chart tests checked contrast and ramp monotonicity only, so no amount
  of running them could have caught this. Confirmed to fail against the pre-fix
  palette before being committed.

## [0.8.30] — 2026-09-09

### Fixed
- **One app's failure no longer aborts the whole library sync.** The per-app
  body sat bare inside `main`'s outer `try`, so the first throw unwound the
  entire loop. When `LIBRARY_SYNC_TOKEN` lost its `Checks: read` permission,
  app #1 threw and apps #2-4 were never touched — 29 consecutive releases
  failed this way since 2026-08-24, each reporting "4 Quill-styled repos
  examined" followed by zero per-app result lines. Each app is now attempted
  independently (`syncApps`, exported and tested); failures are collected,
  named together in the summary, and the run still exits non-zero so a broken
  sync is never mistaken for a clean one.
- **The status-check poll no longer converts a permissions error into a fatal.**
  `mergeWhenGreen`'s poll called `gh pr view --json statusCheckRollup` bare, so
  "I cannot READ the checks" and "the checks are RED" were indistinguishable —
  the former killed the run. It now throws a diagnosis naming the likely cause
  (a token missing `Checks: read`) instead of a raw GraphQL error, which the
  per-app handler records against that app before moving on.
- **A failed `--auto` arm is no longer discarded.** The bare `catch {}` around
  `gh pr merge --auto` could not tell "this repo has no branch protection" (the
  intended case) from "this token cannot merge here". The reason is now kept and
  included in the poll's error if that also fails, so both causes surface
  together rather than one masking the other.

### Notes
- This is the script half of the fix. The other half is an account action: the
  `LIBRARY_SYNC_TOKEN` PAT still needs the **Checks: read** permission. Until
  that is granted, syncs will continue to fail — but they will now fail per app,
  with a message naming the cause, instead of silently stopping after the first.

## [0.8.29] — 2026-09-09

### Fixed
- **ToneBadge's `gold` and `indigo` tones produced no styling at all.** Both
  referenced Tailwind colour names the theme never defined, so the utilities
  were never generated. `indigo` asked for `bg-indigo`/`text-indigo-deep`; the
  registered names are `indigo-brand`/`indigo-brand-deep` (the plain `indigo`
  name is deliberately left to Tailwind's own palette). `gold` asked for
  `text-gold-text`, which had no `--color-*` entry despite `--gold-text`
  existing as a variable. The two solid variants were the worst case:
  tailwind-merge dropped `Badge`'s default `bg-primary` because `bg-gold-text`
  *looks* like a background utility, then that utility compiled to nothing —
  leaving cream `text-paper` on an unstyled chip, ~1.06:1 on a Dawn card.
  The comment at `tone-badge.tsx:23` explaining why `gold-text` carries text
  duty was correct all along; only the plumbing was missing.
- **`--warning` and `--info` failed WCAG AA as text on light grounds.**
  `--warning` pointed at `gold-deep` (3.33:1 on Dawn paper, 3.08:1 on a card,
  2.85:1 on a well; 3.91/3.65/3.40 on Classic Light) even though `gold-text`
  exists precisely because gold's deep cut cannot carry text duty on light
  grounds. `--info` was the only status token on a base pigment cut rather than
  a deep one (4.26:1 on a Dawn card, 3.94:1 on a well). Now `gold-text` and
  `indigo-deep` respectively — eight failures resolved, and no visual change on
  any dark theme, where `gold-text` and `gold-deep` are the same hex.
- **80 `dark:` utilities were dead on the `intelligent` theme.** The
  `@custom-variant dark` selector in `globals.css` was hand-kept and still named
  only two of the three dark themes, so `dark:bg-input/30`, `dark:hidden` and
  every other `dark:` utility silently rendered its *light* treatment on a
  near-black ground. The selector is now generated from `MODES`, so a sixth
  theme joins automatically. (Site-only: the registry cut is imported from a
  layout rather than the Tailwind entry, so an `@custom-variant` there would
  never be processed. Consumers still get no `data-theme`→`dark:` bridge until
  the token layer ships through shadcn's `cssVars`/`css` fields.)

### Added
- Three regression guards for the class of bug all three fixes share — a value
  added to the token source but not to a hand-kept list beside it:
  - every status token must clear 4.5:1 on page, card **and** well in all five
    themes (90 combinations). The previous contrast tests only checked the page
    ground, which is exactly how `--warning` shipped failing on cards and wells.
  - every pigment cut must have a `--color-*` utility mapping, so a cut like
    `gold-text` can never again exist as a variable with no class.
  - the `dark:` variant must name every theme whose `color-scheme` is dark, and
    no light one.
  All three were confirmed to fail against the pre-fix values before being
  committed.

## [0.8.28] — 2026-09-07

### Changed
- chore(deps): Bump the storybook group across 1 directory with 6 updates
- chore(deps): Bump the next group across 1 directory with 2 updates
- chore(deps): Bump @types/react-dom in the react group

## [0.8.27] — 2026-09-03

### Changed
- chore(deps): Bump qs from 6.15.3 to 6.16.0
- chore(deps): Bump browserslist from 4.28.6 to 4.28.8
- chore(deps): Bump fast-uri from 3.1.5 to 3.1.7

## [0.8.26] — 2026-08-31

### Changed
- chore(deps): Bump the next group across 1 directory with 2 updates
- chore(deps): Bump @types/react-dom in the react group

## [0.8.25] — 2026-08-26

### Changed
- fix(generated): restore generated files to match source
- feat(tokens): Intelligent theme — cockpit grounds, teal working status, instrument fonts

## [0.8.24] — 2026-08-24

### Changed
- chore(deps): Bump the minor-and-patch group across 1 directory with 6 updates
- chore(deps): Bump the next group across 1 directory with 2 updates
- chore(deps): Bump the storybook group with 6 updates

## [0.8.23] — 2026-08-24

### Changed
- chore(docs): commit the local context files — PRODUCT.md + impeccable live config

## [0.8.22] — 2026-08-23

### Changed
- test(library-sync): pin the registry's non-block write surface

## [0.8.21] — 2026-08-22

### Fixed
- `src/components/ui/icons.generated.d.ts` was stale on `main`. The
  `@material-symbols/svg-400` bump to 0.46.0 (v0.8.19, Dependabot) changed the
  icon set — `display_add`, `drive_fusiontable`, `globe_clock` and `terminal_add`
  arrived, `file_map` went away — but Dependabot only edits `package.json` and
  the lockfile, so the `IconName` union was never rebuilt. Regenerated here
  (3896 → 3899 names). Nothing referenced `file_map`, so no call site changed.
- The generated-files gate could not catch it. `ci.yml` and `self-heal.yml` both
  diffed `icons.core.mjs` but not `icons.generated.d.ts`, even though
  `scripts/build-icons.mjs` writes both and both are committed. Added the path to
  both lists, so an icon-library bump that skips the rebuild now fails CI and
  self-heal repairs it. (The script's three other outputs — the per-icon
  directory, `icons.tail.mjs`, `icons.all.generated.mjs` — are gitignored by
  design and correctly stay out of the gate.)

## [0.8.20] — 2026-08-17

### Changed
- chore(deps): Bump the minor-and-patch group across 1 directory with 3 updates

## [0.8.19] — 2026-08-17

### Changed
- chore(deps): Bump the next group across 1 directory with 2 updates
- chore(deps): Bump the storybook group with 6 updates

## [0.8.18] — 2026-08-13

### Changed
- `/figma-pull`: designer text edits on `❖ Test` landed in `test-card.tsx` —
  title, body and both button labels now read as they do in Figma. Token
  bindings needed no translation; the pull read fill, stroke × border-width,
  radius, padding, gap, elevation and both Button instance variants straight off
  the node and every one already matched code. Baseline re-stamped.
- The fixture's body copy is deliberately kept on ONE source line. The daily
  `figma-parity` bot can only auto-repair a text change when the old value
  appears exactly once in the file, and JSX line-wrapping had been hiding the
  body string from that check — so text drift on this component previously fell
  through to a manual `/figma-pull`. It can now self-repair.

## [0.8.17] — 2026-08-13

### Fixed
- fix(drift): the parity checker read only the uniform `strokeWeight` binding, so
  a node whose stroke weight is bound per-side (`strokeTopWeight` and friends —
  which is how `❖ Test` is built) always extracted `var: null`. Drift on those
  nodes could only ever be reported as a bare number; it is now named by
  variable (`expected border-width/1, found border-width/2`). Detection itself
  is unchanged — `diffComponent` still passes a property when either the binding
  or the raw value matches.

### Changed
- `❖ Test` pushed back into parity with `test-card.tsx`: the Figma twin's title,
  body and button labels had drifted back to placeholder copy. Bindings were
  never lost (the per-side reading above was the confusion). Baseline
  `lastSynced` → 2026-08-13.
- `Sandbox / Test` docs description now says what the fixture demonstrates.
- `/figma-push` skill records the per-side stroke-weight gotcha, so a future run
  doesn't misread it as a dropped binding and "repair" a no-op.

## [0.8.16] — 2026-08-13

### Added
- feat(drift): auto-pull tier — Figma component parity moves to its own daily
  workflow (`figma-parity.yml`) and now REPAIRS value-level drift itself: a
  re-bound token or changed text is translated deterministically
  (binding→class) and opened as an auto-merging `auto/figma-pull` PR,
  self-heal style. Structural drift and code-side drift still fail the run
  naming the interactive command to use (`/figma-pull` / `/figma-push` — the
  push direction can never be a bot; Figma has no headless node-write API).
  The weekly drift audit no longer carries the parity job.

## [0.8.15] — 2026-08-13

### Added
- feat(drift): scheduled Figma↔code component parity — the `figma-parity` job
  in the weekly drift audit runs `scripts/figma-drift.mjs` against the
  committed baseline (`figma/sync-state.json`), failing with "run
  /figma-pull <name>" when Figma moved and "run /figma-push <name>" when code
  moved. Detection is scheduled; repair stays on-demand (Figma has no headless
  node-write API on any plan). Skips cleanly until a `FIGMA_TOKEN` secret
  exists. `/figma-pull` and `/figma-push` now rewrite the baseline as their
  final step.

## [0.8.14] — 2026-08-12

### Added
- feat(skills): `/figma-pull` and `/figma-push` project commands — the
  bi-directional component sync procedure (code is the ultimate source of
  truth) as repeatable slash commands under `.claude/skills/`, encoding the
  binding→class translation table and the upsert-never-recreate rules proven
  on the Test fixture.

## [0.8.13] — 2026-08-12

### Added
- feat(figma): bi-directional component sync, proven both directions — `TestCard`
  sync fixture (`Sandbox / Test` story ↔ Figma `❖ Test` page, node 371:7) and the
  documented pull/push procedure in `figma/README.md`. Code is the ultimate source
  of truth: Figma edits land as reviewable code changes; code changes upsert the
  Figma twin in place.

## [0.8.12] — 2026-08-10

### Changed
- chore(deps): Bump the minor-and-patch group across 1 directory with 4 updates
- chore(deps): Bump the storybook group with 4 updates

## [0.8.11] — 2026-08-10

### Changed
- docs(figma): record 2026-08-10 sync audit — Button/Toggle/Tabs fixed

## [0.8.10] — 2026-08-10

### Changed
- fix(usage): escape raw <tag> text in renderUsageDocs, fixes 26 docs pages

## [0.8.9] — 2026-08-10

### Changed
- docs(stories): link Menubar/Combobox a11y exemptions to upstream Base UI issues

## [0.8.8] — 2026-08-10

### Changed
- fix(deps): bump next + eslint-config-next to 16.3.0, clears postcss/sharp advisories

## [0.8.7] — 2026-08-10

### Changed
- fix(stories): DoDont stories no longer overflow/mis-center under layout:'centered'

## [0.8.6] — 2026-08-09

### Changed
- chore(registry): rebuild public/r snapshots after tabs-page rule rewrite
- fix(stories): DoDont content fixes — separator, sonner, tabs, tabs-page, login-minimal

## [0.8.5] — 2026-08-09

### Changed
- fix(stories): DoDont content fixes — accordion, tone-badge, navigation-menu, input-otp, collapsible

## [0.8.4] — 2026-08-09

### Changed
- fix(usage): revert 5 rules to visual:false — no static visual signature (checkbox, item, radio-group, switch, data-table)

## [0.8.3] — 2026-08-09

### Changed
- fix(stories): DoDont stories no longer inherit the single-example narrow decorator (empty, skeleton, slider)

## [0.8.2] — 2026-08-09

### Changed
- fix(stories): DoDont popup-overlap fix — 7 defaultOpen components no longer cover their own caption

## [0.8.1] — 2026-08-09

### Fixed
- **Bumped `nanoid` and `brace-expansion`** to clear 3 Dependabot security
  advisories (1 high DoS via zero-size custom generators in `nanoid`, 2 high
  DoS via unbounded expansion in `brace-expansion`). Lockfile-only change,
  no direct dependency version pins moved.

## [0.8.0] — 2026-08-09

### Added
- **Usage documentation and Do/Don't visual pairs for the entire catalog
  (Wave 3).** All 53 remaining top-level primitive components (accordion,
  badge, button-group, calendar, card, checkbox, dialog's siblings, select,
  tabs, tooltip, and the rest) now have a `src/usage/<name>.usage.mjs`
  entry, closing the last gap after Wave 1's pilots (v0.6.0) and Wave 2's
  pattern blocks (v0.7.0). Every one of the catalog's 105 documented
  items — primitives, patterns, and blocks alike — now also has at least
  one rule rendered as a live, side-by-side `DoDont` story wherever a rule
  is genuinely showable as two rendered instances, not just described in
  prose.

### Fixed
- **Nine already-shipped `DoDont` stories no longer fail the Storybook
  accessibility gate.** Their "Don't" examples are intentional a11y
  violations (an unlabeled toggle, a nameless icon-only button) — exactly
  the kind of thing worth showing as a Don't — so they're now explicitly
  exempted from the automatic axe assertion instead of failing CI.
- **input-otp's `DoDont` "Do" example is now actually accessible.** Its a11y
  exemption was masking a real gap — neither OTP field had an accessible
  name — rather than the intended comparison. Both fields now carry a
  proper `aria-label`, and the exemption was removed since there's no
  longer a violation to suppress.
- **navigation-menu's `DoDont` landmarks are now individually labeled**,
  removing a `landmark-unique` violation that came from having two
  unlabeled `<nav>` elements side by side.
- **badge's documented `--radius-full` token corrected to `--radius-4xl`**,
  the token the component actually consumes.

### Known issues
- Opening the Menubar or Combobox in the new `DoDont` stories surfaced two
  real, pre-existing accessibility defects in those primitives themselves
  (`aria-required-children` in both; `aria-hidden-focus` in Combobox) —
  not introduced by this release, but newly visible because these are the
  first stories in the catalog to actually open either component. Left
  unfixed and exempted from the a11y gate with a traceability comment;
  needs a dedicated follow-up.

## [0.7.2] — 2026-08-08

### Changed
- docs(figma): Code Connect is not on the roadmap (no org plan) (#70)

## [0.7.1] — 2026-08-08

### Changed
- chore(deps): Bump js-yaml from 4.3.0 to 4.3.1

## [0.7.0] — 2026-08-07

### Added
- **Usage documentation for all 50 remaining pattern blocks (Wave 2).**
  Every registry block now has a `src/usage/<name>.usage.mjs` entry — the
  Auth, Data, Forms, Marketing, Nav, Shells, and State categories are fully
  covered, closing the gap Wave 1 (v0.6.0) left after its three pilots.
  `src/usage/modules.d.ts` is now generated by `npm run build:usage`
  instead of hand-maintained.

### Fixed
- **Analytics charts' two-series area chart no longer fails
  colorblind-distinguishability.** It colored its Readers/Subscribers
  series with raw `--terracotta`/`--moss` pigments — a pairing the token
  test suite documents as failing deutan contrast (ΔE 3.2). Switched to
  the CVD-safe `--chart-1`/`--chart-2`/`--chart-3` series tokens.
- **Stats band's headline numbers now follow the page's accent** instead
  of a hardcoded `--terracotta`, matching every other accent-driven
  emphasis element in the catalog.

## [0.6.2] — 2026-08-05

### Fixed
- **Docs-page table rows on a dark theme no longer show a stray light
  background.** Storybook's docs addon zebra-stripes every other `<table>`
  row for readability in authored markdown tables; Quill overrides its
  default color with `--paper-warm`, but the selector couldn't distinguish
  a prose table from a live-rendered story that happens to use `<table>`
  markup (Calendar, and Quill's own Table component). That hardcoded,
  non-theme-aware color showed through even when the story's own theme was
  switched to Dusk or Classic Dark. Reverted to transparent specifically
  inside the live-story preview container, so genuine markdown tables keep
  the intended warm stripe and rendered components show their own correct,
  theme-aware background instead.

## [0.6.1] — 2026-08-04

### Fixed
- **Storybook canvases no longer force a full-viewport minimum height.**
  Every non-fullscreen story (95 of 105 — everything except the deliberate
  full-page patterns like Dashboard shell, Navbar, Login) now hugs its own
  content with equal top and bottom margin, instead of sitting in a box
  hundreds of pixels taller than the component itself.
- **Opening a dropdown/popup (Select, Combobox, DropdownMenu, Popover,
  HoverCard, Tooltip, Command, Menubar, NavigationMenu, ContextMenu) now
  reserves real space below the component**, so the open overlay no longer
  visually overlaps whatever renders after it on the page — the same
  margin that appears above the story also appears below the open overlay.
- **`SelectSeparator` no longer renders an invalid ARIA role.** It used
  Base UI's generic `Separator` primitive, which defaults to
  `role="separator"` — not a permitted child of `role="listbox"` per
  WAI-ARIA. Now renders `role="presentation"` instead; purely a semantics
  fix, no visual change.

## [0.6.0] — 2026-08-04

### Added
- **Single-source component usage documentation.** A component's usage
  guidance — when to use it, what to reach for instead, do/don't rules,
  accessibility notes, tokens — now lives in one `src/usage/<name>.usage.mjs`
  file and is derived everywhere else: the Storybook docs page renders it, a
  `public/usage/<name>.md` page publishes it, the registry item's `docs`
  field carries it into the shadcn CLI at install time, and llms.txt links
  it for AI consumers. Visual Do/Don't pairs render in stories with
  test-enforced pairing to their written rule. Pilots: Button, Dialog, and
  the Alerts pattern; staleness + coverage fences guard the rest of the
  catalog for Waves 2–4.

## [0.5.3] — 2026-08-04

### Changed
- chore(deps): Bump hono from 4.12.31 to 4.12.34
- chore(deps): Bump undici from 7.28.0 to 7.29.0
- chore(deps): Bump fast-uri from 3.1.4 to 3.1.5
- chore(deps): Bump ip-address from 10.2.0 to 10.4.0

## [0.5.2] — 2026-08-03

### Changed
- chore(deps): Bump the minor-and-patch group across 1 directory with 2 updates
- chore(deps): Bump the react group with 2 updates

## [0.5.1] — 2026-07-31

### Fixed
- **The consumer icon component stopped exporting `IconName`, breaking the
  first real library sync.** `craftwell-command-center` imports
  `type IconName` from its copy of `icon.tsx`; the registry's standalone cut
  had dropped that export, so the v0.5.0 sync PR failed the app's build —
  caught exactly as designed (red PR, app untouched). The cut now exports
  `type IconName = string` again: permissive on purpose, because the
  standalone cut cannot know the full library union.
- Stale rationale comment in the theme: links resolve through the accent
  alias (default moss-deep), not `terracotta-deep`. Flagged by Greptile on
  the `commanddeck` sync PR.

## [0.5.0] — 2026-07-31

### Added
- **Library-sync bot — a release now reaches the apps by itself.** The registry
  copies code into each app at install time, so until now a release changed
  nothing downstream until every app re-pulled by hand. `library-sync.yml` runs
  on every published release: it finds every Quill-styled app in the account
  (same marker rule and loud denominator as the pattern scan), rewrites the
  items each app already has from the released `public/r/*.json`, and opens one
  PR per app that merges itself once that app's own checks pass. Red checks
  leave the PR open for a human; an app with no Quill items is never touched;
  a stale sync PR from an earlier release is closed as superseded. Requires a
  new `LIBRARY_SYNC_TOKEN` secret (fine-grained PAT, All repositories,
  Contents + Pull requests read/write) — `AUTOMATION_TOKEN` is scoped to
  quill-ds only and cannot reach the apps.

## [0.4.0] — 2026-07-31

### Changed
- **Icon weight bumped two steps: 200 → 400.** The source package is now
  `@material-symbols/svg-400` (Outlined, Fill 0 — style unchanged), and every
  generated artifact (core map, per-icon modules, tail, registry `icon` item)
  is rebuilt at the heavier cut. The icon *names* are identical between the two
  packages (verified: the generated `IconName` union did not change), so no
  consumer code changes — apps pick up the new weight by re-pulling the `icon`
  registry item. The homepage theme selector keeps its hand-inlined weight-500
  glyphs, now only one step heavier than the system set.

## [0.3.2] — 2026-07-30

### Fixed
- **"No apps found" was indistinguishable from "the token cannot see them."**
  The first successful run reported `None — no repo reachable by the token
  carries the Quill token layer` and exited 0, looking like a clean result. Both
  apps do carry the marker at `app/quill-theme.css`; the token simply could not
  reach them. The report now always prints the denominator — *"0 Quill-styled of
  N repo(s) examined (M visible to the token)"* — so zero-of-eight and
  zero-of-one are never confused, and names the likeliest cause when the reach is
  near zero (a fine-grained token defaults to **Only select repositories**).
- A repo whose file list cannot be read is now **named** in the report rather
  than silently skipped. Unreadable is not the same as not-Quill-styled, and the
  loop was quietly collapsing the two.

## [0.3.1] — 2026-07-30

### Fixed
- **The pattern scan could not see any app.** Its first real run failed with
  `404 on /orgs/craftwell-ai/repos`: `craftwell-ai` is a **user account, not an
  organisation**. The 404 was the lucky outcome. The neighbouring endpoint,
  `/users/craftwell-ai/repos`, answers **200 with only the public repos** — here
  just `quill-ds` — so a scan pointed at it would have reported a confident,
  clean-looking result having examined nothing. Discovery now uses
  `/user/repos?affiliation=owner`, the *authenticated* user's own repos, which is
  the only form that includes the private ones; `PATTERN_SCAN_TOKEN` must
  therefore belong to the account that owns the apps.
- A run that lists **zero** repositories now fails loudly instead of reporting no
  findings. Zero repos means the token is wrong, not that there is nothing to
  scan — and "nothing found" is exactly what this scan must never say by accident.
- The tracking issue is addressed via `GITHUB_REPOSITORY` rather than a
  hardcoded owner, so the repo name is not duplicated in two places.

## [0.3.0] — 2026-07-30

### Added
- **The drift system now looks outward.** Tiers 1–3 all watch Quill against
  itself. Nothing watched the apps *styled with* Quill, so a pattern built by
  hand in two of them went unnoticed, and a block Quill already ships got
  rebuilt from scratch without anyone knowing it existed. A hand survey found
  four of the first and seven of the second across three apps.
  - `scripts/pattern-scan.mjs` + `.github/workflows/pattern-scan.yml` — Mondays
    14:00 UTC, posting to one tracking issue whether or not anything is new,
    because silence is indistinguishable from a broken scan. Documented as
    Tier 4 in `scripts/DRIFT-AUDIT.md`.
  - The app list is built by checking each org repo for Quill's token layer,
    which makes the origination rule mechanical rather than a convention. It
    also excludes the repos that merely *mention* Quill: `scaffold` carries
    its script lineage but no styling, and 3 of 7 naive matches were false
    positives.
  - Candidates need two independent builds. Without that rule one app's
    trading-card artwork qualifies — real Quill-styled work with no business in
    a design system.
  - **It reports, and promotes nothing.** All three apps have an "agent avatar"
    and the three are 94/137/46 lines built from `lucide-react`,
    `node:fs`+`next/image`, and `next/image` respectively — so name matching
    cannot tell whether there is one component there. The report puts line
    counts and imports side by side and leaves the judgement to a human. No AI,
    so none of the confident-wrong-answer risk that keeps `claude-repair.yml`
    fenced.
  - **The rebuilt list states its own limit in every report.** It matches on
    names, so `update-feed` (for `activity-feed`) and `vitals-strip` (for
    `stat-cards`) are invisible to it. A floor, not a total — an incomplete list
    that reads as complete is worse than no list.
  - Red means the scan broke, never "there is news".

### Fixed
- Two false alarms the first real run produced, both closed before shipping.
  Craftwell's correctly-**installed** `components/ui/tone-badge.tsx` and
  `ui/icon.tsx` were reported as rebuilds; the registry declares where each item
  installs, so a file at its declared target is Quill's own rather than a copy,
  and reading those targets from `registry.json` makes this honest by
  construction instead of a path guess. And `app` clustered `app-shell` with
  `AppBar` while `button` clustered `SignOutButton` with `google-button` — shape
  words, now stopwords, which also stopped `app-shell` appearing in two clusters
  at once.
- The read and write tokens are separate variables, because they are not
  interchangeable: the org PAT is `Contents: read` and cannot create an issue,
  and `GITHUB_TOKEN` can comment here but cannot read the other repos. One
  variable silently lost half the job.

## [0.2.25] — 2026-07-29

### Changed
- fix(generated): restore generated files to match source
- icons: add attach_file to the sync core set

## [0.2.24] — 2026-07-28

### Fixed
- **`self-heal` and `release` could race and orphan a PR.** Found by deliberately
  drifting `main` to exercise the repair path for the first time. Self-heal
  worked — it detected the hand-edited `public/llms.txt` and opened a PR with
  exactly the right one-line fix. But the same push also triggered `release`,
  which bumped the version and, because the version string is embedded in
  `llms.txt`, regenerated the same line and merged first. The repair PR was left
  conflicting and unmergeable, with nothing to ever clean it up.
  - Both workflows now share one `auto-maintenance` concurrency group, so they
    take turns instead of acting on the same commit simultaneously.
  - Serialization alone is not sufficient — `release` merges asynchronously via
    auto-merge, so it can still repair a file moments after `self-heal` opened a
    PR for it. `self-heal` therefore closes its own repair PR when it finds no
    drift left: if nothing is broken, an open repair is by definition obsolete.
    The loop now self-corrects instead of leaving a permanently red PR.

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
