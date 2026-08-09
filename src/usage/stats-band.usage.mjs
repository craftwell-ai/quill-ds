export const usage = {
  name: 'stats-band',
  kind: 'pattern',
  summary: 'A marketing band of headline statistics separated by vertical dividers on a card background.',
  useWhen: [
    'You need a marketing band of headline statistics separated by dividers.',
  ],
  alternatives: [
    { name: 'stat-cards', when: 'each number needs its own card with a period-over-period delta — this pattern is a single flat band with no per-item chrome or comparison.' },
    { name: 'feature-section', when: "you're describing capabilities, not reporting numbers." },
  ],
  rules: [
    {
      id: 'follow-the-accent-not-a-fixed-pigment',
      do: "Color headline numbers from the accent-driven token (--accent-pigment), so they follow the page's data-accent like every other emphasis element.",
      dont: 'Hardcode a fixed pigment (e.g. --terracotta) for the numbers — that breaks when a consumer sets a different accent.',
      visual: false,
    },
    {
      id: 'pair-every-number-with-a-label',
      do: 'Pair every headline number with its own visible label directly beneath it (e.g. "Components"), as every stat in this band does.',
      dont: 'Ship a bare number with no label — a viewer has no way to tell what it counts.',
      visual: true,
    },
  ],
  a11y: [
    'Dividers between stats are decorative and hidden on narrow viewports where the layout stacks — the numbers and labels alone carry the meaning.',
    'Every number is paired with its own visible label directly beneath it ("Components", "Patterns") — a bare number is never left to speak for itself.',
  ],
  tokens: ['--card', '--accent-pigment', '--muted-foreground'],
}
