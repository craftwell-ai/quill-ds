export const usage = {
  name: 'error-404',
  kind: 'pattern',
  summary: 'A full-page 404 error state with go-back and home recovery actions.',
  useWhen: [
    'You need a full-page not-found state with recovery actions.',
  ],
  alternatives: [
    { name: 'empty-state', when: 'the resource exists but is legitimately empty (no items yet), not missing or misrouted.' },
    { name: 'alerts', when: 'the error is recoverable inline on the current page, not a full-page dead end that needs its own route.' },
  ],
  rules: [
    {
      id: 'always-offer-two-ways-out',
      do: 'Offer both a contextual escape (Go back) and an absolute one (Take me home) — never strand the user with only one recovery path.',
      dont: "Leave a 404 page with no action at all, or only a single 'Home' link buried in a header the user has to hunt for.",
      visual: false,
    },
  ],
  a11y: [
    'The page has a real <h1> ("Page not found") — the large "404" numeral above it is decorative display text, not the page\'s accessible name.',
    'Go back and Take me home are two distinct, clearly labeled buttons, not a single ambiguous action.',
  ],
  tokens: ['--background', '--muted-foreground', '--primary'],
}
