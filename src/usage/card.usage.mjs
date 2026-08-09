export const usage = {
  name: 'card',
  kind: 'component',
  summary: 'A bounded content container with header, body, and footer slots — paper-warm surface with a soft ring instead of a box-shadow border.',
  useWhen: [
    'You need to group related content (a course, a stat, a settings section) in a bounded surface with consistent padding and optional header/footer regions.',
  ],
  alternatives: [
    { name: 'item', when: 'the content is one row in a list or feed rather than a standalone bounded surface — Item is the lighter-weight primitive for that.' },
  ],
  rules: [
    {
      id: 'card-footer-for-actions',
      do: 'Put footer actions in CardFooter — it gets a top border and `bg-muted/50` for free, visually separating it from the body.',
      dont: 'Add a Button straight into CardContent as the last element — it sits flush with the body text with no visual break.',
      visual: true,
    },
    {
      id: 'action-in-header',
      do: 'Place CardAction inside CardHeader for a top-right control (a badge, an icon button) alongside the title — it already handles the grid placement.',
      dont: 'Position a top-right action outside CardHeader with hand-rolled absolute positioning instead of using CardAction.',
      visual: false,
    },
  ],
  a11y: [
    'Card and its parts (CardHeader, CardContent, CardFooter, CardAction) are all plain `<div>`s with no built-in role or heading semantics.',
    'CardTitle is a styled `<div>`, not a real heading — add real heading markup (`<h2>`–`<h6>`) inside it when the card needs to appear in the page\'s heading outline.',
  ],
  tokens: ['--card', '--card-foreground', '--foreground', '--muted', '--border', '--radius-xl'],
}
