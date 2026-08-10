# settings (pattern)

A profile settings card — name fields, a bio textarea, and an email-notification toggle.

### When to use
- You need a profile settings form with name, bio, and notification preferences.

### Reach for instead
- **contact-form** — when you're sending a one-off message, not editing a persistent profile.
- **wizard** — when setup needs multiple sequential steps, not a single settings page a user returns to and edits freely.

### Rules
- **Do:** Keep Save changes and Cancel as two distinct, clearly differentiated actions (primary vs ghost). **Don't:** Make Cancel look as prominent as Save — the user should never mis-tap away unsaved changes as the default action.

### Accessibility
- The notification toggle's &lt;Label> and the Switch share the same id/htmlFor pairing, so clicking the label text also toggles the switch.
- The switch's current state (on/off) is exposed through its own semantics, not conveyed by color alone.

### Design tokens
`--card` · `--input` · `--primary` · `--border`

