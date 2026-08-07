export const usage = {
  name: 'announcement-banner',
  kind: 'pattern',
  summary: 'Two dismissible announcement banners — an inline bordered page banner and a full-bleed primary-color variant.',
  useWhen: [
    'You need to announce something site-wide with a dismissible banner, either inline or full-bleed.',
  ],
  alternatives: [
    { name: 'alerts', when: 'the message is local to a page section and tied to system status, not a site-wide announcement.' },
    { name: 'cookie-consent', when: 'the banner requires an explicit choice (accept/reject), not just a dismiss.' },
  ],
  rules: [
    {
      id: 'always-dismissible',
      do: 'Give every banner variant its own dismiss button with a specific aria-label (e.g. "Dismiss workshop banner"), not a generic one.',
      dont: 'Ship a banner with no way to dismiss it, or multiple banners sharing one ambiguous "Dismiss" label.',
      visual: false,
    },
  ],
  a11y: [
    "Each banner's dismiss button has a distinct, content-specific aria-label so screen-reader users can tell which banner they're closing when more than one is stacked.",
    "The full-bleed variant's dismiss icon overrides its hover color explicitly (text-primary-foreground) so it stays visible against the primary-color background, not just inheriting a default that might vanish.",
  ],
  tokens: ['--card', '--border', '--primary', '--primary-foreground'],
}
