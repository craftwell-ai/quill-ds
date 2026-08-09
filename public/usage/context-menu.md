# context-menu (component)

A menu that appears at the pointer on right-click or long-press — a secondary, discoverable-only-by-trying affordance, not a replacement for a visible trigger.

### When to use
- You need a secondary set of actions on an item that most users will discover by right-clicking (desktop) or long-pressing (touch), not a primary action path.

### Reach for instead
- **dropdown-menu** — when the trigger should be a visible button rather than a right-click-only zone.

### Rules
- **Do:** Give the trigger zone a visible affordance and hint text ("Right-click here") — right-click has no visible button, so nothing else tells users the surface is interactive. **Don't:** Make the trigger zone look identical to ordinary static content — users have no way to discover that right-click does anything there.
- **Do:** Keep menus short — group related actions and separate groups with ContextMenuSeparator. Max ~8 items. **Don't:** Flatten a long, ungrouped list of actions into one ContextMenu — right-click menus are for quick, scannable choices.
- **Do:** Put a destructive item (variant="destructive") last, separated from routine actions by ContextMenuSeparator. **Don't:** Mix a destructive item in among routine actions with no separator — a misread click becomes an easy accident.

### Accessibility
- Opens on right-click (desktop) or long-press (touch); once open, arrow keys navigate items and typeahead jumps to a matching label.
- ContextMenuTrigger wraps the target element — its own accessible name/role stays whatever the wrapped element already provides.
- Escape closes the menu and returns focus to the trigger.

### Design tokens
`--popover` · `--shadow-md` · `--destructive` · `--radius-lg`

