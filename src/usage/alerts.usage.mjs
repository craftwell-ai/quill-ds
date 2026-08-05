export const usage = {
  name: 'alerts',
  kind: 'pattern',
  summary: 'A vertical stack of informational, success, and destructive alerts with icons.',
  useWhen: [
    'You need to surface inline status messages of varying severity (info, success, destructive) within a page.',
  ],
  alternatives: [
    { name: 'sonner', when: 'the message is transient feedback about an action just taken — use a toast, not an inline alert.' },
    { name: 'announcement-banner', when: 'the message is site-wide and dismissible rather than local to a page section.' },
    { name: 'empty-state', when: 'the "message" is really an empty view that needs an explanation and a call to action.' },
  ],
  rules: [
    {
      id: 'severity-matches-consequence',
      do: 'Match severity to consequence: destructive for blocking errors, default for neutral information.',
      dont: 'Use destructive styling for emphasis on non-error messages.',
      visual: false,
    },
  ],
  a11y: [
    'Severity is conveyed by the icon and the text, never by color alone.',
  ],
  tokens: [],
}
