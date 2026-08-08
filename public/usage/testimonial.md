# testimonial (pattern)

A customer-quote card with a serif pull-quote, avatar initials, and attribution.

### When to use
- You need a customer-quote card with a serif pull-quote and attribution.

### Reach for instead
- **team-section** — when you're introducing people, not quoting what a customer said about the product.
- **stats-band** — when the proof point is a number, not a quote.

### Rules
- **Do:** Pair every quote with a real name, role, and organization — an anonymous quote reads as unverifiable. **Don't:** Ship a testimonial with no attribution, or attribution too small/muted to actually read.

### Accessibility
- The pattern uses real <figure>/<blockquote>/<figcaption> semantics, so the quote and its attribution stay programmatically linked, not just visually adjacent.
- The avatar's initials are real text content, matching the fallback pattern used everywhere else in the catalog (profile-card, team-section, activity-feed).

### Design tokens
`--card` · `--border` · `--muted-foreground`

