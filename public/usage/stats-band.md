# stats-band (pattern)

A marketing band of headline statistics separated by vertical dividers on a card background.

### When to use
- You need a marketing band of headline statistics separated by dividers.

### Reach for instead
- **stat-cards** — when each number needs its own card with a period-over-period delta — this pattern is a single flat band with no per-item chrome or comparison.
- **feature-section** — when you're describing capabilities, not reporting numbers.

### Rules
- **Do:** Color headline numbers from the accent-driven token (--accent-pigment), so they follow the page's data-accent like every other emphasis element. **Don't:** Hardcode a fixed pigment (e.g. --terracotta) for the numbers — that breaks when a consumer sets a different accent.

### Accessibility
- Dividers between stats are decorative and hidden on narrow viewports where the layout stacks — the numbers and labels alone carry the meaning.
- Every number is paired with its own visible label directly beneath it ("Components", "Patterns") — a bare number is never left to speak for itself.

### Design tokens
`--card` · `--accent-pigment` · `--muted-foreground`

