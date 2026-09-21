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
```

Matching is by the first 40 characters of the text; tolerances are 0.06px on size, 0.6 points on line height, 0.15 on tracking. A layer whose code twin is a bare `text-*` utility is proposed for the generated `Text/<size>` style; anything else for explicit values. `.figma-type-audit/` is scratch — do not commit it.
