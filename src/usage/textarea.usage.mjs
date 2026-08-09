export const usage = {
  name: 'textarea',
  kind: 'component',
  summary: 'A styled native `<textarea>` for multi-line free text — descriptions, bios, comments.',
  useWhen: [
    'You need multi-line free-form text entry where a single-line Input would truncate or wrap awkwardly.',
  ],
  alternatives: [
    { name: 'input', when: 'the value is a single line — a name, an email, a search query.' },
    { name: 'input-group', when: 'you need an addon (a label like "Note", an icon) attached to a multi-line field — InputGroupTextarea handles that composition.' },
  ],
  rules: [
    {
      id: 'pair-with-label',
      do: 'Always pair Textarea with a Label.',
      dont: 'Render a bare Textarea with no associated Label.',
      visual: true,
    },
    {
      id: 'aria-invalid-for-errors',
      do: 'Set aria-invalid on Textarea for validation errors — same destructive ring token as Input.',
      dont: 'Style the error state by hand instead of using aria-invalid.',
      visual: false,
    },
  ],
  a11y: [
    'Renders a plain native `<textarea>`; no Label is provided automatically — associate one via htmlFor/id.',
    'field-sizing-content lets the box grow with typed content past its rows-based starting height, rather than staying fixed and scrolling internally.',
    'aria-invalid="true" applies the same destructive border/ring treatment as Input.',
  ],
  tokens: ['--input', '--ring', '--destructive', '--radius-lg'],
}
