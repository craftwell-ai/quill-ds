# Figma type audit — 2026-09-21

Every text layer in the 94 Figma roots the parity bot knows (44 component sets, 47 pattern pages, 3 templates), compared with the browser's computed style for the same words in Storybook. Read-only: nothing in Figma was changed by the audit. Re-run it with `scripts/figma-type-audit/` (see its README).

## Result

| | layers |
|---|---|
| text layers in Figma | 1077 |
| matched to a code element by their words | 871 (81%) |
| — of those, every metric equal | **206 (24%)** |
| unmatched (twins carry placeholder copy the stories do not) | 206 |

What is off, among matched layers (a layer can be off on more than one):

| metric | layers |
|---|---|
| line height | 631 |
| weight | 65 |
| size | 40 |
| letter spacing | 35 |
| family | 12 |
| case | 0 |

## The finding that matters: code's answer is nearly uniform per style

A text style is shared by layers whose code twins could differ, so the plan had been a layer-by-layer pass. The data says otherwise for the four styles that carry 68% of all text: almost every layer bound to each renders ONE set of metrics in code.

| Figma style | Figma holds | layers (matched) | what code renders, top answers |
|---|---|---|---|
| `Body/S` | 13.6px · 160% · 0% · Regular | 322 (227) | 207 × 13.6px · 142.86% · 0% · 400<br>8 × 13.6px · 162.5% · 0% · 400<br>8 × 13.6px · 142.86% · 0% · 500 |
| `Label/Default` | 13.6px · 140% · 0% · Medium | 246 (194) | 132 × 13.6px · 142.86% · 0% · 500<br>34 × 13.6px · 100% · 0% · 500<br>10 × 13.6px · 142.86% · 0% · 400 |
| `Label/Small` | 12px · 140% · 0% · Medium | 86 (68) | 45 × 12px · 133.33% · 0% · 500<br>16 × 12.8px · 170% · 0% · 500<br>6 × 12.8px · 142.86% · 0% · 500 |
| `Body/XS` | 12px · 150% · 0% · Regular | 81 (70) | 67 × 12px · 133.33% · 0% · 400<br>3 × 12px · 162.5% · 0% · 400 |
| `Heading/S` | 18.4px · 130% · -1% · Regular | 12 (6) | 4 × 18.4px · 155.56% · 0% · 400<br>1 × 18.4px · 155.56% · -3% · 400 · in h*<br>1 × 15.2px · 150% · 0% · 500 |
| `Eyebrow` | 12px · 100% · 15% · Medium | 2 (2) | 2 × 12px · 133.33% · 15% · 500 · uppercase |
| `Heading/L` | 32px · 120% · -2% · Regular | 2 (2) | 2 × 48px · 120% · -3% · 400 · in h* |
| `Display/M` | 48px · 110% · -3% · Regular | 2 (2) | 2 × 88px · 105% · -3% · 400 · in h* |
| `Body/Base` | 15.2px · 170% · 0% · Regular | 2 (2) | 2 × 15.2px · 150% · 0% · 400 |
| `Heading/M` | 24px · 120% · -2% · Regular | 2 (2) | 2 × 32px · 137.5% · 0% · 400 |
| `Display/L` | 64px · 105% · -3% · Regular | 1 (1) | 1 × 64px · 111.11% · 0% · 400 |

`13.6px · 142.86%` is `text-sm`; `12px · 133.33%` is `text-xs`; `18.4px · 155.56%` is `text-lg` — each size's paired line height (`tokens.textLeading`), which is what the generated `Text/*` styles hold.

## Found on the way, and fixed in 0.10.3

**Seven shipped blocks rendered their display type in Georgia.** The audit flagged 12 layers where Figma says Fraunces and the browser says Georgia. Cause: `font-[family-name:var(--font-fraunces,Georgia,serif)]` — `--font-fraunces` is set by next/font in the Quill site's layout and nowhere else, so in Storybook and in every app the fallback won. Figma was right; the code was wrong.

## The rest, by kind

### Size — 40 layers

Mostly Button `sm`, whose label is `text-[0.8rem]` (12.8px) in code while the twin binds `Label/Small` (12px). The hero and feature-section headlines are 48 / 32 in Figma and 88 / 48 in code at a 1280px viewport: the blocks step up with `md:`, and the Figma frames mirror the smaller step.

