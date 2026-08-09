# label (component)

The accessible name for a form control — always associate it via htmlFor/id or co-location.

### When to use
- Every form control needs a Label — even when a placeholder or surrounding text seems to explain it.

### Reach for instead
- **field** — when you're building a full form field — Field wraps Label with FieldDescription/FieldError and the aria wiring between them.

### Rules
- **Do:** Put the disabled-able control (className="peer") before Label in DOM order when you want the label to dim on disable — reverse the visual order with flex-col-reverse if the label needs to read first. **Don't:** Place Label before the control in DOM order and expect peer-disabled to dim it — the CSS sibling selector only looks at siblings that come after the peer, so the label never dims.
- **Do:** Associate Label with its control via htmlFor/id, or wrap the control inside it. **Don't:** Render a Label with no htmlFor and no co-location — screen readers cannot connect it to any control.

### Accessibility
- A native `<label>`; htmlFor/id association (or wrapping the control) gives it the accessible-name link and native click-to-focus behavior for free.
- Dimming (peer-disabled / group-data-[disabled=true]) is presentation only — it doesn't itself announce "disabled" to assistive tech; that comes from the control's own disabled attribute.
- Renders whatever children you pass — there is no built-in required-field marker; add that content yourself if the field is required.

### Design tokens
`--ink-soft`

