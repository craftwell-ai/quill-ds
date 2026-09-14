export const usage = {
  name: 'data-table',
  kind: 'pattern',
  summary: 'A filterable members table with a toolbar, ToneBadge status pills, and a per-row actions menu.',
  useWhen: [
    'You need a filterable, actionable table of records with tone-mapped status pills and row actions.',
  ],
  alternatives: [
    { name: 'activity-feed', when: 'you want a read-only chronological list, not sortable/filterable records with row actions.' },
    { name: 'kanban', when: 'the records are better organized by status columns than by table rows.' },
  ],
  rules: [
    {
      id: 'row-actions-need-labels',
      do: 'Give every icon-only row-action button a per-row aria-label (e.g. "Actions for Ada Lovelace"), not a generic one.',
      dont: "Ship a table full of icon-only buttons that all announce as the same unlabeled button to a screen reader.",
      visual: false,
    },
  ],
  a11y: [
    'Status is conveyed by the ToneBadge\'s text, not its tone alone ("Active" vs "Invited" read as different words, not just moss vs gold).',
    'The actions column header uses a visually-hidden ("sr-only") label instead of empty text, so the column still has an accessible name.',
  ],
  tokens: ['--border', '--muted', '--moss', '--moss-deep', '--gold', '--gold-text'],
}
