// Install-time docs for the base `quill` item — the one item every consuming app
// installs. The shadcn CLI prints an item's `docs` field on `add`, so this is the
// single moment Quill can hand an app its theming contract. It shipped with no
// `docs` at all, which is why apps were never told that `--yes` does not update a
// changed file (only `--overwrite` does) and silently skips instead.
//
// Generated, never hand-written: the theme and accent lists come from
// src/tokens/themes.mjs and the token source, so a new theme or a changed default
// accent reaches installers without anyone remembering to edit prose. DESIGN.md's
// own Activation section had drifted out of date by one whole theme — that is the
// failure mode this avoids.

import { ALL_MODES, DEFAULT_MODE, DEFAULT_ACCENT } from '../tokens/themes.mjs'
import { tokens } from '../tokens/quill.tokens.mjs'

export const LLMS_URL = 'https://www.quilldesignsystem.com/llms.txt'

export function accentNames() {
  return Object.keys(tokens.accents)
}

export function chartSeriesCount() {
  return Object.keys(tokens.color.chart.series).length
}

/**
 * One paragraph-per-topic string. Kept as prose rather than markdown headings
 * because the CLI prints it into a terminal, not a renderer.
 */
export function renderThemeDocs() {
  const themes = ALL_MODES.map((m) =>
    m.attr === DEFAULT_MODE.attr
      ? `unset (or data-theme="${m.attr}") → ${m.label} (default)`
      : `data-theme="${m.attr}" → ${m.label}`,
  ).join(' · ')

  const accents = accentNames()
    .map((a) => (a === DEFAULT_ACCENT ? `${a} (default)` : a))
    .join(' · ')

  return [
    `Themes — set data-theme on <html>: ${themes}. ${ALL_MODES.length} themes in total.`,

    `Accents — set data-accent on <html>, independently of the theme: ${accents}. The accent drives links, eyebrows, focus rings and accent italics. The two attributes are separate axes; a dark ground and an accent choice do not constrain each other.`,

    `Runtime contract — the theme-selector block owns both attributes. After hydration it reads localStorage ("quill-theme" and "quill-accent") and stamps <html>. Prerendered markup is always ${DEFAULT_MODE.label} + ${DEFAULT_ACCENT}, so server output and first paint agree.`,

    `Charts — use the chart tokens (--chart-series-1..${chartSeriesCount()}, the sequential and diverging ramps), never raw pigments. Assign series colours in that fixed order and never reorder or cycle survivors when a filter drops one: the order is what keeps the palette distinguishable under all three dichromacies.`,

    `Fonts — Raleway for body, Fraunces for display. The theme file already @imports both from Google Fonts, so no next/font setup is needed; loading them again under a different family name is what makes the theme's literal font-family names fail to match.`,

    `Updating — re-run with --overwrite, not --yes. On a file you have changed, --yes does not overwrite: it prompts in a terminal and silently skips when non-interactive.`,

    `Full machine-readable reference for agents: ${LLMS_URL}. Per-component usage guides at /usage/<name>.md.`,
  ].join(' ')
}
