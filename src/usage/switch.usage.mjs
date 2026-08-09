export const usage = {
  name: 'switch',
  kind: 'component',
  summary: 'An on/off control for a setting that takes effect immediately — no separate Save step.',
  useWhen: [
    'You need a boolean setting that applies the moment it is flipped — notifications, dark mode, a feature flag.',
  ],
  alternatives: [
    { name: 'checkbox', when: 'the boolean is part of a form submitted later, not applied instantly.' },
    { name: 'toggle', when: 'you need a pressed/unpressed icon button (formatting, filters) rather than a labeled setting.' },
  ],
  rules: [
    {
      id: 'pair-with-label',
      do: 'Always pair Switch with a Label for an accessible name — the control itself renders no text.',
      dont: 'Ship a bare Switch with no Label — screen readers announce only "switch, off," not what it controls.',
      visual: true,
    },
    {
      id: 'controlled-or-uncontrolled',
      do: 'Use defaultChecked for uncontrolled state, or checked + onCheckedChange for controlled.',
      dont: 'Pass checked with no onCheckedChange — the switch stops responding to clicks because nothing ever updates the controlling value.',
      visual: false,
    },
  ],
  a11y: [
    'Renders role="switch" with aria-checked reflecting on/off.',
    'A visually-hidden native `<input type="checkbox">` underneath gives Space-to-toggle for free, the same native behavior as Checkbox.',
    'aria-invalid drives the destructive border/ring, matching the rest of the form-control set.',
  ],
  tokens: ['--primary', '--input', '--ring', '--destructive'],
}
