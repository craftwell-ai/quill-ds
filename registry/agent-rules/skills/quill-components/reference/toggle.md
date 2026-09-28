# toggle (component)

A two-state icon or icon-plus-text button whose pressed state persists after the click — a formatting toggle inside a toolbar.

### When to use
- You need a single button whose on/off (pressed) state sticks after clicking — bold, italic, a filter chip.

### Reach for instead
- **button** — when the click fires a one-time action instead of persisting a pressed state.
- **switch** — when the two-state control represents a labeled setting, not an icon action — Switch pairs with a text Label, Toggle usually sits icon-only in a toolbar.
- **toggle-group** — when you have several related Toggles that should share selection state or sizing — reach for the group instead of several standalone Toggles.

### Rules
- **Do:** Give every icon-only Toggle an explicit aria-label, e.g. "Bold." **Don't:** Ship an icon-only Toggle with no aria-label — there is no visible text to fall back on as the accessible name.
- **Do:** Use defaultPressed for uncontrolled state, or pressed + onPressedChange for controlled. **Don't:** Pass both defaultPressed and pressed — pressed wins and defaultPressed is silently ignored.
- **Do:** Use variant="outline" for a Toggle that stands alone outside a toolbar or ButtonGroup, so it has a visible boundary before it is ever pressed. **Don't:** Leave a standalone Toggle at the default variant — bg-transparent with no border makes it invisible until hover or press.

### Accessibility
- Renders a real `<button>` with aria-pressed reflecting on/off — unlike Checkbox and Switch, both Enter and Space activate it, since it is a native button rather than a checkbox input.
- aria-invalid drives the destructive border/ring, the same token pattern as the rest of the form-control set.
- Icon-only Toggles need an aria-label — there is no visible text to serve as the accessible name.

### Design tokens
`--muted` · `--foreground` · `--input` · `--ring` · `--destructive`

