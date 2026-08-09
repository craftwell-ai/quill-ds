export const usage = {
  name: 'wizard',
  kind: 'pattern',
  summary: 'A multi-step setup card — a progress stepper, workspace fields, and back/continue navigation.',
  useWhen: [
    'You need a multi-step setup flow with a progress stepper and back/continue navigation.',
  ],
  alternatives: [
    { name: 'onboarding', when: 'the steps are a checklist of tasks to complete over time, not a linear form flow completed in one sitting.' },
    { name: 'settings', when: "there's only one step and no sequence to track — this is a single settings page, not a flow." },
  ],
  rules: [
    {
      id: 'always-show-full-sequence',
      do: 'Show every step in the stepper up front (done/current/todo), so users know how much is left.',
      dont: 'Reveal steps one at a time with no sense of total progress.',
      visual: true,
    },
  ],
  a11y: [
    'Each step\'s state (done/current/todo) is conveyed by icon, position, and text color together, not a single color swatch alone.',
    'Back and Continue are two distinct, clearly labeled buttons — never a single ambiguous "Next" that also has to mean "Previous" depending on context.',
  ],
  tokens: ['--primary', '--primary-foreground', '--muted', '--border'],
}
