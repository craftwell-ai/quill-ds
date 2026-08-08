# invoice (pattern)

A printable invoice card — sender and recipient details, a line-item table with totals, and a download action.

### When to use
- You need a printable invoice with parties, line-item totals, and a download action.

### Reach for instead
- **order-summary** — when you're showing a cart before payment, not a record of a completed transaction.
- **data-table** — when you need a list of many invoices to browse, not the full detail of one.

### Rules
- **Do:** Keep the total in a table footer, visually distinct from line items (its own row, right-aligned). **Don't:** Let the total blend in as just another line item — it needs to read as the sum, not another charge.

### Accessibility
- The line-item table uses real <TableHeader>/<TableFooter> semantics, so the total is programmatically distinguishable from a line item, not just visually styled differently.
- The paid/unpaid status is a Badge with visible text ("Paid"), not a color-only indicator.

### Design tokens
`--card` · `--border` · `--muted-foreground`

