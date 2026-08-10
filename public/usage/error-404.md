# error-404 (pattern)

A full-page 404 error state with go-back and home recovery actions.

### When to use
- You need a full-page not-found state with recovery actions.

### Reach for instead
- **empty-state** — when the resource exists but is legitimately empty (no items yet), not missing or misrouted.
- **alerts** — when the error is recoverable inline on the current page, not a full-page dead end that needs its own route.

### Rules
- **Do:** Offer both a contextual escape (Go back) and an absolute one (Take me home) — never strand the user with only one recovery path. **Don't:** Leave a 404 page with no action at all, or only a single 'Home' link buried in a header the user has to hunt for.

### Accessibility
- The page has a real &lt;h1> ("Page not found") — the large "404" numeral above it is decorative display text, not the page's accessible name.
- Go back and Take me home are two distinct, clearly labeled buttons, not a single ambiguous action.

### Design tokens
`--background` · `--muted-foreground` · `--primary`

