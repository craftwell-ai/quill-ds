export const usage = {
  name: 'mail-shell',
  kind: 'pattern',
  summary: 'A two-pane mail client shell — a searchable message list and a reading pane with toolbar and inline reply.',
  useWhen: [
    'You need a two-pane mail client — searchable list plus a reading pane with toolbar and reply.',
  ],
  alternatives: [
    { name: 'list-detail', when: 'you need the simpler read-and-select pattern with no search, toolbar, or reply composer.' },
    { name: 'chat', when: 'the messaging is a live conversational thread, not discrete emails with subjects.' },
  ],
  rules: [
    {
      id: 'reading-pane-hides-on-narrow',
      do: 'Hide the reading pane on narrow viewports so the message list gets the full width instead of squeezing both panes.',
      dont: 'Force the two-pane layout at phone widths where neither pane has room to be usable.',
      visual: false,
    },
  ],
  a11y: [
    'The active message uses aria-current="true" on its list button, not just a background tint, so assistive tech knows which message is open.',
    'Toolbar actions (Archive, Delete, Reply, Forward) are all icon-only buttons with explicit aria-labels.',
  ],
  tokens: ['--border', '--muted', '--ring', '--muted-foreground'],
}
