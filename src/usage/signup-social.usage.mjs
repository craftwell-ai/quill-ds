export const usage = {
  name: 'signup-social',
  kind: 'pattern',
  summary: 'Signup that leads with GitHub and Google provider buttons, falling back to an email/password form.',
  useWhen: [
    'You need signup that leads with OAuth providers and falls back to email/password.',
  ],
  alternatives: [
    { name: 'signup', when: "you don't have OAuth providers configured, or want email/password as the primary path, not a fallback." },
    { name: 'login-oauth', when: 'this is sign-in, not new-account creation — login-oauth is the matching pattern for returning users.' },
  ],
  rules: [
    {
      id: 'providers-lead-fallback-follows',
      do: "Put the provider buttons above the divider and the email/password fields below it, matching login-oauth's provider-first order.",
      dont: 'Bury the provider buttons below a full email/password form — that defeats the point of offering them.',
      visual: false,
    },
  ],
  a11y: [
    'Provider marks (GitHub, Google) are decorative; button accessible names come from the visible "Continue with X" text.',
    'Email and password fields keep real <Label htmlFor> pairs even though they\'re the fallback path, not the headline.',
  ],
  tokens: ['--card', '--input', '--primary', '--border'],
}
