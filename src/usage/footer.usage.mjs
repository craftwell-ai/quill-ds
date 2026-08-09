export const usage = {
  name: 'footer',
  kind: 'pattern',
  summary: 'A marketing footer with brand blurb, link columns, and legal links.',
  useWhen: [
    'You need a site-wide footer with link columns, a brand blurb, and legal links.',
  ],
  alternatives: [
    { name: 'sidebar-nav', when: 'the links are primary in-app navigation, not secondary site-wide links at the page\'s end.' },
    { name: 'navbar', when: 'the links belong at the top of the page as primary navigation, not the bottom as reference.' },
  ],
  rules: [
    {
      id: 'group-links-by-nav-landmark',
      do: 'Wrap each link column in its own <nav aria-label>, as this block already does, so screen-reader users can jump between them.',
      dont: 'Render link columns as bare, unlabeled <div> lists that all announce as one undifferentiated block.',
      visual: false,
    },
    {
      id: 'separate-legal-row-with-a-divider',
      do: 'Separate the bottom legal row (copyright, Privacy, Terms) from the link columns with a visible Separator, as this block does.',
      dont: 'Rely on extra margin alone with no divider — the legal row reads as just another link column, not a distinct footer end-cap.',
      visual: true,
    },
  ],
  a11y: [
    'Each link column is a real <nav> with an aria-label matching its visible heading (e.g. "Product", "Resources"), not a generic landmark.',
    'The bottom legal row (copyright, Privacy, Terms) is visually and structurally separated from the link columns by a Separator, not just extra margin.',
  ],
  tokens: ['--background', '--muted-foreground', '--border'],
}
