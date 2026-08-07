# stat-cards (pattern)

A responsive grid of KPI cards, each showing a value with a delta badge versus last month.

### When to use
- You need a row of KPI cards showing values with period-over-period deltas.

### Reach for instead
- **analytics-charts** — when you need to show the trend shape over time, not just the current value and one delta.
- **data-table** — when you have more metrics than fit comfortably in a card grid, or need to compare many rows at once.

### Rules
- **Do:** Match badge tone to whether the delta is actually good news for that metric (e.g. rising churn is bad, so it gets destructive tone even though the number itself looks like growth). **Don't:** Default every rising number to a positive tone — a rising "Open tickets" count is bad news, not good.

### Accessibility
- Each delta includes its sign and unit as visible text ("+12.4%", "−0.3%"), not conveyed by badge color alone.
- The comparison period ("vs last month") is stated as visible text next to every card, not just implied by page context.

### Design tokens
`--card` · `--secondary` · `--destructive` · `--muted-foreground`

