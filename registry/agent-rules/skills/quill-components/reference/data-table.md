# data-table (pattern)

A filterable members table with a toolbar, ToneBadge status pills, and a per-row actions menu.

### When to use
- You need a filterable, actionable table of records with tone-mapped status pills and row actions.

### Reach for instead
- **activity-feed** — when you want a read-only chronological list, not sortable/filterable records with row actions.
- **kanban** — when the records are better organized by status columns than by table rows.

### Rules
- **Do:** Give every icon-only row-action button a per-row aria-label (e.g. "Actions for Ada Lovelace"), not a generic one. **Don't:** Ship a table full of icon-only buttons that all announce as the same unlabeled button to a screen reader.

### Accessibility
- Status is conveyed by the ToneBadge's text, not its tone alone ("Active" vs "Invited" read as different words, not just moss vs gold).
- The actions column header uses a visually-hidden ("sr-only") label instead of empty text, so the column still has an accessible name.

### Design tokens
`--border` · `--muted` · `--moss` · `--moss-deep` · `--gold` · `--gold-text`

