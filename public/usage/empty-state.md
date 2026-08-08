# empty-state (pattern)

A dashed-border empty state with an icon, explanatory text, and a primary action.

### When to use
- You need to explain why a view is empty and offer the primary action to fill it.

### Reach for instead
- **error-404** — when the view is empty because the resource doesn't exist or the route is wrong, not because the user hasn't created anything yet.
- **onboarding** — when there's a multi-step setup to walk through, not a single action to take right now.

### Rules
- **Do:** Pair the explanation with a real, primary action button that actually fills the view (e.g. "New project"). **Don't:** Explain that a view is empty and leave the user with no way to act on it from that screen.

### Accessibility
- The icon and dashed border are decorative framing; the heading and body text carry the actual meaning, not the visual style alone.
- The heading uses a real <h3>, giving the empty state its own accessible name within the surrounding page structure.

### Design tokens
`--card` · `--border` · `--muted` · `--primary`

