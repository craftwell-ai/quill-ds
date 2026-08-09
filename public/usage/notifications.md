# notifications (pattern)

A notifications card listing recent events with icons, timestamps, unread indicators, and a mark-all-read action.

### When to use
- You need a notifications center with unread indicators and a mark-all-read action.

### Reach for instead
- **activity-feed** — when the list is a read-only history with no read/unread state or mark-all action.
- **sonner** — when the message is transient feedback about something that just happened — use a toast, not a persistent notifications list.

### Rules
- **Do:** Pair the unread dot with a real accessible label (role="img" aria-label="Unread"), as this block already does. **Don't:** Ship an unread indicator that's purely decorative with no accessible signal.
- **Do:** Give each notification an icon that matches its content (a person icon for membership events, a check for successful deploys) so the list can be scanned by icon alone. **Don't:** Reuse one generic bell icon for every notification regardless of type, forcing people to read each title just to tell them apart.

### Accessibility
- The unread dot uses role="img" and aria-label="Unread" — the state is announced, not just shown as a colored dot.
- Mark all read is a real, focusable button, not a link styled to look like one.

### Design tokens
`--card` · `--muted` · `--primary` · `--border`

