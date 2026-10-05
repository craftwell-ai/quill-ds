# ai-message (component)

An AI's reply in a conversation — the AI mark on its avatar, the answer as plain readable text, and Copy, Try again and thumbs under it. Ships with UserMessage for the person's side.

### When to use
- A conversation shows answers from an AI, with or without the reasoning and sources behind them.

### Reach for instead
- **chat** — when two people are messaging each other; no AI is involved.
- **ai-popover** — when the AI suggests an edit to selected text rather than answering in a thread.

### Rules
- **Do:** Keep the answer in plain body text; the mark on the avatar already says it is AI. **Don't:** Colour the answer, its bubble or its headings with the AI gradient — answers have to be easy to read at length.
- **Do:** Pass streaming while the answer arrives; the actions wait until it is done. **Don't:** Show Copy and thumbs on a half-written answer — there is nothing finished to copy or judge yet.

### Accessibility
- Each reply is an article; while streaming it is marked aria-busy. To have replies announced as they arrive, render the thread inside a live region (the AI chat pattern uses role="log"). A reply still streaming in should not be re-read chunk by chunk: keep it aria-busy and, where your app streams text, announce the finished answer once instead of every update. Support varies between screen readers, so test with the ones your people use.
- The avatar is decoration, so the name is the reply's only speaker label. hideName takes the name out of view where something nearby already says who is answering (the AI side panel's header); screen readers still read it, and the answer starts level with the avatar. With hideName, leave thinking out when there is none: a component passed there that renders nothing still counts as the first row.
- Pass no children until there is text. An answer made of a custom component that renders nothing still counts as an answer, so it shows a caret and Copy.
- "You stopped this answer." is announced: it appears inside a status region that is already on the page.
- Action buttons have names ("Copy", "Try again", "Good answer", "Bad answer"); the thumbs use aria-pressed.
- Copy says "Copied" for two seconds after a successful copy, and stays "Copy" if the browser refuses.

### Design tokens
`--foreground` · `--muted-foreground` · `--border` · `--card` · `--background` · `--ai-from` · `--ai-via` · `--ai-to`

