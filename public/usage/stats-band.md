# stats-band (pattern)

A marketing band of headline statistics separated by vertical dividers on a card background.

### When to use
- You need a marketing band of headline statistics separated by dividers.

### Reach for instead
- **stat-cards** — when each number needs its own card with a period-over-period delta — this pattern is a single flat band with no per-item chrome or comparison.
- **feature-section** — when you're describing capabilities, not reporting numbers.

### Rules
- **Do:** Color headline numbers from the accent's TEXT cut (--accent-pigment-text), so they follow the page's data-accent and still clear WCAG contrast on every ground. **Don't:** Use --accent-pigment for text. That is the decorative cut: on a Dawn card it is 2.9:1 for moss (the default accent) and 2.1:1 for gold, both under the 3:1 large-text minimum. It is also what --link and --ring already avoid. And never hardcode a fixed pigment (e.g. --terracotta) — that breaks the moment a consumer sets a different accent.
- **Do:** Pair every headline number with its own visible label directly beneath it (e.g. "Components"), as every stat in this band does. **Don't:** Ship a bare number with no label — a viewer has no way to tell what it counts.

### Accessibility
- Dividers between stats are decorative and hidden on narrow viewports where the layout stacks — the numbers and labels alone carry the meaning.
- Every number is paired with its own visible label directly beneath it ("Components", "Patterns") — a bare number is never left to speak for itself.
- Headline numbers use --accent-pigment-text, not --accent-pigment: the decorative cut fails the 3:1 large-text minimum on light grounds for the moss and gold accents.

### Design tokens
`--card` · `--accent-pigment-text` · `--muted-foreground`

