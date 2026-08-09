export const usage = {
  name: 'spinner',
  kind: 'component',
  summary: 'An indeterminate loading indicator — a spinning icon that inherits its color from `currentColor`, for waits with no known duration or percentage.',
  useWhen: [
    'You need to show that something is loading but have no measurable percentage to report.',
  ],
  alternatives: [
    { name: 'progress', when: 'you have a real, known completion percentage to show — Progress communicates more than a spinner can.' },
    { name: 'skeleton', when: "you want to preview the shape of content that's loading, rather than show a generic spinning indicator." },
  ],
  rules: [
    {
      id: 'pair-with-context-text',
      do: 'Pair Spinner with a short visible status next to it (as the Default story does: "Saving changes…") whenever there\'s room — the spinner alone doesn\'t say what\'s loading.',
      dont: "Drop a bare Spinner with no adjacent text when there's room to add one — sighted users see motion but not what it means.",
      visual: true,
    },
    {
      id: 'color-via-currentcolor',
      do: 'Let Spinner inherit color from its text context (`text-primary`, `text-destructive`, or the ambient text color) via `currentColor`.',
      dont: 'Force Spinner into a fixed off-token color unrelated to its surrounding text — it stops reading as part of that context.',
      visual: false,
    },
  ],
  a11y: [
    'Spinner sets `role="status"` and `aria-label="Loading"` by default (from the underlying Icon component) — an ARIA live region assistive tech announces on mount. Pass your own `aria-label` (e.g. "Uploading…") for a more specific announcement.',
    "Because Spinner already carries an accessible name, don't wrap it in a redundant `aria-hidden` container or a second live region — that suppresses or doubles the announcement.",
  ],
  tokens: [],
}
