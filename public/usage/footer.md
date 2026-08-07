# footer (pattern)

A marketing footer with brand blurb, link columns, and legal links.

### When to use
- You need a site-wide footer with link columns, a brand blurb, and legal links.

### Reach for instead
- **sidebar-nav** — when the links are primary in-app navigation, not secondary site-wide links at the page's end.
- **navbar** — when the links belong at the top of the page as primary navigation, not the bottom as reference.

### Rules
- **Do:** Wrap each link column in its own <nav aria-label>, as this block already does, so screen-reader users can jump between them. **Don't:** Render link columns as bare, unlabeled <div> lists that all announce as one undifferentiated block.

### Accessibility
- Each link column is a real <nav> with an aria-label matching its visible heading (e.g. "Product", "Resources"), not a generic landmark.
- The bottom legal row (copyright, Privacy, Terms) is visually and structurally separated from the link columns by a Separator, not just extra margin.

### Design tokens
`--background` · `--muted-foreground` · `--border`

