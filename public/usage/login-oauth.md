# login-oauth (pattern)

Provider-first sign-in — Google, GitHub, and Apple buttons above an email fallback.

### When to use
- Identity comes from a provider (Google, GitHub, Apple) rather than a password you store.

### Reach for instead
- **signup-social** — when this is account creation, not sign-in — signup-social also leads with OAuth providers.
- **login** — when you store first-party passwords and don't want a provider-first order at all.
- **login-minimal** — when you don't have OAuth providers configured and just need a single email field.

### Rules
- **Do:** Treat the provider buttons as the primary path; keep the email form below the rule as a fallback, not the headline. **Don't:** Give the email field equal visual weight to the provider buttons when most users have a provider account.
- **Do:** Keep provider marks as their official inlined artwork, with GitHub and Apple taking currentColor so they invert correctly in Dusk. **Don't:** Restyle a provider mark to match your palette — that breaks the brand guidelines you agree to by using their sign-in.

### Accessibility
- Provider marks are decorative (aria-hidden); each button's accessible name comes from its visible "Continue with X" text, not the icon.
- The email fallback still uses a real &lt;Label htmlFor>, same as every other password/email pattern in this set.

### Design tokens
`--primary` · `--muted-foreground` · `--border` · `--radius`

