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
