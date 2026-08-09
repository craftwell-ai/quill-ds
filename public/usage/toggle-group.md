# toggle-group (component)

A row, or column, of Toggle buttons sharing selection, sizing, and spacing — single-select for exclusive choices, multi-select for independent ones.

### When to use
- You have several related two-state toggles that should behave, size, and style as one group rather than as standalone Toggles.

### Reach for instead
- **toggle** — when you only need one standalone two-state button, not a group sharing selection or sizing.
- **radio-group** — when the choices are described in words rather than icons — RadioGroup labeled dots read better for a list of text options.
- **button-group** — when the buttons fire one-off actions instead of holding a persisted pressed state.

### Rules
- **Do:** Pass multiple for independent options that can all be on at once, like bold, italic, and underline together; omit it for mutually-exclusive choices, like alignment, where picking one clears the rest. **Don't:** Omit multiple on a formatting toolbar — selecting italic silently deselects bold.
- **Do:** Use spacing={0} for a connected, segmented-button look — it works with both the default and outline variants. **Don't:** Leave the default spacing between icon-only items when you want a single fused control — the gaps break the segmented-control read.

### Accessibility
- Overrides Base UI default role="group" with role="toolbar" so aria-orientation is valid on the container — arrow keys move focus between items.
- Each ToggleGroupItem carries its own aria-pressed, exactly like a standalone Toggle.
- variant and size set on ToggleGroup cascade to every item automatically — do not set them again on individual items.

### Design tokens
`--muted` · `--foreground` · `--input` · `--ring` · `--destructive`

