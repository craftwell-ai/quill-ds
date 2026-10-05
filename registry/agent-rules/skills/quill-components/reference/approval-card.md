# approval-card (component)

Asks before an AI agent acts — an inline card that names the action, shows exactly what will happen, lets people edit it in place, and has a main button that says what it does.

### When to use
- An AI agent is about to do something on a person's behalf (send, post, pay, delete) and needs a yes first.

### Reach for instead
- **alert-dialog** — when a person started a destructive action themselves and has to confirm it before anything else happens.
- **agent-steps** — when you are showing what the agent is doing, not asking permission for it.

### Rules
- **Do:** Give the main button the action's own words: "Send email", "Delete 3 drafts". **Don't:** Label it "Approve", "OK" or "Yes" — people should not have to read the title to know what they are agreeing to.
- **Do:** Show the real thing: who it goes to, the subject, the text, and one line on the consequence. **Don't:** Ask for approval of a summary ("Send the report?") while hiding what will actually be sent.
- **Do:** Keep the buttons stock: solid ink for the action, destructive for anything that deletes or cannot be undone. **Don't:** Put the AI gradient on the action button — approving has to feel like any other decision.

### Accessibility
- The card is a group named by its title; it sits in the conversation and never takes focus on its own.
- The rows are a description list (term and value).
- Edit is a toggle button (aria-pressed). Pressing it puts the cursor in the field, which is named by bodyLabel.
- The main button is named by the action itself. A body that was given and is now empty disables it.
- The outcome line appears inside a status region that is already on the page, so it is announced; while empty the region is a real box that takes no space. When the person decides, the buttons go and focus moves to that line, so keyboard users keep their place; focus is never pulled in if it was elsewhere on the page.

### Design tokens
`--card` · `--background` · `--border` · `--input` · `--muted` · `--muted-foreground` · `--ink-soft` · `--primary` · `--destructive` · `--ai-from` · `--ai-via` · `--ai-to`

