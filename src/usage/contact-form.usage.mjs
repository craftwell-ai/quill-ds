export const usage = {
  name: 'contact-form',
  kind: 'pattern',
  summary: 'A get-in-touch card — name, email, a topic select, and a message field.',
  useWhen: [
    'You need a get-in-touch form with name, email, topic, and message fields.',
  ],
  alternatives: [
    { name: 'newsletter', when: 'you only need a single email field to grow a list, not a full multi-field inquiry form.' },
    { name: 'settings', when: "the fields are updating an existing profile, not sending a one-off message." },
  ],
  rules: [
    {
      id: 'set-response-expectations',
      do: 'State a response-time expectation in the description ("We usually reply within one working day.") so the form doesn\'t feel like it disappears into a void.',
      dont: "Leave users with no sense of whether or when they'll hear back.",
      visual: true,
    },
  ],
  a11y: [
    "Every field, including the Select, has its own <Label htmlFor>, and the topic Select's trigger id matches its label's htmlFor.",
    'The markdown hint under Message is supplementary text, not a replacement for the field\'s own label.',
  ],
  tokens: ['--card', '--input', '--primary', '--muted-foreground'],
}
