export const usage = {
  name: 'forgot-password',
  kind: 'pattern',
  summary: 'A password-reset request card — an email field, a send-link action, and a way back to sign in.',
  useWhen: [
    'You need a password-reset request card that sends a recovery link.',
  ],
  alternatives: [
    { name: 'otp-verification', when: 'recovery works by a typed one-time code rather than an emailed link.' },
    { name: 'login', when: "the user hasn't actually forgotten anything — this card is only the detour reached from login's \"Forgot your password?\" link." },
  ],
  rules: [
    {
      id: 'always-offer-a-way-back',
      do: 'Keep the ghost "Back to sign in" button so a user who clicked in by mistake isn\'t stuck.',
      dont: 'Ship this card as a dead end with no return path to sign-in.',
      visual: true,
    },
  ],
  a11y: [
    'The back-to-sign-in icon is decorative (aria-hidden by default); the button\'s accessible name comes from its visible text, not the arrow glyph.',
    'The email field uses a real <Label htmlFor>, same as every other auth card in this set.',
  ],
  tokens: ['--card', '--input', '--primary', '--muted-foreground'],
}
