export const usage = {
  name: 'navbar',
  kind: 'pattern',
  summary: 'A top navigation bar with brand wordmark, a responsive link list, and sign-in / get-started actions.',
  useWhen: [
    'You need a top navigation bar with wordmark, links, and sign-in / get-started actions.',
  ],
  alternatives: [
    { name: 'sidebar-nav', when: 'primary navigation belongs in a persistent side rail for an app, not a top bar for a marketing site.' },
    { name: 'command-palette', when: 'navigation is keyboard-driven and searchable, not a fixed row of links.' },
  ],
  rules: [
    {
      id: 'one-primary-cta',
      do: 'Keep "Get started" as the one default-variant (primary) button; "Sign in" stays ghost so it doesn\'t compete.',
      dont: 'Style both actions as equally prominent primary buttons.',
      visual: false,
    },
  ],
  a11y: [
    "The link list is hidden on narrow viewports (hidden md:flex) — an installed version needs its own mobile menu trigger, since this story doesn't render one.",
    'Nav links are real <a> elements, not buttons styled to look like links — they are navigations, and should read as such to assistive tech.',
  ],
  tokens: ['--background', '--border', '--muted-foreground', '--accent'],
}
