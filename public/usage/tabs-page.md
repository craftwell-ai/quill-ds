# tabs-page (pattern)

A tabbed settings page with account, notifications, and security panels.

### When to use
- You need a settings screen split into account, notifications, and security tabs.

### Reach for instead
- **settings** — when everything fits on one page without needing to split into separate tabbed sections.
- **wizard** — when the sections are sequential setup steps completed once, not independent settings a user revisits and edits freely.

### Rules
- **Do:** Set defaultValue to whichever tab users need most often (here, Account) so the page isn't blank on load. **Don't:** Leave no tab selected by default and force an extra click before any content shows.

### Accessibility
- TabsTrigger/TabsList follow the standard tab-panel pattern — arrow keys move between tabs, and only the active panel's content is in the accessibility tree.
- Each tab panel is its own Card with its own heading, so switching tabs doesn't just swap unlabeled content underneath a single ambiguous heading.

### Design tokens
`--card` · `--muted` · `--border` · `--primary`

