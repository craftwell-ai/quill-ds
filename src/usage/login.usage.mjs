export const usage = {
  name: 'login',
  kind: 'pattern',
  summary: 'The standard email-and-password sign-in card, with remember-me and a forgot-password escape hatch.',
  useWhen: [
    'You need the standard email-and-password sign-in with remember-me and reset links.',
  ],
  alternatives: [
    { name: 'login-split-panel', when: 'the sign-in is a full page, not an embedded card, and you want a branded testimonial panel alongside it.' },
    { name: 'login-minimal', when: 'you want the leanest possible sign-in — a single email field for a one-time code, no password at all.' },
    { name: 'login-oauth', when: 'most of your users sign in through Google, GitHub, or Apple rather than a password you store.' },
    { name: 'forgot-password', when: 'the user has already clicked "Forgot your password?" — that\'s a separate card, not a state of this one.' },
  ],
  rules: [
    {
      id: 'remember-me-is-a-convenience',
      do: 'Treat "Remember me" as extending session length, never as the only thing standing between a device and the account.',
      dont: 'Rely on the remember-me checkbox as a security boundary.',
      visual: false,
    },
  ],
  a11y: [
    'Email and password inputs are each labeled via <Label htmlFor>, not placeholder text alone.',
    "The remember-me checkbox has its own <Label>, so its accessible name doesn't depend on proximity.",
  ],
  tokens: ['--card', '--input', '--primary', '--ring', '--radius-xl'],
}
