export const usage = {
  name: 'signup',
  kind: 'pattern',
  summary: 'Standard account-creation card — name, email, password, and a link back to sign-in.',
  useWhen: [
    'You need standard account creation — name, email, password, and a sign-in link.',
  ],
  alternatives: [
    { name: 'signup-social', when: 'you want OAuth providers to lead instead of a bare email/password form.' },
    { name: 'login', when: 'the user already has an account — this card is only for new ones.' },
  ],
  rules: [
    {
      id: 'state-the-offer',
      do: "Use the description line to state what happens next (trial length, no card required) so the form isn't just fields with no context.",
      dont: 'Leave the card as a bare field list with no framing for why someone would fill it out.',
      visual: true,
    },
  ],
  a11y: [
    'All three fields (name, email, password) have their own <Label htmlFor>; the password placeholder is a hint, not a substitute for real validation messaging.',
    "The \"Sign in\" link at the bottom is a real <a>, not a button — it's a navigation, and should read as one to assistive tech.",
  ],
  tokens: ['--card', '--input', '--primary', '--muted-foreground'],
}
