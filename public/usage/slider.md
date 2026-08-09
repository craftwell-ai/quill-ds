# slider (component)

A draggable control for picking a numeric value, or range, within a bounded min/max — position matters as much as the exact figure.

### When to use
- You need the user to pick one number, or a two-ended range, between a min and max by dragging rather than typing.

### Reach for instead
- **input** — when the value needs to be exact — an Input with type="number" is easier to type a precise figure into than to drag onto.
- **progress** — when you only need to display a value, not let the user change it — Progress is read-only, Slider is always interactive.

### Rules
- **Do:** Pair Slider with a visible label and current-value readout above it — the control itself renders no text. **Don't:** Drop a bare Slider on the page with nothing telling the user what they are adjusting or what it is currently set to.
- **Do:** Pass defaultValue, or value, as an array — one element for a single handle, two for a range. **Don't:** Pass a bare number instead of an array — Slider always expects array input, even for a single thumb.

### Accessibility
- Each thumb is a native `<input type="range">`, so Arrow keys, Home/End, and Page Up/Down all adjust the value for free.
- Every thumb gets a default aria-label ("Minimum"/"Maximum" for a range, "Value" for a single thumb) — override it with something specific, like "Volume," when the number means more than just a value.
- aria-valuetext and aria-orientation are set automatically so screen readers announce the current position, not just a raw number.

### Design tokens
`--primary` · `--input` · `--ring`

