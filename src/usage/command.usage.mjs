export const usage = {
  name: 'command',
  kind: 'component',
  summary: 'A keyboard-first search palette — embed inline for settings search, or wrap in CommandDialog for a ⌘K-style command palette.',
  useWhen: [
    'You need a searchable, keyboard-navigable list of actions or destinations — settings search, a ⌘K command palette.',
  ],
  alternatives: [
    { name: 'combobox', when: 'you need a single searchable field bound to a form value, not a multi-group action palette.' },
    { name: 'dropdown-menu', when: 'the action set is short enough for a plain click-triggered list, with no need for search.' },
  ],
  rules: [
    {
      id: 'group-with-headings',
      do: 'Group related commands under a CommandGroup heading ("Files", "Settings"), separated by CommandSeparator.',
      dont: 'List every command flat with no CommandGroup heading — a long palette with no structure is hard to scan or search meaningfully.',
      visual: true,
    },
    {
      id: 'always-render-command-empty',
      do: 'Always include CommandEmpty ("No results found.") — cmdk shows it automatically when a search matches nothing.',
      dont: 'Omit CommandEmpty — an unmatched search then renders a silently blank list with no explanation.',
      visual: false,
    },
    {
      id: 'embed-inline-or-dialog',
      do: 'Embed Command inline for a settings-search panel, or wrap it in CommandDialog for a ⌘K palette — CommandDialog is Dialog underneath, so it inherits Dialog\'s focus trap and Escape-to-close.',
      dont: 'Reimplement the ⌘K modal shell yourself instead of using CommandDialog — you\'d have to re-earn Dialog\'s focus management by hand.',
      visual: false,
    },
  ],
  a11y: [
    'The input drives a listbox: arrow keys move the highlighted item, Enter selects it, and typed text filters the list live.',
    'CommandDialog defaults showCloseButton to false and gives the dialog a sr-only title/description, since the search input itself is the primary, visible entry point.',
    'CommandSeparator is marked aria-hidden — it is a purely visual divider, not a semantic list boundary.',
  ],
  tokens: ['--popover', '--border', '--radius-xl'],
}
