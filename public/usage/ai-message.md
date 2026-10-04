# ai-message (component)

An AI's reply in a conversation — the AI mark on its avatar, the answer as plain readable text, and Copy, Try again and thumbs under it. Ships with UserMessage for the person's side.

### When to use
- A conversation shows answers from an AI, with or without the reasoning and sources behind them.

### Reach for instead
- **chat** — when two people are messaging each other; no AI is involved.

### Rules
- **Do:** Keep the answer in plain body text; the mark on the avatar already says it is AI. **Don't:** Colour the answer, its bubble or its headings with the AI gradient — answers have to be easy to read at length.
- **Do:** Pass streaming while the answer arrives; the actions wait until it is done. **Don't:** Show Copy and thumbs on a half-written answer — there is nothing finished to copy or judge yet.

### Accessibility
- Each reply is an article; while streaming it is marked aria-busy. To have replies announced as they arrive, render the thread inside a live region (the AI chat pattern uses role="log").
- "You stopped this answer." is announced: it appears inside a status region that is already on the page.
- Action buttons have names ("Copy", "Try again", "Good answer", "Bad answer"); the thumbs use aria-pressed.
- Copy says "Copied" for two seconds after a successful copy, and stays "Copy" if the browser refuses.

### Design tokens
`--foreground` · `--muted-foreground` · `--border` · `--card` · `--background` · `--ai-from` · `--ai-via` · `--ai-to`

