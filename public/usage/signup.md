# signup (pattern)

Standard account-creation card — name, email, password, and a link back to sign-in.

### When to use
- You need standard account creation — name, email, password, and a sign-in link.

### Reach for instead
- **signup-social** — when you want OAuth providers to lead instead of a bare email/password form.
- **login** — when the user already has an account — this card is only for new ones.

### Rules
- **Do:** Use the description line to state what happens next (trial length, no card required) so the form isn't just fields with no context. **Don't:** Leave the card as a bare field list with no framing for why someone would fill it out.

### Accessibility
- All three fields (name, email, password) have their own <Label htmlFor>; the password placeholder is a hint, not a substitute for real validation messaging.
- The "Sign in" link at the bottom is a real <a>, not a button — it's a navigation, and should read as one to assistive tech.

### Design tokens
`--card` · `--input` · `--primary` · `--muted-foreground`

