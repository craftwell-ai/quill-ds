# ai-badge (component)

A small outline pill with the AI sparkle that marks content an AI made or suggested — "AI draft", "Suggested".

### When to use
- A card, field, list row or message holds content the AI wrote or proposed, and people should know before they rely on it.

### Reach for instead
- **tone-badge** — when the label is a status, tier or category rather than "made by AI".
- **ai-mark** — when there is no room for words and the mark alone is enough.

### Rules
- **Do:** Use the AI badge to say who made the content: "AI draft", "Suggested", "Generated". **Don't:** Use it as a status ("Active", "New") — status belongs to ToneBadge.

### Accessibility
- Renders through Badge as a non-interactive span; the words carry the meaning and the mark is decorative.

### Design tokens
`--ai-from` · `--ai-via` · `--ai-to` · `--ink-soft`

