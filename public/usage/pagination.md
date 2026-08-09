# pagination (component)

Page navigation for splitting a long list of records into discrete numbered pages, with Previous/Next controls and an ellipsis for skipped ranges.

### When to use
- You have a long list of records split across pages and need numbered links to jump between them, not just scroll further.

### Reach for instead
- **scroll-area** — when the list is short enough to browse in one continuously scrolling region instead of paging.
- **button** — when you only need a single "Load more" action appending more items, not numbered page links.

### Rules
- **Do:** Always render PaginationPrevious and PaginationNext, even on the first or last page — they stay visible and simply lead to the boundary. **Don't:** Omit Previous or Next entirely at the boundaries — the row loses a fixed, predictable place to click.
- **Do:** Use PaginationEllipsis to represent skipped page ranges instead of listing every page number. **Don't:** List every single page number when there are dozens of pages — the control turns into an unreadable, hard-to-scan row.

### Accessibility
- Pagination renders a real `<nav role="navigation" aria-label="pagination">` — the page list is structural navigation, not a bare row of buttons.
- PaginationLink sets `aria-current="page"` when `isActive` is true, and PaginationPrevious/PaginationNext each carry an explicit `aria-label` ("Go to previous/next page") since their visible text hides on small screens.
- PaginationEllipsis is decorative — its icon is `aria-hidden` and it carries a visually-hidden "More pages" label so screen readers get equivalent text.

