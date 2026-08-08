# badge-on-card (pattern)

Default, secondary, and destructive badges shown together on a card surface.

### When to use
- You need to show status or category badges attached to a content card.

### Reach for instead
- **tone-badge** — when you need a badge whose color is driven by a semantic tone token rather than the three fixed variants here.
- **data-table** — when the badges are actually per-row status in a list of records, not a single card's labels.

### Rules
- **Do:** Reserve the destructive variant for a status that actually needs attention (blocked, failed, overdue). **Don't:** Use destructive styling for emphasis on a badge that isn't actually a warning.

### Accessibility
- Badges are inline <span> elements with no independent accessible name beyond their visible text — never ship an icon-only badge without one.
- Destructive badges on a card surface must clear the same 4.5:1 text contrast as any other text (a past regression here hit 4.45:1).

### Design tokens
`--primary` · `--secondary` · `--destructive` · `--card`

