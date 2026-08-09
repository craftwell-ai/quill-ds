# empty (component)

An empty-state block for zero-data surfaces — icon, title, description, and a primary action, centered in the available space.

### When to use
- A list, table, or search result surface has no data to show yet and you need to explain why, plus give the user a way to fix it (create, upload, search again).

### Reach for instead
- **skeleton** — when the surface is still loading real data and not yet confirmed empty — use Skeleton for the loading state, and switch to Empty only once loading finishes with zero results.

### Rules
- **Do:** Pair every Empty with a title, a short description, and at least one primary action, as both stories here do, so the user has a next step. **Don't:** Show an icon and a title alone with no description or action — the user learns there's nothing here but not what to do about it.
- **Do:** Pick an EmptyMedia icon that matches the content type — a book for courses, a folder for files. **Don't:** Reuse the same generic icon for every empty state across the app regardless of what's missing — it stops carrying any information.

### Accessibility
- Empty, EmptyHeader, EmptyContent, and EmptyMedia are all plain `<div>`s with no built-in role; EmptyTitle is a styled `<div>`, not a heading, so add real heading markup inside it when the empty state should appear in the page's heading outline.
- EmptyDescription renders as a `<div>` in the current component (its prop type is inherited from `<p>`, but the rendered tag is `<div>`) — treat it as body text and keep it as the second read after the title, before any action buttons.

### Design tokens
`--muted` · `--muted-foreground` · `--foreground` · `--border`

