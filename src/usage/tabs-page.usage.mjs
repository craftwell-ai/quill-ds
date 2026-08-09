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
      id: 'trigger-value-matches-content',
      do: "Keep each TabsTrigger's `value` identical to its TabsContent's `value` when you rename a section (here, `account`/`notifications`), so the tab a user lands on always has a panel to show.",
      dont: "Rename a TabsTrigger's `value` (e.g. Notifications → Alerts) without updating its TabsContent to match — the renamed tab still highlights as active since its own value is valid, but the panel underneath renders empty because no content shares that value anymore.",
      visual: true,
    },
  ],
  a11y: [
    "TabsTrigger/TabsList follow the standard tab-panel pattern — arrow keys move between tabs, and only the active panel's content is in the accessibility tree.",
    "Each tab panel is its own Card with its own heading, so switching tabs doesn't just swap unlabeled content underneath a single ambiguous heading.",
  ],
  tokens: ['--card', '--muted', '--border', '--primary'],
}
