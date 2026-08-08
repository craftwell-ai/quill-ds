export const usage = {
  name: 'login-split-panel',
  kind: 'pattern',
  summary: 'A full-page, branded sign-in — a testimonial panel beside an email/password form with a magic-link option.',
  useWhen: [
    'You need a branded full-page sign-in with a testimonial side panel and magic-link option.',
  ],
  alternatives: [
    { name: 'login', when: 'the sign-in is an embedded card inside an existing page shell, not its own full page.' },
    { name: 'login-minimal', when: "you don't have a testimonial or brand story worth the real estate — go bare instead." },
  ],
  rules: [
    {
      id: 'panel-collapses-on-mobile',
      do: 'Let the brand panel drop out on small viewports and let the form take the full width.',
      dont: 'Force the two-column grid at phone widths — the testimonial panel has no room to be legible.',
      visual: false,
    },
  ],
  a11y: [
    "The brand panel's blockquote is decorative marketing copy; the actual auth task lives entirely in the form column, so screen-reader users lose nothing when it collapses on mobile.",
    'Magic-link is offered as a real secondary action (its own button), not a hidden footnote.',
  ],
  tokens: ['--primary', '--primary-foreground', '--input', '--ring', '--border'],
}
