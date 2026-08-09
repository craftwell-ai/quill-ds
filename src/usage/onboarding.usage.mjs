export const usage = {
  name: 'onboarding',
  kind: 'pattern',
  summary: 'A setup checklist card with a progress bar, completed and pending tasks, and start links for remaining steps.',
  useWhen: [
    'You need a setup checklist that tracks progress and links to remaining steps.',
  ],
  alternatives: [
    { name: 'wizard', when: "the steps must happen in a strict sequence in one sitting, not a checklist a user dips in and out of over time." },
    { name: 'empty-state', when: "there's a single action to take, not a multi-step checklist to track." },
  ],
  rules: [
    {
      id: 'show-progress-as-a-fraction-and-a-bar',
      do: 'Pair the visual progress bar with a text fraction ("2 of 4 complete") so the state isn\'t conveyed by bar width alone.',
      dont: 'Show only a progress bar with no numeric readout of how much is actually done.',
      visual: true,
    },
  ],
  a11y: [
    'Completed tasks are marked with both a filled check icon and strikethrough text — two signals, not color or icon alone.',
    'Each pending task\'s "Start" link should carry a task-specific accessible name (e.g. "Start: Invite your team") in an installed version — this story renders four identical "Start" labels, which read as indistinguishable to screen-reader users navigating by button list.',
  ],
  tokens: ['--primary', '--primary-foreground', '--muted', '--input'],
}
