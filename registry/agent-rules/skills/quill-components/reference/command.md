# command (component)

A keyboard-first search palette — embed inline for settings search, or wrap in CommandDialog for a ⌘K-style command palette.

### When to use
- You need a searchable, keyboard-navigable list of actions or destinations — settings search, a ⌘K command palette.

### Reach for instead
- **combobox** — when you need a single searchable field bound to a form value, not a multi-group action palette.
- **dropdown-menu** — when the action set is short enough for a plain click-triggered list, with no need for search.

### Rules
- **Do:** Group related commands under a CommandGroup heading ("Files", "Settings"), separated by CommandSeparator. **Don't:** List every command flat with no CommandGroup heading — a long palette with no structure is hard to scan or search meaningfully.
- **Do:** Always include CommandEmpty ("No results found.") — cmdk shows it automatically when a search matches nothing. **Don't:** Omit CommandEmpty — an unmatched search then renders a silently blank list with no explanation.
- **Do:** Embed Command inline for a settings-search panel, or wrap it in CommandDialog for a ⌘K palette — CommandDialog is Dialog underneath, so it inherits Dialog's focus trap and Escape-to-close. **Don't:** Reimplement the ⌘K modal shell yourself instead of using CommandDialog — you'd have to re-earn Dialog's focus management by hand.

### Accessibility
- The input drives a listbox: arrow keys move the highlighted item, Enter selects it, and typed text filters the list live.
- CommandDialog defaults showCloseButton to false and gives the dialog a sr-only title/description, since the search input itself is the primary, visible entry point.
- CommandSeparator is marked aria-hidden — it is a purely visual divider, not a semantic list boundary.

### Design tokens
`--popover` · `--border` · `--radius-xl`

