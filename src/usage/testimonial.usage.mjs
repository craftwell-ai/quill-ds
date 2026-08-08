export const usage = {
  name: 'testimonial',
  kind: 'pattern',
  summary: 'A customer-quote card with a serif pull-quote, avatar initials, and attribution.',
  useWhen: [
    'You need a customer-quote card with a serif pull-quote and attribution.',
  ],
  alternatives: [
    { name: 'team-section', when: "you're introducing people, not quoting what a customer said about the product." },
    { name: 'stats-band', when: 'the proof point is a number, not a quote.' },
  ],
  rules: [
    {
      id: 'attribute-every-quote',
      do: 'Pair every quote with a real name, role, and organization — an anonymous quote reads as unverifiable.',
      dont: 'Ship a testimonial with no attribution, or attribution too small/muted to actually read.',
      visual: false,
    },
  ],
  a11y: [
    'The pattern uses real <figure>/<blockquote>/<figcaption> semantics, so the quote and its attribution stay programmatically linked, not just visually adjacent.',
    'The avatar\'s initials are real text content, matching the fallback pattern used everywhere else in the catalog (profile-card, team-section, activity-feed).',
  ],
  tokens: ['--card', '--border', '--muted-foreground'],
}
