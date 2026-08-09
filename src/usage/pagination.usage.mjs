export const usage = {
  name: 'pagination',
  kind: 'component',
  summary: 'Page navigation for splitting a long list of records into discrete numbered pages, with Previous/Next controls and an ellipsis for skipped ranges.',
  useWhen: [
    'You have a long list of records split across pages and need numbered links to jump between them, not just scroll further.',
  ],
  alternatives: [
    { name: 'scroll-area', when: 'the list is short enough to browse in one continuously scrolling region instead of paging.' },
    { name: 'button', when: 'you only need a single "Load more" action appending more items, not numbered page links.' },
  ],
  rules: [
    {
      id: 'always-show-prev-next',
      do: 'Always render PaginationPrevious and PaginationNext, even on the first or last page — they stay visible and simply lead to the boundary.',
      dont: 'Omit Previous or Next entirely at the boundaries — the row loses a fixed, predictable place to click.',
      visual: true,
    },
    {
      id: 'ellipsis-for-skipped-ranges',
      do: 'Use PaginationEllipsis to represent skipped page ranges instead of listing every page number.',
      dont: 'List every single page number when there are dozens of pages — the control turns into an unreadable, hard-to-scan row.',
      visual: false,
    },
  ],
  a11y: [
    'Pagination renders a real `<nav role="navigation" aria-label="pagination">` — the page list is structural navigation, not a bare row of buttons.',
    'PaginationLink sets `aria-current="page"` when `isActive` is true, and PaginationPrevious/PaginationNext each carry an explicit `aria-label` ("Go to previous/next page") since their visible text hides on small screens.',
    'PaginationEllipsis is decorative — its icon is `aria-hidden` and it carries a visually-hidden "More pages" label so screen readers get equivalent text.',
  ],
  tokens: [],
}
