export const usage = {
  name: 'order-summary',
  kind: 'pattern',
  summary: 'A checkout order-summary card — line items, a promo code field, a total, and a pay-now button.',
  useWhen: [
    'You need a cart-review card with line items, a promo field, a total, and a pay button.',
  ],
  alternatives: [
    { name: 'invoice', when: "you're showing a record of a completed, already-paid transaction, not a cart pending payment." },
    { name: 'checkout', when: 'you need the full payment form (card fields, billing address) alongside the summary, not just the review.' },
  ],
  rules: [
    {
      id: 'total-updates-live',
      do: 'Recompute the total the instant a promo code applies or a line item changes — never leave a stale total on screen after an update.',
      dont: 'Require a page refresh or separate action to see the corrected total.',
      visual: false,
    },
    {
      id: 'promo-discount-is-a-visible-line',
      do: 'Show an applied promo as its own line item with the discount amount, so the line items and the total add up to the same number.',
      dont: "Let the total drop after a promo applies with no corresponding line item — buyers can't verify what changed.",
      visual: true,
    },
  ],
  a11y: [
    'The total is set apart with a larger font size and its own row, not just bolded inline with the line items.',
    'Pay now includes both an icon and the visible text "Pay now" — the icon alone would not be an adequate accessible name.',
  ],
  tokens: ['--card', '--input', '--primary', '--muted-foreground'],
}
