# kanban (pattern)

A three-column kanban board with card counts, tagged task cards, and an add-card affordance per column.

### When to use
- You need to manage work across status columns with draggable, tagged task cards.

### Reach for instead
- **data-table** — when status is one column among many sortable fields — a table reads better than columns once you need to sort or filter across many records.
- **onboarding** — when the steps are a single sequential checklist, not parallel work items across independent columns.

### Rules
- **Do:** Keep each column's card-count badge in sync with its actual card list — it's a running total, not a caption. **Don't:** Let the count badge drift out of sync when cards move between columns.

### Accessibility
- This story renders a static layout only — a real implementation needs its own keyboard-operable way to move a card between columns (e.g. a menu action), since drag-and-drop alone excludes keyboard and screen-reader users.
- Each card's assignee avatar shows initials as real text content, not just a colored circle with no accessible name.

### Design tokens
`--muted` · `--border` · `--card` · `--secondary`

