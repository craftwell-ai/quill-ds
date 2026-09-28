# popover (component)

A small, click-triggered overlay anchored to its trigger — for inline forms, filters, and contextual editing, not a blocking task.

### When to use
- You need a compact, interactive surface anchored to a button — an inline form, a filter, a quick edit — that opens on an explicit click.

### Reach for instead
- **dialog** — when the content is a focused, blocking task rather than a light contextual overlay anchored to a trigger.
- **hover-card** — when you want it to open on hover instead of a click, for glanceable preview content.
- **tooltip** — when you only need a one-line hint, not an interactive popup with its own content.

### Rules
- **Do:** Open Popover on click — it's built for a deliberate, explicit interaction. **Don't:** Wire Popover to open on hover to mimic HoverCard — Popover has no built-in hover trigger; use HoverCard, or Popover's own openOnHover prop if you need an accessible hover-triggered popup.
- **Do:** Give the popover a PopoverTitle so its content stays connected to what triggered it ("Rename workspace"). **Don't:** Drop straight into form fields with no PopoverTitle — the popup has no heading tying it back to the trigger that opened it.

### Accessibility
- Focus moves into the popover on open; Escape or an outside click closes it and returns focus to the trigger.
- Popover has no built-in close button — dismissal relies on Escape or outside click, so don't nest content so deep that outside click becomes hard to reach.
- PopoverContent is fixed at w-72 (288px) — keep content short; a multi-section form belongs in Dialog or Sheet instead.

### Design tokens
`--popover` · `--shadow-md` · `--radius-lg`

