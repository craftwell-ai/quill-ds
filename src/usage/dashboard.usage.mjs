export const usage = {
  name: 'dashboard',
  kind: 'pattern',
  summary: 'An app shell with sidebar navigation, a search header, and KPI stat cards.',
  useWhen: [
    'You need a full application home — sidebar, search header, and KPI cards.',
  ],
  alternatives: [
    { name: 'sidebar-nav', when: 'you need the collapsible icon-sidebar variant with grouped menus, not this fixed-width text sidebar.' },
    { name: 'stat-cards', when: 'you only need the KPI row, not the full shell around it.' },
  ],
  rules: [
    {
      id: 'mark-the-active-section',
      do: 'Give the current nav item a distinct active state (background + text color), not just a subtle underline.',
      dont: 'Leave every nav item looking identical — users lose track of where they are.',
      visual: true,
    },
  ],
  a11y: [
    'Nav buttons use both background color and text color for the active state, not a single subtle cue easy to miss.',
    'The notifications button is icon-only with an explicit aria-label, consistent with every other icon-only trigger in the catalog.',
  ],
  tokens: ['--sidebar', '--accent', '--accent-foreground', '--border'],
}
