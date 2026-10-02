# prompt-composer (component)

The box people type to an AI in — grows with the text, sends on Enter, turns Send into Stop while the AI works, with slots for tools, files and a model picker.

### When to use
- People type a request to an AI: an assistant page, a chat thread, a side panel, or an "ask about this" bar.

### Reach for instead
- **chat** — when two people are messaging each other and no AI is involved.
- **textarea** — when it is an ordinary form field whose text is saved, not sent to an AI.

### Rules
- **Do:** Let the composer draw its own AI edge: muted at rest, full on focus, sweeping while working. **Don't:** Wrap it in a thick glowing gradient ring or a second border — one thin line marks AI.
- **Do:** Keep Send and Stop solid ink in the same spot. **Don't:** Fill the Send button with the AI gradient — it competes with the edge and breaks the never-on-Send rule.
- **Do:** Use `lg` on an AI home page and `sm` in threads, side panels and inline bars. **Don't:** Put the large composer inside a narrow panel — use `sm`.
- **Do:** Set `status="working"` while the AI answers and pass `onStop`. **Don't:** Disable the whole composer while the AI works — people should be able to stop it.

### Accessibility
- The text box has an accessible name (`label`, default "Message").
- Enter sends, Shift+Enter adds a line, and Enter while an input method is composing text (Japanese, Chinese) never sends.
- While working, the send button becomes "Stop" and keeps focus position; the edge animation stops under reduced motion.
- Errors are announced with `role="alert"` under the box.

### Design tokens
`--ai-from` · `--ai-via` · `--ai-to` · `--background` · `--line-control` · `--primary` · `--primary-foreground` · `--destructive`

