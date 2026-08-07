export const usage = {
  name: 'invoice',
  kind: 'pattern',
  summary: 'A printable invoice card — sender and recipient details, a line-item table with totals, and a download action.',
  useWhen: [
    'You need a printable invoice with parties, line-item totals, and a download action.',
  ],
  alternatives: [
    { name: 'order-summary', when: "you're showing a cart before payment, not a record of a completed transaction." },
    { name: 'data-table', when: 'you need a list of many invoices to browse, not the full detail of one.' },
  ],
  rules: [
    {
      id: 'total-is-unambiguous',
      do: 'Keep the total in a table footer, visually distinct from line items (its own row, right-aligned).',
      dont: "Let the total blend in as just another line item — it needs to read as the sum, not another charge.",
      visual: false,
    },
  ],
  a11y: [
    'The line-item table uses real <TableHeader>/<TableFooter> semantics, so the total is programmatically distinguishable from a line item, not just visually styled differently.',
    'The paid/unpaid status is a Badge with visible text ("Paid"), not a color-only indicator.',
  ],
  tokens: ['--card', '--border', '--muted-foreground'],
}
