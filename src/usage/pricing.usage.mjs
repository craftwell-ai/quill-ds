export const usage = {
  name: 'pricing',
  kind: 'pattern',
  summary: 'A three-tier pricing grid with a highlighted popular plan, feature checklists, and per-plan calls to action.',
  useWhen: [
    'You need a tiered pricing grid with a highlighted plan and feature checklists.',
  ],
  alternatives: [
    { name: 'feature-section', when: "you're describing capabilities in general, not comparing specific paid tiers against each other." },
    { name: 'order-summary', when: 'the user has already chosen a plan and is now reviewing a specific purchase, not comparing options.' },
  ],
  rules: [
    {
      id: 'highlight-exactly-one-plan',
      do: 'Mark exactly one plan as featured (ring + Popular badge) to guide the decision.',
      dont: 'Feature more than one plan, or none — either dilutes the recommendation this pattern exists to make.',
      visual: false,
    },
  ],
  a11y: [
    'The "Popular" badge is visible text, not conveyed by the ring border alone — a screen-reader user still learns which plan is recommended.',
    "Each plan's feature list uses a check icon plus visible text per line, not an icon-only list with no textual confirmation of what's included.",
  ],
  tokens: ['--card', '--ring', '--primary', '--muted-foreground'],
}
