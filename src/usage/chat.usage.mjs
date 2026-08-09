export const usage = {
  name: 'chat',
  kind: 'pattern',
  summary: 'A one-on-one messaging panel — contact header, message bubbles, and a composer input.',
  useWhen: [
    'You need a one-on-one messaging panel with a contact header, bubbles, and a composer.',
  ],
  alternatives: [
    { name: 'list-detail', when: 'you need a list of conversations alongside the open thread, not just the single open thread.' },
    { name: 'notifications', when: "the messages are one-way system alerts, not a two-way conversation with someone." },
  ],
  rules: [
    {
      id: 'align-by-sender',
      do: "Align the current user's messages to one side (right) and the other party's to the other (left) — position is the primary cue for who said what.",
      dont: 'Rely on color alone to distinguish sender — pair it with consistent alignment.',
      visual: true,
    },
  ],
  a11y: [
    'The composer\'s Input has an explicit aria-label ("Message") since there\'s no visible <label> in this compact layout.',
    'The send button is icon-only with an aria-label ("Send") — never ship it without one.',
  ],
  tokens: ['--border', '--card', '--primary', '--muted'],
}
