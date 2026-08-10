# activity-feed (pattern)

A card timeline of recent events — avatar, action text, and a relative timestamp per entry.

### When to use
- You need to show a chronological history of what happened — recent events with who, what, and when.

### Reach for instead
- **notifications** — when the events need an unread/read state and a mark-all-read action, not just a read-only history.
- **data-table** — when the events are really records you need to filter, sort, or act on, not just skim chronologically.

### Rules
- **Do:** Use relative timestamps ("2 hours ago") for recent activity — they read faster than absolute dates. **Don't:** Force users to parse a full timestamp for something that happened minutes ago.

### Accessibility
- The timeline is a real &lt;ol> — event order is semantic, not just visual.
- Each avatar's initials are the accessible fallback content; the icon next to the timestamp is decorative (aria-hidden).

### Design tokens
`--card` · `--border` · `--muted-foreground`

