# badge (component)

A small, non-interactive label for status, category, or count — not a button or a link on its own.

### When to use
- You need a compact visual label for a status, category, or count next to other content — a course card, a table cell, a nav item.

### Reach for instead
- **tone-badge** — when the label is one of Quill's uppercase tag pills (status/tier/live cue) — ToneBadge wraps Badge with the pigment vocabulary baked in.
- **button** — when the element needs to trigger an action rather than just display state.

### Rules
- **Do:** Keep badge text to 1–3 words — "Beta", "New", "42 unread". **Don't:** Put a full sentence in a badge — whitespace-nowrap and overflow-hidden clip the overflow instead of wrapping it, mid-word.
- **Do:** Treat Badge as a status display by default; pass `render={<a href=... />}` only when the badge truly needs to be keyboard-navigable or open a URL. **Don't:** Attach an onClick to a bare Badge — a plain `<span>` with a click handler cannot be tabbed to or activated with Enter.

### Accessibility
- Badge renders a plain `<span>` by default — no role, no accessible name beyond its text content, and no keyboard focus.
- Passing `render={<a href=... />}` (as the AsLink story does) swaps the rendered tag via Base UI's useRender, merging Badge's classes onto the real anchor so focus, Enter, and href behavior all come from that native element.

### Design tokens
`--primary` · `--secondary` · `--destructive` · `--border` · `--ring` · `--radius-full`

