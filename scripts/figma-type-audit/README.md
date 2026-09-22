# Figma type audit

Compares every Figma text layer's type metrics with the browser's computed style for the same words in Storybook. Read-only. The 2026-09-21 run and its findings: `docs/audits/2026-09-21-figma-type-audit.md`.

```bash
W=.figma-type-audit && mkdir -p $W/figma $W/dom
npm run build-storybook -- -o $W/sb --quiet            # ~1 min
node scripts/figma-type-audit/map-stories.mjs $W        # roots.json + roots-stories.json (root → story ids)
node scripts/figma-type-audit/capture-dom.mjs $W        # $W/dom/*.json — computed styles, 343 stories
# Figma side: run dump-text.figma.js through the Figma MCP (use_figma), a few root ids per call,
# and write each root's result to $W/figma/<kind>__<name>.json  (a background agent does this well)
node scripts/figma-type-audit/compare.mjs $W            # $W/report.json + a summary
node scripts/figma-type-audit/axes-plan.mjs $W          # $W/axes-plan.json — Fraunces axis edits, by style vs by layer
```

Matching is by the first 40 characters of the text; tolerances are 0.06px on size, 0.6 points on line height, 0.15 on tracking. A layer whose code twin is a bare `text-*` utility is proposed for the generated `Text/<size>` style; anything else for explicit values. `.figma-type-audit/` is scratch — do not commit it.

**Variable-font axes (since 0.10.13).** The DOM capture records each text's computed `font-variation-settings` (`fvs`); the Figma dump records each layer's `fontName.variationSettings` minus `wght` (`axes`) and up to 30 layer ids per group (`ids`). `compare.mjs` diffs `SOFT` and `WONK` on every Fraunces layer (CSS `normal` = the font defaults, SOFT 0 · WONK 1) and `opsz` only where code sets it, into `off.axes`. `axes-plan.mjs` then says which text styles can move as a whole (every matched layer wants the same axes and none was already exact) and which layers need their own values. Since 0.10.14 every Fraunces text is SOFT 50 · WONK 0 (`h1` display and `h2–h6`/`font-heading` text alike); `.fraunces-accent` (SOFT 100 · WONK 1) and `.fraunces-caption` (SOFT 100 · WONK 0) are the exceptions, so a plan should be empty unless one of those appears. Background: `docs/audits/2026-09-22-fraunces-axes-audit.md`.
