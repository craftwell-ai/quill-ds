# calendar (component)

The date-picker primitive built on react-day-picker — supports single, multiple, and range selection modes. `calendar-page` and `calendar-range` are this primitive already composed into full scheduling and booking patterns.

### When to use
- You're composing your own date-picking UI directly — a form field, a filter, a custom layout — rather than reaching for a pre-built scheduling pattern.

### Reach for instead
- **calendar-page** — when you need a single-date picker paired with a synced list of what's scheduled that day, already assembled.
- **calendar-range** — when you need a two-month range picker with Clear/Reserve actions, already assembled.
- **popover** — when you need to tuck the calendar inside a compact trigger instead of showing it inline — pair Calendar with PopoverContent yourself.

### Rules
- **Do:** Let today render with its own --muted marker and let the selected day render with --primary — two visually distinct tokens, not one fill reused for both. **Don't:** Reuse one color for both today and the selected day — they read as the same state and a user can't tell which date is actually picked.
- **Do:** Pick the selection mode that matches the task — `single` for one date, `range` for a span, `multiple` for a handful of unrelated dates — and pass the matching `selected`/`onSelect` value shape for that mode. **Don't:** Force a single-date task through `mode="range"` (or vice versa) — the selected value shape (a Date vs. a DateRange vs. an array) stops matching what the rest of your form expects.
- **Do:** Pass a `disabled` matcher (e.g. `{ before: today }`) to block dates that are never valid choices, as WithDisabledDates does. **Don't:** Leave every date pickable and validate only after submit — a user can select a date that was never going to be accepted.

### Accessibility
- The day grid renders real ARIA grid semantics — `role="gridcell"` per day, `aria-selected` on the selected cell(s) — wired automatically by react-day-picker, so avoid overriding day rendering in a way that drops them.
- Keyboard navigation (arrow keys, Home/End, Enter/Space to select) comes from react-day-picker out of the box.
- A disabled day is non-interactive mostly via the native `disabled` attribute, but via `aria-disabled` instead when that day currently holds roving-tabindex focus — so keyboard users tabbing through the grid never lose their place.

### Design tokens
`--background` · `--primary` · `--primary-foreground` · `--muted` · `--radius-md` · `--ring`

