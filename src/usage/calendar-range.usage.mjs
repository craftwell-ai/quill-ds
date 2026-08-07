export const usage = {
  name: 'calendar-range',
  kind: 'pattern',
  summary: 'A stateful two-month range calendar for booking a span of days, with clear and reserve actions.',
  useWhen: [
    'You need to book a span of days with a two-month range picker and confirm/clear actions.',
  ],
  alternatives: [
    { name: 'calendar-page', when: 'the user is picking a single day to view, not a multi-day span to reserve.' },
    { name: 'checkout', when: 'the range is just one field within a larger purchase flow, not the whole card.' },
  ],
  rules: [
    {
      id: 'always-offer-clear',
      do: 'Keep the Clear action available whenever a range is selected, separate from Reserve.',
      dont: "Force a user to re-click through the whole range to correct a mis-click — that's what Clear is for.",
      visual: false,
    },
    {
      id: 'disable-incomplete-range',
      do: 'Disable Reserve until both a start and end date are selected.',
      dont: 'Let a half-made range (just a start date) submit as if it were a valid booking.',
      visual: false,
    },
  ],
  a11y: [
    'The selected range communicates start, middle, and end through distinct fill states (solid at the ends, muted between), not shading alone.',
    "Calendar's day grid comes from react-day-picker, which provides keyboard navigation (arrow keys, Enter to select) out of the box — don't override day rendering in a way that breaks it.",
  ],
  tokens: ['--primary', '--primary-foreground', '--muted', '--border'],
}
