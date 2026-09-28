# announcement-banner (pattern)

Two dismissible announcement banners — an inline bordered page banner and a full-bleed primary-color variant.

### When to use
- You need to announce something site-wide with a dismissible banner, either inline or full-bleed.

### Reach for instead
- **alerts** — when the message is local to a page section and tied to system status, not a site-wide announcement.
- **cookie-consent** — when the banner requires an explicit choice (accept/reject), not just a dismiss.

### Rules
- **Do:** Give every banner variant its own dismiss button with a specific aria-label (e.g. "Dismiss workshop banner"), not a generic one. **Don't:** Ship a banner with no way to dismiss it, or multiple banners sharing one ambiguous "Dismiss" label.

### Accessibility
- Each banner's dismiss button has a distinct, content-specific aria-label so screen-reader users can tell which banner they're closing when more than one is stacked.
- The full-bleed variant's dismiss icon overrides its hover color explicitly (text-primary-foreground) so it stays visible against the primary-color background, not just inheriting a default that might vanish.

### Design tokens
`--card` · `--border` · `--primary` · `--primary-foreground`

