export const usage = {
  name: 'table',
  kind: 'component',
  summary: 'A data table for rows of tabular content — headers, cells, an optional footer for totals, and a caption for the accessible description.',
  useWhen: [
    'You need to display structured, comparable data in rows and columns (a course catalogue, a settings list, a pricing grid) where scanning down a column matters.',
  ],
  alternatives: [
    { name: 'item', when: 'each row is really a card-like list entry (icon, title, description, actions) rather than aligned tabular data — Item reads better than table cells for that.' },
    { name: 'data-table', when: 'you need sorting, filtering, pagination, or row selection on top of the base table — DataTable is the composed pattern built on Table.' },
  ],
  rules: [
    {
      id: 'always-caption',
      do: 'Give every table a TableCaption describing what it holds — "Course catalogue", "Design token colour values".',
      dont: 'Ship a table with no caption and no other visible heading — screen-reader users land on rows of data with no context for what it means.',
      visual: true,
    },
    {
      id: 'footer-for-totals',
      do: 'Use TableFooter for a totals or summary row — it renders with a top border and `bg-muted/50` automatically, as the "Total students" row does.',
      dont: 'Append a totals row as a plain TableRow inside TableBody — it reads as one more data row instead of a summary.',
      visual: false,
    },
  ],
  a11y: [
    'Table renders a real `<table>` (wrapped in a scrollable `<div>` for horizontal overflow), so native table semantics — row and column headers announced together with each cell — apply for free.',
    "TableCaption renders a real `<caption>` element, positioned by `caption-bottom` on the table; it is the table's accessible description, read by screen readers alongside the table.",
    'TableHead cells are real `<th>` elements, so screen readers announce the column name alongside each cell in that column as you navigate.',
  ],
  tokens: ['--border', '--muted', '--foreground', '--muted-foreground'],
}
