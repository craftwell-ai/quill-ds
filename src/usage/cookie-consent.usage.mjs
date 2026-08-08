export const usage = {
  name: 'cookie-consent',
  kind: 'pattern',
  summary: 'A cookie consent banner offering accept, reject, and preferences actions.',
  useWhen: [
    'You need a compliance banner offering accept, reject, and preferences choices.',
  ],
  alternatives: [
    { name: 'announcement-banner', when: "the message is informational only and doesn't require an explicit accept/reject decision." },
    { name: 'alerts', when: 'the message is a local, in-page status, not a site-wide compliance notice.' },
  ],
  rules: [
    {
      id: 'reject-is-equally-easy',
      do: '"Reject non-essential" gets the same one-click ease as "Accept all" — both are top-level buttons, not one button plus a buried settings link.',
      dont: "Make rejecting cookies harder to find or reach than accepting them — that's a dark pattern, not a real choice.",
      visual: false,
    },
  ],
  a11y: [
    'All three choices (Accept all, Reject non-essential, Preferences) are real, separately labeled buttons, not one deceptively generic "OK".',
    "The banner's icon is decorative; the actual compliance information is conveyed entirely through the paragraph text, not the icon.",
  ],
  tokens: ['--card', '--border', '--muted-foreground'],
}
