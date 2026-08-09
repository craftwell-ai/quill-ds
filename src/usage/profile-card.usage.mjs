export const usage = {
  name: 'profile-card',
  kind: 'pattern',
  summary: 'A compact, centered profile card — avatar initials, role, follower stats, and follow/message actions.',
  useWhen: [
    'You need a compact user profile with avatar, role, stats, and follow / message actions.',
  ],
  alternatives: [
    { name: 'activity-feed', when: 'you want to show what someone did, not a static summary of who they are.' },
    { name: 'data-table', when: "you're listing many people at once — a table or list reads better than a full card per person." },
  ],
  rules: [
    {
      id: 'stats-need-context',
      do: 'Label every stat ("Followers", "Following") directly beneath its number — a bare number has no meaning on its own.',
      dont: 'Show raw numbers with no label and expect position alone to convey what they mean.',
      visual: true,
    },
  ],
  a11y: [
    'The avatar circle\'s initials ("AL") are real text content, not a background-image with no fallback.',
    'Follow and Message are two distinct, separately-labeled buttons — never collapse them into one ambiguous action.',
  ],
  tokens: ['--card', '--muted', '--primary', '--secondary'],
}
