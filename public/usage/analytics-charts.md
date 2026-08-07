# analytics-charts (pattern)

A dashboard pair — an area chart of audience growth beside a bar chart of weekly sales, each on its own card.

### When to use
- You need a dashboard view of trends over time — an area chart plus a bar chart on card surfaces.

### Reach for instead
- **stat-cards** — when you need at-a-glance numbers, not a trend shape — a single KPI reads faster as a number than a chart.
- **data-table** — when the audience needs to inspect exact values per row, not the shape of change over time.

### Rules
- **Do:** Color each series from the chart token set (--chart-1…--chart-5), assigned in a fixed order. **Don't:** Hardcode a raw accent pigment (--terracotta, --moss, --indigo…) for a series — some pairs are documented as failing colorblind-distinguishability.

### Accessibility
- Each chart has a ChartTooltip that surfaces exact values on hover/focus — the visual shape alone is never the only way to read the data.
- A chart's legend (ChartLegend) ties color to series name — color is never the only signal distinguishing readers from subscribers.

### Design tokens
`--card` · `--chart-1` · `--chart-2` · `--chart-3` · `--muted-foreground`

