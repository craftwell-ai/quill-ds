# pricing (pattern)

A three-tier pricing grid with a highlighted popular plan, feature checklists, and per-plan calls to action.

### When to use
- You need a tiered pricing grid with a highlighted plan and feature checklists.

### Reach for instead
- **feature-section** — when you're describing capabilities in general, not comparing specific paid tiers against each other.
- **order-summary** — when the user has already chosen a plan and is now reviewing a specific purchase, not comparing options.

### Rules
- **Do:** Mark exactly one plan as featured (ring + Popular badge) to guide the decision. **Don't:** Feature more than one plan, or none — either dilutes the recommendation this pattern exists to make.

### Accessibility
- The "Popular" badge is visible text, not conveyed by the ring border alone — a screen-reader user still learns which plan is recommended.
- Each plan's feature list uses a check icon plus visible text per line, not an icon-only list with no textual confirmation of what's included.

### Design tokens
`--card` · `--ring` · `--primary` · `--muted-foreground`

