# contact-form (pattern)

A get-in-touch card — name, email, a topic select, and a message field.

### When to use
- You need a get-in-touch form with name, email, topic, and message fields.

### Reach for instead
- **newsletter** — when you only need a single email field to grow a list, not a full multi-field inquiry form.
- **settings** — when the fields are updating an existing profile, not sending a one-off message.

### Rules
- **Do:** State a response-time expectation in the description ("We usually reply within one working day.") so the form doesn't feel like it disappears into a void. **Don't:** Leave users with no sense of whether or when they'll hear back.

### Accessibility
- Every field, including the Select, has its own &lt;Label htmlFor>, and the topic Select's trigger id matches its label's htmlFor.
- The markdown hint under Message is supplementary text, not a replacement for the field's own label.

### Design tokens
`--card` · `--input` · `--primary` · `--muted-foreground`

