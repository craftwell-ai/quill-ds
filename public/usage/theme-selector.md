# theme-selector (pattern)

A dropdown picker for the four Quill themes and four pigment accents — sets data-theme/data-accent and persists both to localStorage.

### When to use
- You need to let users switch among Quill's four themes and four accents, persisted to localStorage.

### Reach for instead
- **settings** — when theme choice is one field among many in a broader preferences form, not a standalone quick-switch control.

### Rules
- **Do:** Read the persisted theme/accent from localStorage in an effect, after mount — never during render, or prerendered markup mismatches the client. **Don't:** Read localStorage synchronously during render; that guarantees a hydration mismatch since the server always renders Dawn/moss.

### Accessibility
- The trigger button's aria-label states the current theme by name (e.g. "Theme: Dusk"), not just an icon with no accessible name.
- Both radio groups (Theme, Accent) use DropdownMenuRadioGroup semantics, so the current selection is announced as a checked radio item, not just a visual highlight.

### Design tokens
`--accent-pigment` · `--text-accent-color` · `--link` · `--border`

