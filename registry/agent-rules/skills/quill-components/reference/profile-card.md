# profile-card (pattern)

A compact, centered profile card — avatar initials, role, follower stats, and follow/message actions.

### When to use
- You need a compact user profile with avatar, role, stats, and follow / message actions.

### Reach for instead
- **activity-feed** — when you want to show what someone did, not a static summary of who they are.
- **data-table** — when you're listing many people at once — a table or list reads better than a full card per person.

### Rules
- **Do:** Label every stat ("Followers", "Following") directly beneath its number — a bare number has no meaning on its own. **Don't:** Show raw numbers with no label and expect position alone to convey what they mean.

### Accessibility
- The avatar circle's initials ("AL") are real text content, not a background-image with no fallback.
- Follow and Message are two distinct, separately-labeled buttons — never collapse them into one ambiguous action.

### Design tokens
`--card` · `--muted` · `--primary` · `--secondary`

