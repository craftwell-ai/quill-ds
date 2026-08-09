export const usage = {
  name: 'checkbox',
  kind: 'component',
  summary: 'A single independent yes/no selection — check it or leave it, with no relation to any other Checkbox.',
  useWhen: [
    'You need one or more independent boolean choices — accept terms, opt into a list, select several rows in a table.',
  ],
  alternatives: [
    { name: 'radio-group', when: 'only one of several options can be true at once — Checkbox has no concept of mutual exclusion.' },
    { name: 'switch', when: 'the boolean is a setting that applies immediately, not a value collected as part of a form.' },
  ],
  rules: [
    {
      id: 'pair-with-label',
      do: 'Always pair Checkbox with a Label via htmlFor/id, or wrap both in one label — not just visual proximity to nearby text.',
      dont: 'Render a bare Checkbox next to plain text with no htmlFor/id association — screen readers announce no name.',
      visual: true,
    },
    {
      id: 'aria-invalid-not-color',
      do: 'Mark a failed validation with aria-invalid — the border and ring switch to --destructive automatically.',
      dont: 'Reach for a custom red className to show an error state — it fights the built-in invalid styling and skips the aria wiring assistive tech needs.',
      visual: false,
    },
    {
      id: 'independent-not-exclusive',
      do: 'Use Checkbox for independent yes/no selections — each one can be true or false on its own.',
      dont: "Group several Checkboxes to represent a single mutually-exclusive choice — that's what RadioGroup is for.",
      visual: false,
    },
  ],
  a11y: [
    'Renders role="checkbox" with aria-checked reflecting true/false (or "mixed" for an indeterminate state).',
    'A visually-hidden native `<input type="checkbox">` underneath handles the real keyboard behavior — Space toggles it, Enter is deliberately blocked so it cannot double as a submit trigger.',
    'aria-invalid drives the destructive border/ring automatically, the same token pattern as Input and Select.',
  ],
  tokens: ['--primary', '--input', '--ring', '--destructive', '--radius-sm'],
}
