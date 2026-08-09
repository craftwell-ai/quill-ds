# file-upload (pattern)

An asset-upload card with a drag-and-drop dropzone and a progress-tracked upload queue.

### When to use
- You need drag-and-drop asset upload with a progress-tracked queue.

### Reach for instead
- **contact-form** — when you need a single attachment inside a broader form, not a dedicated upload queue as the whole card.

### Rules
- **Do:** Make the dropzone a real, focusable <button> that also opens a file picker on click/Enter — never make drag-and-drop the only way in. **Don't:** Ship a dropzone that only responds to a pointer drag gesture.
- **Do:** Give each in-progress file its own progress bar, so users can see exactly how far each individual upload has gotten. **Don't:** Show one shared progress bar for the whole queue — users can't tell which file it belongs to or how far any single file has gotten.

### Accessibility
- Each in-progress file's Progress has its own aria-label (e.g. "Uploading field-notes-issue-001.pdf"), not one shared label for the whole queue.
- Every remove button carries a per-file aria-label ("Remove field-notes-issue-001.pdf"), not a generic "Remove".

### Design tokens
`--card` · `--input` · `--muted` · `--primary`

