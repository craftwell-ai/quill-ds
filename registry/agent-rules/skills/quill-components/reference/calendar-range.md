# calendar-range (pattern)

A stateful two-month range calendar for booking a span of days, with clear and reserve actions.

### When to use
- You need to book a span of days with a two-month range picker and confirm/clear actions.

### Reach for instead
- **calendar-page** — when the user is picking a single day to view, not a multi-day span to reserve.
- **checkout** — when the range is just one field within a larger purchase flow, not the whole card.

### Rules
- **Do:** Keep the Clear action available whenever a range is selected, separate from Reserve. **Don't:** Force a user to re-click through the whole range to correct a mis-click — that's what Clear is for.
- **Do:** Disable Reserve until both a start and end date are selected. **Don't:** Let a half-made range (just a start date) submit as if it were a valid booking.

### Accessibility
- The selected range communicates start, middle, and end through distinct fill states (solid at the ends, muted between), not shading alone.
- Calendar's day grid comes from react-day-picker, which provides keyboard navigation (arrow keys, Enter to select) out of the box — don't override day rendering in a way that breaks it.

### Design tokens
`--primary` · `--primary-foreground` · `--muted` · `--border`

