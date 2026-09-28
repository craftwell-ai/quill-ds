# order-summary (pattern)

A checkout order-summary card — line items, a promo code field, a total, and a pay-now button.

### When to use
- You need a cart-review card with line items, a promo field, a total, and a pay button.

### Reach for instead
- **invoice** — when you're showing a record of a completed, already-paid transaction, not a cart pending payment.
- **checkout** — when you need the full payment form (card fields, billing address) alongside the summary, not just the review.

### Rules
- **Do:** Recompute the total the instant a promo code applies or a line item changes — never leave a stale total on screen after an update. **Don't:** Require a page refresh or separate action to see the corrected total.
- **Do:** Show an applied promo as its own line item with the discount amount, so the line items and the total add up to the same number. **Don't:** Let the total drop after a promo applies with no corresponding line item — buyers can't verify what changed.

### Accessibility
- The total is set apart with a larger font size and its own row, not just bolded inline with the line items.
- Pay now includes both an icon and the visible text "Pay now" — the icon alone would not be an adequate accessible name.

### Design tokens
`--card` · `--input` · `--primary` · `--muted-foreground`

