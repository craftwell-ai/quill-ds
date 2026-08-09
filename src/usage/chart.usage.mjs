export const usage = {
  name: 'chart',
  kind: 'component',
  summary: 'A themeable wrapper around Recharts — ChartContainer wires a config object to CSS custom properties per series, plus a matching ChartTooltip and ChartLegend.',
  useWhen: [
    'You need a bar, line, area, or other Recharts chart that automatically re-colors across all four Quill themes and stays colorblind-safe.',
  ],
  alternatives: [
    { name: 'data-table', when: 'the audience needs to read or compare exact values, not the shape of change — a table beats a chart for precision.' },
    { name: 'stat-cards', when: 'you need a single at-a-glance number, not a trend shape.' },
  ],
  rules: [
    {
      id: 'chart-tokens-fixed-order',
      do: 'Color each series from the chart token set in fixed order (--chart-1 first, then --chart-2, …) via `config.color`, as chartConfig does here.',
      dont: 'Hardcode a raw accent pigment (e.g. `#BC6751`, `var(--terracotta)`) for a series, or reorder which chart-N a survivor gets when a filter drops one — raw pigments fail the colorblind-distinguishability checks these tokens were built to pass.',
      visual: true,
    },
    {
      id: 'chart-tooltip-required',
      do: 'Always include ChartTooltip (with ChartTooltipContent), as every story here does, so hovering or focusing a data point surfaces its exact value.',
      dont: "Ship a chart with no ChartTooltip — the shape communicates a trend, but exact values become invisible to anyone who can't precisely read pixel height.",
      visual: false,
    },
    {
      id: 'prefer-color-over-theme',
      do: 'Prefer `color: "var(--chart-N)"` in a series config entry — the tokens already re-cut correctly for all four Quill themes.',
      dont: 'Reach for the `theme` field (`{ light, dark }`) expecting it to map Quill\'s four themes one-to-one — it only distinguishes two CSS buckets (light vs. the two dark themes), so hand-authored hex pairs there won\'t track Quill\'s palette the way a token reference does.',
      visual: false,
    },
  ],
  a11y: [
    "Each chart needs a ChartTooltip so exact values are available on hover and keyboard focus, not just visually inferred from the shape.",
    "A chart's legend (ChartLegend/ChartLegendContent) ties color to series name in text — color is never the only signal distinguishing series.",
  ],
  tokens: ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5', '--chart-seq-1', '--chart-seq-5', '--chart-div-1', '--chart-div-5'],
}