| layers | what |
|---|---|
| 22 | Label/Small 12 → code 12.8 |
| 6 | (no style) 11.2 → code 10 |
| 4 | Label/Default 13.6 → code 12 |
| 2 | Heading/L 32 → code 48 |
| 2 | Display/M 48 → code 88 |
| 2 | Heading/M 24 → code 32 |
| 1 | (no style) 15.2 → code 16 |
| 1 | Heading/S 18.4 → code 15.2 |

### Weight — 65 layers

`CardTitle` is `font-medium` in code; its Figma text is Regular with no style. `AvatarFallback` is the reverse.

| layers | what |
|---|---|
| 36 | (no style) Regular → code 500 in `card-title` |
| 11 | Label/Default Medium → code 400 in `avatar-fallback` |
| 4 | (no style) Regular → code 500 in `span` |
| 4 | Body/S Regular → code 500 in `tabs-trigger` |
| 3 | Body/S Regular → code 500 in `pagination-link` |
| 1 | Label/Default Medium → code 400 in `label` |
| 1 | (no style) Regular → code 500 in `h2` |
| 1 | Label/Default Medium → code 600 in `span` |
| 1 | Body/S Regular → code 500 in `span` |
| 1 | Label/Small Medium → code 400 in `span` |

### Letter spacing — 35 layers

Everything inside an `h1`–`h6` tracks at −0.03em from the base layer; text that is not in a heading element tracks at 0, whatever it looks like.

| layers | what |
|---|---|
| 20 | (no style) 0% → code -3% (inside h1–h6) |
| 5 | Heading/S -1% → code 0% |
| 4 | Label/Default 0% → code -3.53% (inside h1–h6) |
| 2 | Heading/L -2% → code -3% (inside h1–h6) |
| 2 | Heading/M -2% → code 0% |
| 1 | Display/L -3% → code 0% |
| 1 | Heading/S -1% → code -3% (inside h1–h6) |

### Roots with the most layers off

| off / matched | root |
|---|---|
| 71 / 71 | template `example-marketing-page` |
| 48 / 60 | template `example-app-page` |
| 27 / 29 | pattern `invoice` |
| 27 / 27 | pattern `kanban` |
| 26 / 26 | pattern `pricing` |
| 23 / 23 | pattern `activity-feed` |
| 22 / 24 | pattern `mail-shell` |
| 21 / 21 | pattern `data-table` |
| 20 / 20 | pattern `footer` |
| 19 / 19 | pattern `checkout` |

Fully exact: `Accordion` (re-cut by hand in 0.9.58 — the proof that the method converges).

## Proposed fix, in two passes

**Pass 1 — four style-level changes, clearing four of the ten typed values** (`TYPED_METRICS` in `figma/sync-foundations.figma.js`). Give each style the line height its size is paired with in code:

| style | now | becomes | layers this makes exact |
|---|---|---|---|
| `Body/S` | 160% | 142.857% (`text-sm`) | 207 |
| `Body/XS` | 150% | 133.333% (`text-xs`) | 67 |
| `Label/Default` | 140% | 142.857% (`text-sm`, Medium) | 132 |
| `Label/Small` | 140% | 133.333% (`text-xs`, Medium) | 45 |

Every line of text bound to those styles gets 2–3px shorter, so auto-layout frames reflow: a screenshot pass per page follows, then a fresh pattern snapshot. **Pass 2 — per layer**, for what a style cannot settle: the ~90 unstyled layers (CardTitle weight, heading tracking), Button `sm` at 12.8px, `leading-none` labels, `leading-relaxed` copy, and the responsive headline sizes. Re-run this audit after each pass; the exact count is the score.

## Pass 1 result — 2026-09-22 (0.10.4)

The four style-level changes were made in the library (`Body/S` 160 → 142.857%, `Body/XS` 150 → 133.333%, `Label/Default` 140 → 142.857%, `Label/Small` 140 → 133.333%; exactly those four styles moved), then the audit was re-run on a fresh dump of all 94 roots against the same Storybook captures.

| | before | after |
|---|---|---|
| matched layers, every metric equal | 206 (24%) | **657 (75%)** |
| off on line height | 631 | 156 |
| off on weight | 65 | 65 |
| off on size | 40 | 40 |
| off on letter spacing | 35 | 35 |
| off on family | 12 | 12 |

Still off, by Figma style (layers (matched) · off):

