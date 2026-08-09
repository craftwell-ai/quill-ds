# checkbox (component)

A single independent yes/no selection — check it or leave it, with no relation to any other Checkbox.

### When to use
- You need one or more independent boolean choices — accept terms, opt into a list, select several rows in a table.

### Reach for instead
- **radio-group** — when only one of several options can be true at once — Checkbox has no concept of mutual exclusion.
- **switch** — when the boolean is a setting that applies immediately, not a value collected as part of a form.

### Rules
- **Do:** Always pair Checkbox with a Label via htmlFor/id, or wrap both in one label — not just visual proximity to nearby text. **Don't:** Render a bare Checkbox next to plain text with no htmlFor/id association — screen readers announce no name.
- **Do:** Mark a failed validation with aria-invalid — the border and ring switch to --destructive automatically. **Don't:** Reach for a custom red className to show an error state — it fights the built-in invalid styling and skips the aria wiring assistive tech needs.
- **Do:** Use Checkbox for independent yes/no selections — each one can be true or false on its own. **Don't:** Group several Checkboxes to represent a single mutually-exclusive choice — that's what RadioGroup is for.

### Accessibility
- Renders role="checkbox" with aria-checked reflecting true/false (or "mixed" for an indeterminate state).
- A visually-hidden native `<input type="checkbox">` underneath handles the real keyboard behavior — Space toggles it, Enter is deliberately blocked so it cannot double as a submit trigger.
- aria-invalid drives the destructive border/ring automatically, the same token pattern as Input and Select.

### Design tokens
`--primary` · `--input` · `--ring` · `--destructive` · `--radius-sm`

