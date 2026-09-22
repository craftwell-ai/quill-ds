# Fraunces axes audit — 2026-09-22

**Question.** The type audit (v0.10.3–v0.10.5) matched family, size, weight, line height and
tracking, and left one thing open: the Figma file sets Fraunces to `SOFT 0 / WONK 1` everywhere,
while the code tokens ask for four different axis presets. Which side is right?

**Answer.** Neither is wrong — they are looking at different fonts. The tokens' `SOFT` and
`WONK` values take effect on **the site only**. Storybook, the shipped theme file, the CLI
payload and therefore every consumer app load a Fraunces that does not carry those two axes,
so the settings are ignored and everything renders at the font's defaults, `SOFT 0 / WONK 1`
— exactly what Figma has. `opsz` and `wght` work everywhere.

## Evidence (all measured)

| Surface | How Fraunces is loaded | Axes in the font file | SOFT / WONK effective? |
|---|---|---|---|
| Site (quilldesignsystem.com) | next/font, `axes: ["SOFT","WONK","opsz"]`, self-hosted `/_next/static/immutable/media/…woff2` | `opsz, wght, SOFT, WONK` | **yes** |
| Storybook (`.storybook/preview-head.html`) | Google Fonts `Fraunces:ital,opsz,wght@…` | `opsz, wght` | no |
| Shipped theme `registry/themes/quill.css:7` and the CLI payload | same Google URL | `opsz, wght` | no |
| Figma library | desktop Fraunces, file-wide `SOFT 0 / WONK 1` | all | at defaults |

- The two Google URLs serve different files (`6NU78…` vs `6NUV8…`). Read with fontTools:
  shipped `fvar` = `opsz 9–144, wght 100–900`; full = adds `SOFT 0–100 (default 0)`,
  `WONK 0–1 (default 1)`. The site's self-hosted file = the full set.
- Chromium, fixed element, one axis at a time (pixel hash + advance width):
  shipped import → `SOFT 0` ≡ `SOFT 100`, `WONK 0` ≡ `WONK 1` (inert); `wght` and `opsz` live.
  Full import → all four live. The shipped rendering's hashes equal the full import at
  `SOFT 0 / WONK 1`, i.e. the font's defaults.
- `opsz` in `font-variation-settings` beats Chromium's automatic optical sizing (`opsz 24`
  and `opsz 144` at 48px differ from the auto value), so the `opsz` half of every preset works.
- Byte cost of the full-axes Google font: 314 KB → 566 KB across the six subset files;
  a Latin page loads ~2, roughly +15 KB each (20 → 34 KB).
- Side effect found: the site's next/font Fraunces registers **normal style only** (three
  `@font-face` blocks, no `font-style: italic`), so `.fraunces-accent` and `.fraunces-caption`
  render a synthesised italic on the site, while Storybook and the apps get the true italic
  from the `ital` axis. Whichever option is chosen, add `style: ["normal", "italic"]` to the
  site's `Fraunces()` call.

## What each preset asks for vs what ships

| Preset | Where | Tokens | Ships (Storybook, apps, Figma) |
|---|---|---|---|
| `--fraunces-display` | `h1`, `.fraunces-display` | opsz 144 · SOFT 50 · WONK 0 | opsz 144 · SOFT 0 · WONK 1 |
| `--fraunces-text` | `h2–h6`, `.fraunces-text` | opsz 24 · SOFT 50 | opsz 24 · SOFT 0 · WONK 1 |
| `--fraunces-accent` | `.fraunces-accent` | opsz 144 · SOFT 100 · WONK 1 | opsz 144 · SOFT 0 · WONK 1 |
| `--fraunces-caption` | `.fraunces-caption` | opsz 14 · SOFT 100 | opsz 14 · SOFT 0 · WONK 1 |

Live side-by-side: https://claude.ai/artifact/McpYX2DdHsUJyVsGgbQtvR

## Options (Ryan's call)

