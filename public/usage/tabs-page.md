# tabs-page (pattern)

A tabbed settings page with account, notifications, and security panels.

### When to use
- You need a settings screen split into account, notifications, and security tabs.

### Reach for instead
- **settings** — when everything fits on one page without needing to split into separate tabbed sections.
- **wizard** — when the sections are sequential setup steps completed once, not independent settings a user revisits and edits freely.

### Rules
- **Do:** Keep each TabsTrigger's `value` identical to its TabsContent's `value` when you rename a section (here, `account`/`notifications`), so the tab a user lands on always has a panel to show. **Don't:** Rename a TabsTrigger's `value` (e.g. Notifications → Alerts) without updating its TabsContent to match — the renamed tab still highlights as active since its own value is valid, but the panel underneath renders empty because no content shares that value anymore.

### Accessibility
- TabsTrigger/TabsList follow the standard tab-panel pattern — arrow keys move between tabs, and only the active panel's content is in the accessibility tree.
- Each tab panel is its own Card with its own heading, so switching tabs doesn't just swap unlabeled content underneath a single ambiguous heading.

### Design tokens
`--card` · `--muted` · `--border` · `--primary`

