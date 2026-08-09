# menubar (component)

A desktop application-style menu strip — a row of always-visible top-level menus, each opening its own dropdown on click.

### When to use
- You need a persistent horizontal row of top-level menus — editor toolbars, desktop-app chrome — not a single button-triggered menu.

### Reach for instead
- **dropdown-menu** — when you only need one menu button, not a horizontal strip of them.
- **navigation-menu** — when the row is public site or marketing navigation rather than desktop application commands.

### Rules
- **Do:** Reach for Menubar only for desktop application-style command strips — editor toolbars, app chrome. **Don't:** Use Menubar for public site navigation — it reads as an unfamiliar desktop-app metaphor for visitors; use NavigationMenu instead.
- **Do:** Group related commands with MenubarSeparator inside each menu, the way File separates New/Open from Save/Export. **Don't:** Run every command together with no separator — a long flat list gives users no visual grouping to scan.

### Accessibility
- The strip itself is a menu bar container; arrow keys move focus horizontally between top-level triggers, matching desktop app menu conventions.
- Each MenubarMenu reuses the DropdownMenu primitive underneath — same role="menu" popup, same roving keyboard focus, same Escape-to-close behavior.
- Escape closes the open menu and returns focus to its trigger; the horizontal strip itself keeps focus rather than losing it.

### Design tokens
`--popover` · `--shadow-md` · `--border`

