# list-detail (pattern)

An inbox-style split view — a selectable message list beside a detail pane with archive and delete actions.

### When to use
- You need an inbox-style split view pairing a selectable list with a detail pane.

### Reach for instead
- **mail-shell** — when you need a fuller mail client — search, reply composer, forward — not just list-and-read.
- **chat** — when the conversation is a live back-and-forth thread, not discrete messages you select and read one at a time.

### Rules
- **Do:** Keep the selected thread visually marked in the list (background fill) while its detail is open, so context isn't lost. **Don't:** Let the list's selection state go stale or unmarked once a thread is open in the detail pane.

### Accessibility
- Each thread in the list is a real, focusable <button>, not a clickable <div> with no keyboard access.
- Archive and Delete are icon-only buttons with explicit aria-labels, not bare icons with no accessible name.

### Design tokens
`--border` · `--accent` · `--muted-foreground`

