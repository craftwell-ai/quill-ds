export const usage = {
  name: 'hero',
  kind: 'pattern',
  summary: 'A centered marketing hero — a release badge, serif headline, supporting copy, and primary/secondary calls to action.',
  useWhen: [
    'You need the top-of-page marketing statement — headline, supporting copy, and calls to action.',
  ],
  alternatives: [
    { name: 'feature-section', when: "you're past the opening statement and need to break down specific product capabilities." },
    { name: 'announcement-banner', when: "the message is a small, dismissible update, not the page's primary opening statement." },
  ],
  rules: [
    {
      id: 'one-primary-cta',
      do: 'Keep exactly one primary (default-variant) button — the single most important action — with any secondary action as outline/ghost.',
      dont: 'Give two calls-to-action equal visual weight; competing primaries dilute the one action that matters most.',
      visual: false,
    },
  ],
  a11y: [
    "The headline is a real <h1> — a hero is typically the page's first heading and its accessible name.",
    'The release badge ("New — v2.0 is here") is supplementary context, not the page\'s only way to communicate the headline\'s message — it is not a substitute for the <h1>.',
  ],
  tokens: ['--background', '--foreground', '--primary', '--secondary'],
}
