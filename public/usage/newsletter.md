# newsletter (pattern)

A centered newsletter-signup section — an email field, subscribe action, and social proof.

### When to use
- You need an email-capture section with social proof to grow a list.

### Reach for instead
- **contact-form** — when you need more than an email — name, topic, a message — this pattern is intentionally a single field.
- **footer** — when the signup is one small element within a full site footer, not its own standalone section.

### Rules
- **Do:** Say plainly what subscribers are signing up for and that they can leave any time ("No spam, no noise — unsubscribe any time."). **Don't:** Ask for an email with no context on frequency or an easy way out.

### Accessibility
- The email field's &lt;Label> is visually hidden (sr-only) but still present — the placeholder text alone is never a substitute for it.
- Social proof ("Joined by 4,200 fellow practitioners") is supporting text, not the only cue that the form is trustworthy — it does not replace a clear privacy or spam promise.

### Design tokens
`--card` · `--input` · `--primary` · `--muted-foreground`

