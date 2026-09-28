# dropdown-menu (component)

A click-triggered list of actions anchored to a visible button, with full keyboard navigation and typeahead.

### When to use
- You need a set of actions or choices behind one visible trigger button — a row's "more actions" menu, a settings menu.

### Reach for instead
- **context-menu** — when the action set is a secondary, right-click-only affordance rather than something driven by a visible trigger button.
- **menubar** — when you need a persistent horizontal strip of always-visible top-level menus, not a single dropdown.

### Rules
- **Do:** Give an icon-only trigger (e.g. a "more actions" icon button) an explicit aria-label, the way the more_horiz trigger uses "More actions." **Don't:** Ship an icon-only trigger with no aria-label — there is no visible text for screen readers to fall back on.
- **Do:** Group related items with DropdownMenuLabel and DropdownMenuSeparator; keep the menu to roughly 8 items. **Don't:** Run every action together in one flat, ungrouped list — long unstructured menus are hard to scan.
- **Do:** Put destructive items last, separated from routine actions with DropdownMenuSeparator. **Don't:** Mix a destructive item in with routine actions with no separator to set it apart.

### Accessibility
- Renders role="menu" with roving keyboard focus — arrow keys move between items, typeahead jumps to a matching label, Escape closes and returns focus to the trigger.
- closeOnClick defaults to true per item — set it to false on a DropdownMenuCheckboxItem or DropdownMenuItem that should stay open after selection.
- Base UI keeps the popup mounted through its closing transition; code that asserts on menu absence should wait for it to fully unmount, not just for the close click.

### Design tokens
`--popover` · `--shadow-md` · `--destructive` · `--radius-lg`

