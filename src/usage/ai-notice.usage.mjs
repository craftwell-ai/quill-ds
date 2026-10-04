export const usage = {
  name: 'ai-notice',
  kind: 'component',
  summary: 'One quiet line under an AI composer saying the AI can be wrong, with an optional link the app supplies.',
  useWhen: ['A composer sends to an AI and people should know its answers need checking.'],
  alternatives: [
    { name: 'alert', when: 'something has actually gone wrong and needs the person to act.' },
    { name: 'ai-badge', when: 'one piece of content was made by AI and needs labelling where it sits.' },
  ],
  rules: [
    {
      id: 'quiet-line-not-banner',
      do: 'Keep the notice to one small centred line under the composer, always present.',
      dont: 'Turn it into a banner, a callout box or a toast — it is there every time, so it stays quiet.',
      visual: true,
    },
    {
      id: 'readable-grey',
      do: 'Leave it in muted ink, which passes 4.5:1 in every theme.',
      dont: 'Lighten it further with opacity — a disclaimer people cannot read does not inform them.',
      visual: false,
    },
  ],
  a11y: ['Plain paragraph text; the optional link is a normal underlined link with its own words.'],
  tokens: ['--muted-foreground'],
}
