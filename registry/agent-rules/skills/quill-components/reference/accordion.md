# accordion (component)

A vertically stacked set of expand/collapse sections — one open at a time by default, with an option to allow several.

### When to use
- You have several related content sections (FAQ answers, grouped settings) that don't all need to stay visible at once, and users scan headings before choosing one to open.

### Reach for instead
- **collapsible** — when you need a single standalone toggle, not a group of items sharing expand/collapse semantics.
- **tabs** — when the sections should swap in place behind a row of triggers instead of stacking and expanding vertically.

### Rules
- **Do:** Leave `multiple` unset for content where only one answer should be open at a time (FAQs) — opening a new item closes the previous one. **Don't:** Turn on `multiple` for content that reads as a single answer set — several open items at once get hard to compare and scroll past.
- **Do:** Leave the trigger's hover state as an underline with no background fill, as the default styling does, so the hairline-bordered list stays visually light. **Don't:** Add a background fill on hover — it turns each row into a heavy button and fights the intentionally minimal, hairline-divided look.

### Accessibility
- AccordionTrigger renders a real `<button>` with `aria-expanded` and `aria-controls` pointing at its panel — Enter and Space toggle it like any native disclosure control.
- The up/down chevron icons are decorative and already `aria-hidden` by default (Icon only exposes an icon to assistive tech when you pass it an explicit `aria-label`) — the open/closed state itself is announced through `aria-expanded`, not the icon swap.
- `aria-disabled` removes an item's trigger from interaction without hiding it, so screen reader users still see the option exists, just unavailable.

### Design tokens
`--ink` · `--line-soft` · `--radius-lg` · `--ring`

