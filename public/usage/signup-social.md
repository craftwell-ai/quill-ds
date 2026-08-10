# signup-social (pattern)

Signup that leads with GitHub and Google provider buttons, falling back to an email/password form.

### When to use
- You need signup that leads with OAuth providers and falls back to email/password.

### Reach for instead
- **signup** — when you don't have OAuth providers configured, or want email/password as the primary path, not a fallback.
- **login-oauth** — when this is sign-in, not new-account creation — login-oauth is the matching pattern for returning users.

### Rules
- **Do:** Put the provider buttons above the divider and the email/password fields below it, matching login-oauth's provider-first order. **Don't:** Bury the provider buttons below a full email/password form — that defeats the point of offering them.

### Accessibility
- Provider marks (GitHub, Google) are decorative; button accessible names come from the visible "Continue with X" text.
- Email and password fields keep real &lt;Label htmlFor> pairs even though they're the fallback path, not the headline.

### Design tokens
`--card` · `--input` · `--primary` · `--border`

