# textarea (component)

A styled native `<textarea>` for multi-line free text — descriptions, bios, comments.

### When to use
- You need multi-line free-form text entry where a single-line Input would truncate or wrap awkwardly.

### Reach for instead
- **input** — when the value is a single line — a name, an email, a search query.
- **input-group** — when you need an addon (a label like "Note", an icon) attached to a multi-line field — InputGroupTextarea handles that composition.

### Rules
- **Do:** Always pair Textarea with a Label. **Don't:** Render a bare Textarea with no associated Label.
- **Do:** Set aria-invalid on Textarea for validation errors — same destructive ring token as Input. **Don't:** Style the error state by hand instead of using aria-invalid.

### Accessibility
- Renders a plain native `<textarea>`; no Label is provided automatically — associate one via htmlFor/id.
- field-sizing-content lets the box grow with typed content past its rows-based starting height, rather than staying fixed and scrolling internally.
- aria-invalid="true" applies the same destructive border/ring treatment as Input.

### Design tokens
`--input` · `--ring` · `--destructive` · `--radius-lg`

