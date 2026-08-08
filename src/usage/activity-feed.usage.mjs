export const usage = {
  name: 'activity-feed',
  kind: 'pattern',
  summary: 'A card timeline of recent events — avatar, action text, and a relative timestamp per entry.',
  useWhen: [
    'You need to show a chronological history of what happened — recent events with who, what, and when.',
  ],
  alternatives: [
    { name: 'notifications', when: "the events need an unread/read state and a mark-all-read action, not just a read-only history." },
    { name: 'data-table', when: 'the events are really records you need to filter, sort, or act on, not just skim chronologically.' },
  ],
  rules: [
    {
      id: 'time-is-relative',
      do: 'Use relative timestamps ("2 hours ago") for recent activity — they read faster than absolute dates.',
      dont: "Force users to parse a full timestamp for something that happened minutes ago.",
      visual: false,
    },
  ],
  a11y: [
    'The timeline is a real <ol> — event order is semantic, not just visual.',
    "Each avatar's initials are the accessible fallback content; the icon next to the timestamp is decorative (aria-hidden).",
  ],
  tokens: ['--card', '--border', '--muted-foreground'],
}
