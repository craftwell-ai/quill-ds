export const usage = {
  name: 'calendar-page',
  kind: 'pattern',
  summary: "A single-date calendar paired with the selected day's session list, in one studio-schedule card.",
  useWhen: [
    'You need to pick a single date and show what\'s scheduled that day.',
  ],
  alternatives: [
    { name: 'calendar-range', when: "the user is booking a span of days, not viewing what's scheduled on one." },
    { name: 'activity-feed', when: "you want a chronological history of past events, not a schedule of upcoming sessions tied to a picked date." },
  ],
  rules: [
    {
      id: 'sync-list-to-selection',
      do: 'Keep the session list in sync with whatever date is selected in the calendar — the two panes are one control, not two independent widgets.',
      dont: 'Let the calendar selection and the listed sessions fall out of sync (e.g. a static list that ignores the picked date).',
      visual: true,
    },
  ],
  a11y: [
    "The selected day carries both a filled background (--primary) and inverted text color, not a border or dot alone — today's marker uses --muted, a visually distinct token, so the two states don't collide.",
    'Each session\'s time is presented as visible text ("9:00"), not implied by list order alone.',
  ],
  tokens: ['--primary', '--primary-foreground', '--muted', '--border'],
}