**A — ship the axes.** Change the Google Fonts URL in the theme header (`scripts/build-tokens.mjs`
writes it), Storybook's `preview-head.html` and the CLI payload to
`Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..900,0..100,0..1;1,9..144,300..900,0..100,0..1`;
then set the Figma text styles to the presets (Display/* → display, Heading/* + Body → text,
Accent → accent, Caption → caption) and re-run the type-audit harness. Apps look like the site;
+~15 KB per font file; Figma work across 23 styles plus own layers.

**B — retire SOFT and WONK.** Keep `opsz` (it works everywhere), drop the two axes from
`tokens.fraunces`, and set the site's next/font `axes: ["opsz"]`. The site joins Storybook,
Figma and the apps at `SOFT 0 / WONK 1` — the look every parity sweep has been reviewing. No
font cost, no Figma work; the site's headings change.

Recommendation was **B** (every reviewed surface already showed `SOFT 0 / WONK 1`, and the font
cost is paid by every consumer page). **Ryan chose A** (2026-09-22): the presets are the intent.

## Outcome (v0.10.13)

- Font import → `Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..900,0..100,0..1;1,9..144,300..900,0..100,0..1`
  in `registry/themes/quill.css` (hand-written header above the generated span; the CLI payload
  embeds it), `.storybook/preview-head.html`, `.storybook/manager.ts`. Guard in
  `scripts/repo-invariants.test.mjs`: every Fraunces import must load every axis a preset names.
- Site: `Fraunces({ style: ["normal", "italic"] })` — true italics for the accent word and captions.
- **What code actually applies, measured from the Storybook DOM (94 roots, 343 stories):** of
  the Fraunces texts, 6 are `h1` (display: opsz 144 · SOFT 50 · WONK 0), 15 are `h2`/`h3` (text:
  opsz 24 · SOFT 50), and 88 are `div`/`span`/`p`/`blockquote` at `normal` — the font defaults,
  SOFT 0 · WONK 1 — because `font-heading` only sets the family; the presets ride on the `h1–h6`
  base rules and the two `.fraunces-*` classes. No shipped story renders `.fraunces-accent` or
  `.fraunces-caption`. Figma mirrors this per element (code is the source of truth), so a
  CardTitle in Figma stays at the defaults while the `h2` beside it takes SOFT 50.
- **Follow-up, taken in v0.10.14 (Ryan: "do it"):** `font-heading` on a non-heading element now
  carries the text preset through a base-layer rule, `.font-heading:not(h1, h2, h3, h4, h5, h6)`,
  in both CSS cuts (the theme file reaches both channels; no utility or payload change). Two
  preset corrections rode along: `--fraunces-text` no longer pins `opsz` (it serves 15–48 px, so
  optical size follows the render size), and text + caption set `WONK 0` explicitly — the font
  defaults WONK to 1, so every h2–h6 and caption had the off-kilter glyph set on while the docs
  said "accents only" (visible mainly in the swash ampersand). Result: every Fraunces text is
  SOFT 50 · WONK 0; accent SOFT 100 · WONK 1; caption SOFT 100 · WONK 0. Figma: the 7 Fraunces
  text styles (Display/XL·L·M, Heading/L·M·S, Accent) and 56 main-component layers set; the 5
  overlay titles re-attached to Heading/S; read back on all 45 Fraunces-bearing roots, instances
  included: 911/911 matched layers exact, 0 off on axes.
- **Figma, measured then set.** Fresh run: 94 roots, 1,363 layers, 911 matched by words,
  14 off on axes — every one an `h1`/`h2`/`h3` (faq, feature-section, hero, login-minimal,
  login-oauth, login-split-panel, mail-shell ×2, newsletter, stats-band, team-section, and the
  two template instances that inherit from hero / login-split-panel / feature-section). Plus the
  five overlay titles the DOM could not see (AlertDialog, Dialog, Drawer, Sheet ×2 — closed in
  the stories; read from the code: `font-heading` on an `h2` from Base UI / Radix). 16 layers
  set through `fontName.variationSettings`: `h1` → SOFT 50 · WONK 0, `h2`/`h3` → SOFT 50. The
  overlay titles detach that property from `Heading/S`; the Card title (a `div`) keeps the style
  at the defaults. Figma's Fraunces exposes `SOFT, WONK, wght` — no `opsz` — so optical size
  stays Figma-managed. Re-dumped afterwards: 911 of 911 matched layers exact, 0 off on axes.
  Only one Fraunces text style is in use across the roots (`Heading/S`, 6 layers); the rest of
  the Fraunces text is unstyled layers.
- **Storybook proven live** (static build of this branch, Playwright): the hero `h1` computes
  `"SOFT" 50, "WONK" 0, "opsz" 144`, loads the full-axes file, and renders differently with
  SOFT or WONK forced.
- Harness: `capture-dom.mjs` records the computed `font-variation-settings` (`fvs`);
  `dump-text.figma.js` records each layer's `variationSettings` (`axes`) and up to 30 layer ids
  per group; `compare.mjs` diffs SOFT/WONK always and `opsz` where code sets it (`off.axes`).
