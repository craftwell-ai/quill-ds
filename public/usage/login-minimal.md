# login-minimal (pattern)

The bare-minimum sign-in — no card chrome, a single email field, sign-in by one-time code.

### When to use
- You need the leanest possible sign-in — a single field for one-time-code entry.

### Reach for instead
- **login** — when you're collecting a password, not sending a one-time code — this pattern has no password field at all.
- **login-oauth** — when you want a provider-first flow instead of email-only.
- **otp-verification** — when the user already submitted their email and you're now showing the six-digit code entry — that's a separate step from this one.

### Rules
- **Do:** Reserve the bare, uncontained layout for cases where the surrounding page or modal already frames it. **Don't:** Drop this pattern directly onto a busy page background with nothing to separate it visually.

### Accessibility
- The heading ("Sign in to Quill") is a real &lt;h1>, giving the page or dialog an accessible name even though there's no visible header chrome.
- The brand mark ("Q") is decorative; it carries no accessible name and isn't announced.

### Design tokens
`--primary` · `--primary-foreground` · `--input` · `--foreground` · `--muted-foreground`

