export const usage = {
  name: 'list-detail',
  kind: 'pattern',
  summary: 'An inbox-style split view — a selectable message list beside a detail pane with archive and delete actions.',
  useWhen: [
    'You need an inbox-style split view pairing a selectable list with a detail pane.',
  ],
  alternatives: [
    { name: 'mail-shell', when: 'you need a fuller mail client — search, reply composer, forward — not just list-and-read.' },
    { name: 'chat', when: 'the conversation is a live back-and-forth thread, not discrete messages you select and read one at a time.' },
  ],
  rules: [
    {
      id: 'selected-item-stays-visible',
      do: "Keep the selected thread visually marked in the list (background fill) while its detail is open, so context isn't lost.",
      dont: "Let the list's selection state go stale or unmarked once a thread is open in the detail pane.",
      visual: false,
    },
  ],
  a11y: [
    'Each thread in the list is a real, focusable <button>, not a clickable <div> with no keyboard access.',
    'Archive and Delete are icon-only buttons with explicit aria-labels, not bare icons with no accessible name.',
  ],
  tokens: ['--border', '--accent', '--muted-foreground'],
}
