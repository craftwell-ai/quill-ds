# dialog (component)

A modal window over the page for focused, non-destructive tasks — forms, details, reversible confirmations.

### When to use
- You need the user to complete a focused task without leaving the page — edit a record, fill a short form, confirm a reversible action.

### Reach for instead
- **alert-dialog** — when the action is destructive or irreversible (delete, overwrite) — AlertDialog forces an explicit choice.
- **sheet** — when the content is secondary context sliding in from an edge and the page should stay visible.
- **drawer** — when you need the edge-panel job on touch devices, with swipe-to-dismiss.
- **popover** — when the content is a small, light overlay anchored to its trigger, not a blocking task.

### Rules
- **Do:** Confirm destructive actions with AlertDialog. **Don't:** Use Dialog to confirm deletes or overwrites — it dismisses too easily.
- **Do:** Keep the default close button, or pass showCloseButton={false} only when a footer button offers an explicit way out. **Don't:** Remove the close button and leave no visible way to dismiss.

### Accessibility
- Focus moves into the dialog on open and returns to the trigger on close.
- Escape closes the dialog.
- Always render DialogTitle — it is the accessible name; pair it with DialogDescription for context.

### Design tokens
`--card` · `--shadow-lg` · `--radius-xl`

