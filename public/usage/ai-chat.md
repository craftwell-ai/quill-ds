# ai-chat (pattern)

A full AI conversation page — past chats on the left, the thread in a readable column with reasoning, source chips and follow-ups, and the composer with the model picker and AI notice pinned to the bottom.

### When to use
- An app has a page for an ongoing conversation with its AI assistant.

### Reach for instead
- **ai-home** — when people land with nothing typed yet and need a greeting and starters, not a thread.
- **chat** — when two people are messaging; no AI is involved.

### Rules
- **Do:** Keep the thread on the plain page; the marks and the composer edge already say AI. **Don't:** Add the AI glow behind the conversation — it belongs to the AI home alone.
- **Do:** Pass your conversation as children and drive the composer with status, onStop and onSubmit. The conversation shown without children is sample content. For a conversation with nothing in it yet pass null, false or an empty list: those count as passed, and only undefined shows the sample. Scroll to a new turn yourself: the page is what scrolls, so the block does not (the side panel, which scrolls inside itself, does). **Don't:** Ship the sample conversation, or edit the block to hard-code yours — the block is overwritten on update.
- **Do:** Pass the conversation-history block as sidebar: the built-in list of chats is a sample. Pass null for a page with no left column: anything React draws nothing for (null, true, false, an empty string) is no column, so cond && list gives none while cond is false, and only undefined shows the sample list. Pass composerTrailing for your own control in place of the sample model picker (the same values for none). **Don't:** Ship the sample list of chats or the sample model picker.

### Accessibility
- The sample sidebar is a navigation landmark named "Chats" with the open chat marked aria-current; the thread and composer sit in a region named "Conversation". A sidebar you pass names itself (the conversation-history block is a navigation landmark of its own); with sidebar null there is no left column and no navigation landmark. Under 768px wide the left column is not shown, whatever is in it.
- The thread is a log named "Messages", a polite live region, so each new turn is read out as it is added, without moving focus.
- Each reply is an article. A working reply has a status region that is empty at first, filled a moment after it mounts and then updated as the activity changes; once it is stopped, "You stopped this answer." is announced from a status region that was already there.
- The chat links, suggestion chips, source chips and the thinking toggle show the same 3px focus ring as a Button.
- With your own conversation, Stop calls onStop and moves the cursor back to the message box.

### Design tokens
`--background` · `--border` · `--muted` · `--muted-foreground` · `--ai-from` · `--ai-via` · `--ai-to`

