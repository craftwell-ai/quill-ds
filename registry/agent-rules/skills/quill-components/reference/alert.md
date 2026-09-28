# alert (component)

A single inline status box for a message tied to a specific area of the page. `alerts` is this primitive already assembled into a vertical stack of several.

### When to use
- You need one persistent, inline status message (informational or error) attached to a specific section of a page — not a whole stack of them, and not transient feedback about an action just taken.

### Reach for instead
- **alerts** — when you're showing more than one status message together — reach for the alerts pattern, which stacks them with the right spacing already handled.
- **sonner** — when the message is transient feedback about an action just taken, not a persistent note tied to a page section.

### Rules
- **Do:** Use variant="destructive" for real errors, and leave the default variant for neutral or informational messages, as the AllVariants story does. **Don't:** Style a real error with the default (neutral) variant — a blocking failure that looks like routine information gets missed.
- **Do:** Include an icon (the Icon component, as most stories here do) so severity is scannable at a glance — the layout automatically reserves a leading column for it. **Don't:** Omit the icon on a destructive or otherwise consequential alert, leaving severity to be read from color or text alone.

### Accessibility
- Alert renders `role="alert"`, a live region assistive tech announces automatically when it mounts — reserve it for messages that need attention, not decorative or already-visible content.
- Severity is conveyed by variant plus an icon, never color alone — a destructive alert's red text by itself isn't sufficient for colorblind users.
- AlertAction positions its child absolutely in the corner — pair it with a real accessible control (e.g. a Button with `aria-label`, as the WithAction story does), not an unlabeled icon.

### Design tokens
`--card` · `--ink` · `--destructive` · `--radius-lg`

