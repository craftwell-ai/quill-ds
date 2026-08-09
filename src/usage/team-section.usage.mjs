export const usage = {
  name: 'team-section',
  kind: 'pattern',
  summary: "A marketing team grid with avatar cards showing each member's name, role, specialty badge, and email action.",
  useWhen: [
    'You need a marketing team grid with member cards, roles, and contact actions.',
  ],
  alternatives: [
    { name: 'profile-card', when: "you're showing one person in detail (stats, follow/message), not a grid of many team members at a glance." },
    { name: 'testimonial', when: "you're quoting what someone said, not introducing who's on the team." },
  ],
  rules: [
    {
      id: 'contact-action-is-per-person',
      do: 'Give every team member their own contact action, labeled with their name (e.g. "Email Ada Lovelace").',
      dont: "Ship one generic \"Contact us\" action for the whole grid — it defeats the point of a per-person team grid.",
      visual: true,
    },
  ],
  a11y: [
    "Each member's email button carries a per-person aria-label, not a shared generic one — confirmed directly in this block's source.",
    'Avatar initials are real text content (AvatarFallback), so every team member has an identifiable avatar even before any photo loads.',
  ],
  tokens: ['--card', '--muted', '--secondary'],
}
