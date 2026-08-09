# sonner (component)

A toast-notification stack for transient feedback about an action just taken — mount one Toaster at the app root, then trigger toasts imperatively with the `toast()` function from `sonner`.

### When to use
- You need brief, self-dismissing feedback about an action the user just took (saved, deleted, upload failed) that shouldn't block the page or require explicit dismissal.

### Reach for instead
- **alert** — when the message is persistent and tied to a specific section of the page, not a transient notification that disappears on its own.
- **alerts** — when you need several persistent status messages stacked inline, not ephemeral toasts.

### Rules
- **Do:** Mount exactly one Toaster at the app root — Quill's Storybook preview does this globally, so individual stories never render their own. **Don't:** Add a second local Toaster inside a page or story — two toast regions trip axe's landmark-unique rule and can double-render the same toast.
- **Do:** Call the typed variant that matches the outcome (`toast.success`, `toast.error`, `toast.info`, `toast.warning`, `toast.loading`) — each ships its own icon, so meaning reads before the copy does. **Don't:** Call the untyped `toast()` for a message that's really a success or an error — it renders with no icon and no semantic color, so the outcome is buried in the text.
- **Do:** Keep toast copy to one short sentence — a status update, not an explanation. **Don't:** Pack a paragraph of detail into a toast — it auto-dismisses before anyone can finish reading it.

### Accessibility
- Toaster wraps its region in `aria-live="polite"` (`aria-relevant="additions text"`) automatically, so new toasts are announced without moving focus — a second Toaster on the page duplicates this live region, which is what trips the landmark-unique check.
- The live region's accessible name defaults to "Notifications" plus the reveal hotkey, overridable via the `containerAriaLabel` prop.
- Individual toasts carry no `role` of their own — the announcement comes entirely from the wrapping live region, so every toast needs real, readable text (not an icon alone) to be announced meaningfully.

### Design tokens
`--popover` · `--popover-foreground` · `--border` · `--radius`

