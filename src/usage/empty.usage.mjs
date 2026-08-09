export const usage = {
  name: 'empty',
  kind: 'component',
  summary: 'An empty-state block for zero-data surfaces — icon, title, description, and a primary action, centered in the available space.',
  useWhen: [
    'A list, table, or search result surface has no data to show yet and you need to explain why, plus give the user a way to fix it (create, upload, search again).',
  ],
  alternatives: [
    { name: 'skeleton', when: 'the surface is still loading real data and not yet confirmed empty — use Skeleton for the loading state, and switch to Empty only once loading finishes with zero results.' },
  ],
  rules: [
    {
      id: 'complete-empty-state',
      do: 'Pair every Empty with a title, a short description, and at least one primary action, as both stories here do, so the user has a next step.',
      dont: "Show an icon and a title alone with no description or action — the user learns there's nothing here but not what to do about it.",
      visual: true,
    },
    {
      id: 'contextual-media',
      do: 'Pick an EmptyMedia icon that matches the content type — a book for courses, a folder for files.',
      dont: "Reuse the same generic icon for every empty state across the app regardless of what's missing — it stops carrying any information.",
      visual: false,
    },
  ],
  a11y: [
    "Empty, EmptyHeader, EmptyContent, and EmptyMedia are all plain `<div>`s with no built-in role; EmptyTitle is a styled `<div>`, not a heading, so add real heading markup inside it when the empty state should appear in the page's heading outline.",
    'EmptyDescription renders as a `<div>` in the current component (its prop type is inherited from `<p>`, but the rendered tag is `<div>`) — treat it as body text and keep it as the second read after the title, before any action buttons.',
  ],
  tokens: ['--muted', '--muted-foreground', '--foreground', '--border'],
}
