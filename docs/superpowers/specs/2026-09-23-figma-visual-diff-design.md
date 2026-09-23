# Figma ↔ Storybook visual diff (CRA-224, Parity 6)

**Decided 2026-09-23.** Pages only (patterns + templates — 50 pairs); `pixelmatch` as a dev
dependency (`pngjs` too, explicitly — it was only a transitive dependency); report-only until the
tolerance is tuned on real pairs, then strict. Runs nightly in `figma-parity.yml` as its own job.

## Why

The structural parity checks compare values (tokens, bindings, text metrics) and miss what a
picture shows: a wrong opacity, a missing ring, a layout that reflowed. This closes the last
layer of CRA-217 for the designer's trust in Figma. It is not an agent-readiness item.

## What it does

`node scripts/figma-visual-diff.mjs [--out <dir>] [--sb <static Storybook dir>] [--pairs a,b]
[--strict] [--update-baseline]`

1. **Pairs.** Every mirrored pattern page and template in `figma/sync-state.json` (frame id) →
   its canonical Storybook story: the first story of the block's pattern stories that is not
   `--docs` or a Do/Don't pair, preferring `--<name>` or `--default`. Story ids come from the
   static build's `index.json` through `scripts/figma-type-audit/map-stories.mjs`.
2. **Figma side.** `GET /v1/images/:key?ids=…&format=png&scale=2` in batches of 20 with
   `FIGMA_TOKEN` (CI secret; locally `.env` via `node --env-file=.env`). Download each PNG.
3. **Storybook side.** Static build (`storybook build`), a tiny static server, Playwright
   Chromium at `deviceScaleFactor: 2`, viewport width = Figma frame width + the preview's
   48 px canvas padding, `iframe.html?id=<story>&viewMode=story&globals=theme:light`, wait for
   the root and `document.fonts.ready`, screenshot the story's root element (first child of the
   theme wrapper).
4. **Compare.** Both images padded to the union size on Dawn paper (`#F5EDDD`), `pixelmatch`
   with `threshold 0.2, includeAA: false` (anti-aliased pixels ignored — fonts rasterise
   differently in Figma and Chromium). Per pair: `diffPct` (differing pixels / union pixels),
   `sizeDelta` (w/h difference in CSS px), and the three PNGs plus a side-by-side strip
   (Figma | Storybook | diff).
5. **Baseline.** `figma/visual-baseline.json` maps pair → the accepted `diffPct` and size,
   written with `--update-baseline` after a human has read the strips. A run compares each
   pair against its baseline: a **regression** is `diffPct` more than 1.0 point above the
   accepted value, or a size change of more than 8 px. New pairs without a baseline are
   reported as "unbaselined", never as failures.
6. **Report.** `<out>/summary.md` (a table: pair, diffPct, baseline, size, verdict, links to the
   strip) and `<out>/summary.json`; in CI the markdown goes to `GITHUB_STEP_SUMMARY` and the
   whole `<out>` folder is an artifact. Exit code: 0 in report-only; with `--strict`, 1 on any
   regression.

## Where it runs

A second job `visual` in `.github/workflows/figma-parity.yml`, `needs: parity`, on the nightly
schedule and on `workflow_dispatch`, `continue-on-error: true` until strict: checkout, Node 24,
`npm ci`, `npx playwright install chromium --with-deps`, `npm run build-storybook -- -o
.visual/sb --quiet`, `node scripts/figma-visual-diff.mjs --out .visual/out --sb .visual/sb`,
upload `.visual/out` (14 days), append the summary. Skips cleanly without `FIGMA_TOKEN`.

## Guards

`scripts/figma-visual-diff.test.mjs` covers the pure parts with synthetic PNGs and no network:
canonical-story choice; padding to the union size; an identical pair → 0 %; a pair with a
known differing block → the expected percentage; the verdict function (regression / ok /
unbaselined) at the thresholds above; summary rendering. The first real run is committed as
the baseline together with its numbers in the CHANGELOG.

## Not in v1

Component twins (variant sets are not one story), a per-pair tolerance override (add it if a
pair proves noisy), and Dusk pairs (Figma holds four modes; the pattern pages are Dawn).
