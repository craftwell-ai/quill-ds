export const usage = {
  name: 'feature-section',
  kind: 'pattern',
  summary: 'A marketing section with an editorial heading and a three-column feature grid.',
  useWhen: [
    'You need to present product features in an editorial multi-column grid.',
  ],
  alternatives: [
    { name: 'stats-band', when: "you're presenting numbers, not descriptive feature callouts with icons and body text." },
    { name: 'pricing', when: 'the features are tied to specific paid tiers, not the product as a whole.' },
  ],
  rules: [
    {
      id: 'three-is-the-target',
      do: 'Keep the grid to three (or a multiple of three) features so it reads evenly across the row.',
      dont: 'Let an uneven feature count leave a dangling, unbalanced last row on wide screens.',
      visual: false,
    },
  ],
  a11y: [
    "Each feature's icon is paired with a real heading (<h3>) and body text — the icon alone never carries the feature's meaning.",
    'Feature headings use a real heading level (<h3>) nested under the section\'s own <h2>, keeping the outline logical for screen-reader navigation.',
  ],
  tokens: ['--muted', '--primary', '--muted-foreground'],
}
