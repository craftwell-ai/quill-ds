# drawer (component)

A bottom- or edge-anchored panel built on Vaul, with drag-to-dismiss — a mobile-first alternative to Dialog's centered modal.

### When to use
- You need a mobile-first interaction — filters, quick actions, secondary navigation — that slides in from an edge and can be dragged closed.

### Reach for instead
- **sheet** — when you don't need the drag gesture — Sheet is the same edge-panel job without Vaul's swipe-to-dismiss.
- **dialog** — when the task is a focused, centered action rather than a mobile-style edge panel.

### Rules
- **Do:** Wrap the trigger child with asChild on DrawerTrigger — Drawer is built on Vaul, which uses Radix's composition API. **Don't:** Pass a `render` prop to DrawerTrigger the way you would for Sheet or Dialog — those are Base UI components; Drawer has no render prop.
- **Do:** Leave the default direction="bottom" for mobile-style quick actions and filters — that's also the only direction that renders the drag handle. **Don't:** Set direction="left/right/top" out of habit for every Drawer — bottom is the touch-first pattern Vaul is built around.
- **Do:** Label the trigger for what will open — "Open side panel" for a direction="right" Drawer, not a generic "Open drawer." **Don't:** Reuse a generic "Open drawer" label regardless of direction — a right-side panel trigger that still says "Open drawer" reads like the default bottom sheet.

### Accessibility
- Extends the same dialog semantics as Dialog: focus moves into the panel on open and returns to the trigger on close.
- Drag-to-dismiss is a pointer/touch gesture only — Escape and DrawerClose remain the keyboard and screen-reader way to close it.
- Always render DrawerTitle — it is the accessible name; pair it with DrawerDescription for context.

### Design tokens
`--popover` · `--muted` · `--border` · `--radius-xl`

