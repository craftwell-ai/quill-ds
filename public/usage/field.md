# field (component)

A form field wrapper that connects a Label, FieldDescription, and FieldError to a control.

### When to use
- You have a form control that needs a label, optional helper text, and/or a validation error message wired together.

### Reach for instead
- **label** — when the control needs nothing more than an accessible name — no description, no error state to wire up.

### Rules
- **Do:** Add data-disabled to Field (alongside the control's real disabled attribute) so FieldLabel dims — e.g. `<Field data-disabled>`. **Don't:** Disable only the control and expect FieldLabel to dim on its own — Field doesn't inspect its child's disabled attribute; the dimming is opt-in via data-disabled on Field itself.
- **Do:** Wrap every form control in Field, with FieldLabel/FieldDescription/FieldError as siblings — Field's role="group" plus FieldError's role="alert" gives you the aria wiring for free. **Don't:** Hand-assemble label/input/error markup ad hoc per field — you have to re-derive the association and alert wiring Field already provides.

### Accessibility
- Field renders role="group"; FieldError renders role="alert", so a validation message appearing after submit gets announced automatically.
- FieldLabel dimming on disable is opt-in — set data-disabled on Field yourself; it isn't derived automatically from the control's disabled attribute.
- orientation="horizontal" changes layout only; it does not change any of the aria wiring.

### Design tokens
`--primary` · `--destructive` · `--muted` · `--border` · `--background`

