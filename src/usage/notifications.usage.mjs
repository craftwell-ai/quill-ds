export const usage = {
  name: 'notifications',
  kind: 'pattern',
  summary: 'A notifications card listing recent events with icons, timestamps, unread indicators, and a mark-all-read action.',
  useWhen: [
    'You need a notifications center with unread indicators and a mark-all-read action.',
  ],
  alternatives: [
    { name: 'activity-feed', when: 'the list is a read-only history with no read/unread state or mark-all action.' },
    { name: 'sonner', when: 'the message is transient feedback about something that just happened — use a toast, not a persistent notifications list.' },
  ],
  rules: [
    {
      id: 'unread-is-not-color-alone',
      do: 'Pair the unread dot with a real accessible label (role="img" aria-label="Unread"), as this block already does.',
      dont: "Ship an unread indicator that's purely decorative with no accessible signal.",
      visual: false,
    },
  ],
  a11y: [
    'The unread dot uses role="img" and aria-label="Unread" — the state is announced, not just shown as a colored dot.',
    'Mark all read is a real, focusable button, not a link styled to look like one.',
  ],
  tokens: ['--card', '--muted', '--primary', '--border'],
}
