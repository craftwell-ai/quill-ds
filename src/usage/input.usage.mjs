export const usage = {
  name: 'input',
  kind: 'component',
  summary: 'A styled native text input for free-form single-line entry — email, name, search, URL.',
  useWhen: [
    'You need free-form single-line text entry — an email, a name, a search query, a URL.',
  ],
  alternatives: [
    { name: 'textarea', when: 'the value is multi-line free text (a bio, a description) rather than a single line.' },
    { name: 'input-otp', when: "you're collecting a fixed-length code (2FA, email verification) — one boxed slot per character reads better than a single field." },
    { name: 'input-group', when: 'the field needs a prefix or suffix — an icon, a unit label, a button — merged into the same bordered control.' },
  ],
  rules: [
    {
      id: 'label-not-placeholder',
      do: 'Pair Input with a real Label (or FieldLabel) — placeholder text disappears the moment the user types.',
      dont: 'Use placeholder as the only label.',
      visual: true,
    },
    {
      id: 'aria-invalid-for-errors',
      do: 'Set aria-invalid="true" on the input for validation errors — it applies the destructive border and ring automatically.',
      dont: 'Hand-roll red border classes for an error state instead of aria-invalid.',
      visual: false,
    },
  ],
  a11y: [
    'Renders a native `<input data-slot="input">`, so standard input semantics (type, autocomplete, native validation) apply.',
    'aria-invalid="true" drives both the destructive-colored ring and the invalid state assistive tech announces — set it rather than faking it with custom classes.',
    'disabled removes the input from the tab order (native `<input disabled>` semantics).',
  ],
  tokens: ['--input', '--ring', '--destructive', '--radius-lg'],
}
