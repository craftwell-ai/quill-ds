# cookie-consent (pattern)

A cookie consent banner offering accept, reject, and preferences actions.

### When to use
- You need a compliance banner offering accept, reject, and preferences choices.

### Reach for instead
- **announcement-banner** — when the message is informational only and doesn't require an explicit accept/reject decision.
- **alerts** — when the message is a local, in-page status, not a site-wide compliance notice.

### Rules
- **Do:** "Reject non-essential" gets the same one-click ease as "Accept all" — both are top-level buttons, not one button plus a buried settings link. **Don't:** Make rejecting cookies harder to find or reach than accepting them — that's a dark pattern, not a real choice.

### Accessibility
- All three choices (Accept all, Reject non-essential, Preferences) are real, separately labeled buttons, not one deceptively generic "OK".
- The banner's icon is decorative; the actual compliance information is conveyed entirely through the paragraph text, not the icon.

### Design tokens
`--card` · `--border` · `--muted-foreground`