| style | layers (matched) | off |
|---|---|---|
| `Body/S` | 322 (227) | 20 |
| `(no style)` | 319 (295) | 89 |
| `Label/Default` | 246 (194) | 62 |
| `Label/Small` | 86 (68) | 23 |
| `Body/XS` | 81 (70) | 3 |
| `Heading/S` | 12 (6) | 6 |

The reflow was checked page by page: a QA agent compared all 47 pattern pages and 3 templates against their Storybook captures after the change — **49 of 50 clean**: no clipped descenders or cut lines, no overlap, no fixed-height frame left tall. The one flag is not a reflow effect: in the app-page template the stat-card instance is 672 px wide, so each card is 156 px and the first card's delta row (`+12.4%  vs last month`, intrinsic width 143 px at x 16) runs 5 px past the card's inner edge. Horizontal, and pre-existing.

### What pass 2 has to settle, per layer

- **89 unstyled layers**: `CardTitle` is `font-medium` in code and Regular in Figma (36); text inside `h1`–`h6` tracks at −0.03em in code and 0 in Figma (20); calendar day numbers, chart axis labels, sidebar items, ToneBadge labels.
- **`Label/Default`, 62 off**: 34 are `leading-none` labels in code (100%); 11 are `AvatarFallback` (Regular in code, the style is Medium).
- **`Label/Small`, 23 off**: Button `sm` labels are `text-[0.8rem]` (12.8 px) in code — an arbitrary size that sets no line height, so the label inherits the body's 170%; the twin binds `Label/Small` at 12 px. Better fixed in code than mirrored.
- **`Body/S`, 20 off**: `leading-relaxed` copy (162.5%) and Medium-weight cells.
- The responsive headlines (hero 48 → 88, feature-section 32 → 48 at 1280 px): Figma mirrors the small step.
- The stat-card delta row in the app-page template (above).

## Pass 2 result — 2026-09-22 (0.10.5)

Per-layer work, in the order that makes the fewest edits: main components first (their instances follow), then the pattern pages' own layers, then the handful of instance overrides a context demands.

| | before pass 1 | after pass 1 | after pass 2 |
|---|---|---|---|
| matched layers, every metric equal | 206 (24%) | 657 (75%) | **867 (99.5%)** |
| off on line height | 631 | 156 | 1 |
| off on weight | 65 | 65 | 3 |
| off on size | 40 | 40 | 0 |
| off on letter spacing | 35 | 35 | 0 |
| off on family | 12 | 12 | 0 |
| roots fully exact (of 60 with matches) | 1 | — | 56 |

What was done, by layer of the system:

- **Styles.** `Label/Form` added (the Label primitive's `leading-none`, 37 layers bound); `Eyebrow` takes its size's paired line. Six typed values remain in `TYPED_METRICS`, one of which (`Label/Form`) agrees with code by construction.
- **Main components, 38 texts** — Label, Avatar fallback, Button `xs` and `sm`, Tone badge, Tabs. Button `sm` mirrors code's stock `text-[0.8rem]` on the body's 170% line: the code side is a stock primitive and stays stock.
- **Pattern pages, 104 own layers** — card titles to Fraunces weight 500 through the variation axis (SOFT and WONK were already set on every node and were not touched), heading tracking, relaxed copy, stat numerals, the desktop-step headlines (hero 88px, feature-section 48px), kanban avatar initials.
- **Instance overrides, 18** — labels and badges in `text-sm` contexts (142.857% instead of the body's 170%), small avatars (`text-xs`), one plain-weight label, one footer link.

Two measurement fixes on the way: the dump now records `fontWeight` (a variation axis does not change the style name, so 38 correct card titles had scored as "Regular"), and the browser side was re-captured from the post-0.10.3 build (the seven Georgia blocks).

The four layers still off at measurement time were set afterwards and verified by read-back; the score above is the last full measurement. The 206 unmatched layers are placeholder copy in component twins that no story renders.

### Left for a later pass
- The stat-card delta row in the app-page template overflows its 156px card (a width problem from the 672px composition; the stat-cards block itself is fine).
- Fraunces axes: every Fraunces node in the file carries SOFT 0 / WONK 1, while code sets `--fraunces-text` (opsz 24, SOFT 50) on headings and `--fraunces-display` (opsz 144, SOFT 50, WONK 0) on `h1`. The audit does not read variation axes beyond weight; a follow-up should.
