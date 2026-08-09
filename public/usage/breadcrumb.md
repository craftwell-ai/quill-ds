# breadcrumb (component)

A trail of links showing the current page's position in a hierarchy — the last crumb is always the current, non-link page.

### When to use
- You need to show where the current page sits inside a multi-level hierarchy (Home > Courses > Watercolor Basics) so users can jump back up a level.

### Reach for instead
- **page-header** — when you need the breadcrumb bundled with a title, description, and page actions in one header block, not just the trail by itself.

### Rules
- **Do:** Render the final crumb as BreadcrumbPage (plain, non-link, current) — every earlier crumb as BreadcrumbLink. **Don't:** Make every crumb, including the current page, a clickable BreadcrumbLink — you can't navigate to where you already are.
- **Do:** Swap the middle crumbs for BreadcrumbEllipsis once the path goes past about 4 levels deep. **Don't:** Render every level of a very deep path — the trail wraps and stops reading as a quick way back up.

### Accessibility
- Breadcrumb renders a real `<nav aria-label="breadcrumb">` wrapping an `<ol>` — the hierarchy is structural markup, not a row of plain text joined by slashes.
- BreadcrumbPage sets `aria-current="page"` and `aria-disabled="true"` on a `<span>` — it announces as the current location, not as an inert or broken link.
- BreadcrumbSeparator and BreadcrumbEllipsis are `aria-hidden` presentation-only; BreadcrumbEllipsis also carries a visually-hidden "More" label so screen readers get equivalent text, not silence.
- `BreadcrumbLink` accepts a `render` prop (Base UI's `useRender`) so it can become a router-aware Link component instead of a plain `<a>`, without losing its link semantics.

### Design tokens
`--ink-muted` · `--ink`

