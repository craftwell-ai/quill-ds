# spinner (component)

An indeterminate loading indicator — a spinning icon that inherits its color from `currentColor`, for waits with no known duration or percentage.

### When to use
- You need to show that something is loading but have no measurable percentage to report.

### Reach for instead
- **progress** — when you have a real, known completion percentage to show — Progress communicates more than a spinner can.
- **skeleton** — when you want to preview the shape of content that's loading, rather than show a generic spinning indicator.

### Rules
- **Do:** Pair Spinner with a short visible status next to it (as the Default story does: "Saving changes…") whenever there's room — the spinner alone doesn't say what's loading. **Don't:** Drop a bare Spinner with no adjacent text when there's room to add one — sighted users see motion but not what it means.
- **Do:** Let Spinner inherit color from its text context (`text-primary`, `text-destructive`, or the ambient text color) via `currentColor`. **Don't:** Force Spinner into a fixed off-token color unrelated to its surrounding text — it stops reading as part of that context.

### Accessibility
- Spinner sets `role="status"` and `aria-label="Loading"` by default (from the underlying Icon component) — an ARIA live region assistive tech announces on mount. Pass your own `aria-label` (e.g. "Uploading…") for a more specific announcement.
- Because Spinner already carries an accessible name, don't wrap it in a redundant `aria-hidden` container or a second live region — that suppresses or doubles the announcement.

