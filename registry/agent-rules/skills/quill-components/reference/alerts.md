# alerts (pattern)

A vertical stack of informational, success, and destructive alerts with icons.

### When to use
- You need to surface inline status messages of varying severity (info, success, destructive) within a page.

### Reach for instead
- **sonner** — when the message is transient feedback about an action just taken — use a toast, not an inline alert.
- **announcement-banner** — when the message is site-wide and dismissible rather than local to a page section.
- **empty-state** — when the "message" is really an empty view that needs an explanation and a call to action.

### Rules
- **Do:** Match severity to consequence: destructive for blocking errors, default for neutral information. **Don't:** Use destructive styling for emphasis on non-error messages.

### Accessibility
- Severity is conveyed by the icon and the text, never by color alone.

