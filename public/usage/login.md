# login (pattern)

The standard email-and-password sign-in card, with remember-me and a forgot-password escape hatch.

### When to use
- You need the standard email-and-password sign-in with remember-me and reset links.

### Reach for instead
- **login-split-panel** — when the sign-in is a full page, not an embedded card, and you want a branded testimonial panel alongside it.
- **login-minimal** — when you want the leanest possible sign-in — a single email field for a one-time code, no password at all.
- **login-oauth** — when most of your users sign in through Google, GitHub, or Apple rather than a password you store.
- **forgot-password** — when the user has already clicked "Forgot your password?" — that's a separate card, not a state of this one.

### Rules
- **Do:** Treat "Remember me" as extending session length, never as the only thing standing between a device and the account. **Don't:** Rely on the remember-me checkbox as a security boundary.

### Accessibility
- Email and password inputs are each labeled via <Label htmlFor>, not placeholder text alone.
- The remember-me checkbox has its own <Label>, so its accessible name doesn't depend on proximity.

### Design tokens
`--card` · `--input` · `--primary` · `--ring` · `--radius-xl`

