export const usage = {
  name: 'login-oauth',
  kind: 'pattern',
  summary: 'Provider-first sign-in — Google, GitHub, and Apple buttons above an email fallback.',
  useWhen: [
    'Identity comes from a provider (Google, GitHub, Apple) rather than a password you store.',
  ],
  alternatives: [
    { name: 'signup-social', when: 'this is account creation, not sign-in — signup-social also leads with OAuth providers.' },
    { name: 'login', when: "you store first-party passwords and don't want a provider-first order at all." },
    { name: 'login-minimal', when: "you don't have OAuth providers configured and just need a single email field." },
  ],
  rules: [
    {
      id: 'providers-are-primary',
      do: 'Treat the provider buttons as the primary path; keep the email form below the rule as a fallback, not the headline.',
      dont: 'Give the email field equal visual weight to the provider buttons when most users have a provider account.',
      visual: false,
    },
    {
      id: 'brand-marks-are-fixed',
      do: 'Keep provider marks as their official inlined artwork, with GitHub and Apple taking currentColor so they invert correctly in Dusk.',
      dont: 'Restyle a provider mark to match your palette — that breaks the brand guidelines you agree to by using their sign-in.',
      visual: false,
    },
  ],
  a11y: [
    'Provider marks are decorative (aria-hidden); each button\'s accessible name comes from its visible "Continue with X" text, not the icon.',
    'The email fallback still uses a real <Label htmlFor>, same as every other password/email pattern in this set.',
  ],
  tokens: ['--primary', '--muted-foreground', '--border', '--radius'],
}
