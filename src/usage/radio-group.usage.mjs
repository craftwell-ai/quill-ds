export const usage = {
  name: 'radio-group',
  kind: 'component',
  summary: 'A set of mutually exclusive options rendered as visible radio buttons — pick exactly one from a short, always-visible list.',
  useWhen: [
    'You need the user to choose exactly one option from a short, always-visible list — not collapsed behind a dropdown trigger.',
  ],
  alternatives: [
    { name: 'checkbox', when: 'more than one option can be true at once — RadioGroup only ever holds a single value.' },
    { name: 'select', when: 'the option list is long enough that showing every choice on screen wastes space — collapse it behind a dropdown instead.' },
    { name: 'toggle-group', when: 'the choices read better as icon buttons (alignment, view mode) than as labeled radio dots.' },
  ],
  rules: [
    {
      id: 'pair-with-label',
      do: 'Always pair each RadioGroupItem with a Label via htmlFor/id.',
      dont: 'Render a bare RadioGroupItem next to unassociated text — screen readers announce no name for the option.',
      visual: false,
    },
    {
      id: 'single-value-only',
      do: 'Use RadioGroup only when exactly one of the options can be selected at a time.',
      dont: 'Reuse RadioGroup to fake a multi-select list — swap to a group of Checkboxes instead.',
      visual: false,
    },
    {
      id: 'controlled-or-uncontrolled',
      do: 'Pick one form: defaultValue for uncontrolled, or value + onValueChange for controlled.',
      dont: 'Pass both defaultValue and value — value wins and defaultValue is silently ignored after the first render.',
      visual: false,
    },
  ],
  a11y: [
    'The group renders role="radiogroup"; each item renders role="radio" with aria-checked reflecting selection.',
    'Arrow keys move focus and selection together between items, matching native `<input type="radio">` grouping — Tab enters and exits the whole group as a single stop.',
    'aria-invalid on an item drives the destructive border/ring, the same token pattern as Checkbox.',
  ],
  tokens: ['--primary', '--input', '--ring', '--destructive'],
}
