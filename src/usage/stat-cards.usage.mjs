export const usage = {
  name: 'stat-cards',
  kind: 'pattern',
  summary: 'A responsive grid of KPI cards, each showing a value with a delta badge versus last month.',
  useWhen: [
    'You need a row of KPI cards showing values with period-over-period deltas.',
  ],
  alternatives: [
    { name: 'analytics-charts', when: 'you need to show the trend shape over time, not just the current value and one delta.' },
    { name: 'data-table', when: 'you have more metrics than fit comfortably in a card grid, or need to compare many rows at once.' },
  ],
  rules: [
    {
      id: 'delta-tone-matches-meaning',
      do: "Match badge tone to whether the delta is actually good news for that metric (e.g. rising churn is bad, so it gets destructive tone even though the number itself looks like growth).",
      dont: "Default every rising number to a positive tone — a rising \"Open tickets\" count is bad news, not good.",
      visual: true,
    },
  ],
  a11y: [
    'Each delta includes its sign and unit as visible text ("+12.4%", "−0.3%"), not conveyed by badge color alone.',
    'The comparison period ("vs last month") is stated as visible text next to every card, not just implied by page context.',
  ],
  tokens: ['--card', '--secondary', '--destructive', '--muted-foreground'],
}
