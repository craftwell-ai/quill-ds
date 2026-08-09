export const usage = {
  name: 'command-palette',
  kind: 'pattern',
  summary: 'A searchable ⌘K command palette with grouped actions, recent items, and keyboard shortcuts.',
  useWhen: [
    'You need a searchable ⌘K launcher for actions and quick navigation.',
  ],
  alternatives: [
    { name: 'search-results', when: 'search results should live inline on the page, not in a global keyboard-triggered overlay.' },
    { name: 'dropdown-menu', when: 'the list of options is small and tied to a specific trigger element, not a global searchable launcher.' },
  ],
  rules: [
    {
      id: 'group-by-recency-and-type',
      do: 'Group items into labeled sections (Actions, Recent) so a long list stays scannable.',
      dont: 'Dump every possible command into one flat, unlabeled list.',
      visual: true,
    },
  ],
  a11y: [
    "CommandInput is the palette's real search field — typing filters the list live, and arrow keys move focus through CommandItem rows without a mouse.",
    'Keyboard shortcuts (CommandShortcut) are supplementary hints, not the only way to trigger an action — every item is also reachable by typing its label and pressing Enter.',
  ],
  tokens: ['--border', '--card', '--muted-foreground'],
}
