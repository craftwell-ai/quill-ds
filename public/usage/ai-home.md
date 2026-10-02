# ai-home (pattern)

An AI assistant's start page — a soft AI glow, a greeting, the large composer with Ask/Agent modes, and starter cards.

### When to use
- An app has a page whose main job is talking to its AI assistant, and people land on it with nothing typed yet.

### Reach for instead
- **prompt-composer** — when you only need the box, inside a page that is about something else.
- **chat** — when two people are messaging; there is no AI.

### Rules
- **Do:** Keep the AI glow to this one start page. **Don't:** Add the glow behind other sections or pages — it marks the AI home, and repeated it becomes decoration.

### Accessibility
- The greeting is the page heading; the composer and starter cards follow in reading order.
- Starter cards are buttons that fill the composer; they do not send on their own.

### Design tokens
`--ai-from` · `--ai-via` · `--ai-to` · `--background` · `--card` · `--muted-foreground`

