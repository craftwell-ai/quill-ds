export const usage = {
  name: 'settings',
  kind: 'pattern',
  summary: 'A profile settings card — name fields, a bio textarea, and an email-notification toggle.',
  useWhen: [
    'You need a profile settings form with name, bio, and notification preferences.',
  ],
  alternatives: [
    { name: 'contact-form', when: "you're sending a one-off message, not editing a persistent profile." },
    { name: 'wizard', when: 'setup needs multiple sequential steps, not a single settings page a user returns to and edits freely.' },
  ],
  rules: [
    {
      id: 'separate-save-from-cancel',
      do: 'Keep Save changes and Cancel as two distinct, clearly differentiated actions (primary vs ghost).',
      dont: 'Make Cancel look as prominent as Save — the user should never mis-tap away unsaved changes as the default action.',
      visual: false,
    },
  ],
  a11y: [
    "The notification toggle's <Label> and the Switch share the same id/htmlFor pairing, so clicking the label text also toggles the switch.",
    "The switch's current state (on/off) is exposed through its own semantics, not conveyed by color alone.",
  ],
  tokens: ['--card', '--input', '--primary', '--border'],
}
