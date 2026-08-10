# chat (pattern)

A one-on-one messaging panel — contact header, message bubbles, and a composer input.

### When to use
- You need a one-on-one messaging panel with a contact header, bubbles, and a composer.

### Reach for instead
- **list-detail** — when you need a list of conversations alongside the open thread, not just the single open thread.
- **notifications** — when the messages are one-way system alerts, not a two-way conversation with someone.

### Rules
- **Do:** Align the current user's messages to one side (right) and the other party's to the other (left) — position is the primary cue for who said what. **Don't:** Rely on color alone to distinguish sender — pair it with consistent alignment.

### Accessibility
- The composer's Input has an explicit aria-label ("Message") since there's no visible &lt;label> in this compact layout.
- The send button is icon-only with an aria-label ("Send") — never ship it without one.

### Design tokens
`--border` · `--card` · `--primary` · `--muted`

