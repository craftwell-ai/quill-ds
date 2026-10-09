# command-palette (pattern)

A searchable ⌘K command palette with grouped actions, recent items, and keyboard shortcuts.

### When to use
- You need a searchable ⌘K launcher for actions and quick navigation.

### Reach for instead
- **command** — when the list is embedded in the page (settings search) or needs groups and behaviour the finished launcher does not have, so you build it from Command parts. Use command-palette for the ready-made ⌘K overlay.
- **search-results** — when search results should live inline on the page, not in a global keyboard-triggered overlay.
- **dropdown-menu** — when the list of options is small and tied to a specific trigger element, not a global searchable launcher.

### Rules
- **Do:** Group items into labeled sections (Actions, Recent) so a long list stays scannable. **Don't:** Dump every possible command into one flat, unlabeled list.

### Accessibility
- CommandInput is the palette's real search field — typing filters the list live, and arrow keys move focus through CommandItem rows without a mouse.
- Keyboard shortcuts (CommandShortcut) are supplementary hints, not the only way to trigger an action — every item is also reachable by typing its label and pressing Enter.

### Design tokens
`--border` · `--card` · `--muted-foreground`

