# dashboard (pattern)

An app shell with sidebar navigation, a search header, and KPI stat cards.

### When to use
- You need a full application home — sidebar, search header, and KPI cards.

### Reach for instead
- **sidebar-nav** — when you need the collapsible icon-sidebar variant with grouped menus, not this fixed-width text sidebar.
- **stat-cards** — when you only need the KPI row, not the full shell around it.

### Rules
- **Do:** Give the current nav item a distinct active state (background + text color), not just a subtle underline. **Don't:** Leave every nav item looking identical — users lose track of where they are.

### Accessibility
- Nav buttons use both background color and text color for the active state, not a single subtle cue easy to miss.
- The notifications button is icon-only with an explicit aria-label, consistent with every other icon-only trigger in the catalog.

### Design tokens
`--sidebar` · `--accent` · `--accent-foreground` · `--border`

