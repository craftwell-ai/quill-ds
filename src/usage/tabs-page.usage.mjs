export const usage = {
  name: 'tabs-page',
  kind: 'pattern',
  summary: 'A tabbed settings page with account, notifications, and security panels.',
  useWhen: [
    'You need a settings screen split into account, notifications, and security tabs.',
  ],
  alternatives: [
    { name: 'settings', when: "everything fits on one page without needing to split into separate tabbed sections." },
    { name: 'wizard', when: 'the sections are sequential setup steps completed once, not independent settings a user revisits and edits freely.' },
  ],
  rules: [
    {
      id: 'default-to-the-most-common-tab',
      do: "Set defaultValue to whichever tab users need most often (here, Account) so the page isn't blank on load.",
      dont: 'Leave no tab selected by default and force an extra click before any content shows.',
      visual: false,
    },
  ],
  a11y: [
    "TabsTrigger/TabsList follow the standard tab-panel pattern — arrow keys move between tabs, and only the active panel's content is in the accessibility tree.",
    "Each tab panel is its own Card with its own heading, so switching tabs doesn't just swap unlabeled content underneath a single ambiguous heading.",
  ],
  tokens: ['--card', '--muted', '--border', '--primary'],
}
