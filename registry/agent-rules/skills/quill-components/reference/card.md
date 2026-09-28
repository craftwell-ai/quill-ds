# card (component)

A bounded content container with header, body, and footer slots — paper-warm surface with a soft ring instead of a box-shadow border.

### When to use
- You need to group related content (a course, a stat, a settings section) in a bounded surface with consistent padding and optional header/footer regions.

### Reach for instead
- **item** — when the content is one row in a list or feed rather than a standalone bounded surface — Item is the lighter-weight primitive for that.

### Rules
- **Do:** Put footer actions in CardFooter — it gets a top border and `bg-muted/50` for free, visually separating it from the body. **Don't:** Add a Button straight into CardContent as the last element — it sits flush with the body text with no visual break.
- **Do:** Place CardAction inside CardHeader for a top-right control (a badge, an icon button) alongside the title — it already handles the grid placement. **Don't:** Position a top-right action outside CardHeader with hand-rolled absolute positioning instead of using CardAction.

### Accessibility
- Card and its parts (CardHeader, CardContent, CardFooter, CardAction) are all plain `<div>`s with no built-in role or heading semantics.
- CardTitle is a styled `<div>`, not a real heading — add real heading markup (`<h2>`–`<h6>`) inside it when the card needs to appear in the page's heading outline.

### Design tokens
`--card` · `--card-foreground` · `--foreground` · `--muted` · `--border` · `--radius-xl`

