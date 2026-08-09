# sheet (component)

A panel that slides in from a screen edge while the page stays visible behind it — the same Base UI dialog underneath Dialog, styled as an edge panel instead of a centered card.

### When to use
- You need secondary context or a task panel sliding in from an edge, with the underlying page still visible — settings, item detail, a share menu.

### Reach for instead
- **drawer** — when you want the same edge-panel layout with drag-to-dismiss on touch — Drawer adds Vaul's swipe gesture.
- **dialog** — when the task is a focused, centered action rather than an edge panel.

### Rules
- **Do:** Pick side by role — right for settings/detail, left for navigation, bottom for mobile actions. **Don't:** Default every Sheet to the same side regardless of content — a settings panel and a nav menu should read as spatially different jobs.
- **Do:** Always render SheetTitle — it is the sheet's accessible name, announced when it opens. **Don't:** Skip SheetTitle because the panel's context looks obvious on screen — screen reader users still need an announced name.
- **Do:** Label the trigger with the destination — "Open Settings" — since the panel's content is hidden until it opens. **Don't:** Use a generic label like "Open" — the user has no idea what's inside until they click.

### Accessibility
- Focus moves into the sheet on open and returns to the trigger on close, the same as Dialog.
- Escape closes the sheet; clicking the backdrop also closes it since Sheet is non-destructive.
- Keep the default close button, or pass showCloseButton={false} only when a footer button (usually SheetClose) offers an explicit way out.

### Design tokens
`--popover` · `--shadow-lg` · `--border`

