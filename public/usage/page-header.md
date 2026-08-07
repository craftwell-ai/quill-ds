# page-header (pattern)

A page header with a breadcrumb trail, title and description, and duplicate/new action buttons.

### When to use
- You need a screen header with breadcrumbs, title, description, and primary actions.

### Reach for instead
- **sidebar-nav** — when you need the breadcrumb as part of a full app shell's top bar, not a standalone header block.
- **hero** — when this is a marketing page's opening statement, not a utility screen's title bar.

### Rules
- **Do:** Render the current page as BreadcrumbPage (plain text), not a link — you can't navigate to where you already are. **Don't:** Make every breadcrumb crumb, including the current page, a clickable link.

### Accessibility
- The breadcrumb trail uses real <nav>/<ol> semantics (via the Breadcrumb primitive), not a row of plain text separated by slashes.
- Duplicate and New are two distinct, separately labeled buttons, not one ambiguous combined action.

### Design tokens
`--muted-foreground` · `--primary` · `--border`

