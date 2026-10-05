# ai-chat (pattern)

A full AI conversation page — past chats on the left, the thread in a readable column with reasoning, source chips and follow-ups, and the composer with the model picker and AI notice pinned to the bottom.

### When to use
- An app has a page for an ongoing conversation with its AI assistant.

### Reach for instead
- **ai-home** — when people land with nothing typed yet and need a greeting and starters, not a thread.
- **chat** — when two people are messaging; no AI is involved.

### Rules
- **Do:** Keep the thread on the plain page; the marks and the composer edge already say AI. **Don't:** Add the AI glow behind the conversation — it belongs to the AI home alone.

### Accessibility
- The sidebar is a navigation landmark named "Chats" with the open chat marked aria-current; the thread and composer sit in a region named "Conversation".
- The thread is a log named "Messages", a polite live region, so each new turn is read out as it is added, without moving focus.
- Each reply is an article. A working reply has a status region that is empty at first, filled a moment after it mounts and then updated as the activity changes; once it is stopped, "You stopped this answer." is announced from a status region that was already there.
- The chat links, suggestion chips, source chips and the thinking toggle show the same 3px focus ring as a Button.

### Design tokens
`--background` · `--border` · `--muted` · `--muted-foreground` · `--ai-from` · `--ai-via` · `--ai-to`

