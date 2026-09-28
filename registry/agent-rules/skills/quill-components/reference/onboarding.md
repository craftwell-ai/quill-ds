# onboarding (pattern)

A setup checklist card with a progress bar, completed and pending tasks, and start links for remaining steps.

### When to use
- You need a setup checklist that tracks progress and links to remaining steps.

### Reach for instead
- **wizard** — when the steps must happen in a strict sequence in one sitting, not a checklist a user dips in and out of over time.
- **empty-state** — when there's a single action to take, not a multi-step checklist to track.

### Rules
- **Do:** Pair the visual progress bar with a text fraction ("2 of 4 complete") so the state isn't conveyed by bar width alone. **Don't:** Show only a progress bar with no numeric readout of how much is actually done.

### Accessibility
- Completed tasks are marked with both a filled check icon and strikethrough text — two signals, not color or icon alone.
- Each pending task's "Start" link should carry a task-specific accessible name (e.g. "Start: Invite your team") in an installed version — this story renders four identical "Start" labels, which read as indistinguishable to screen-reader users navigating by button list.

### Design tokens
`--primary` · `--primary-foreground` · `--muted` · `--input`

