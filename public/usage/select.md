# select (component)

A custom-rendered dropdown for choosing one option from a short list — the same look on every platform, unlike the OS-native picker.

### When to use
- You need a dropdown of up to roughly 20 options with a consistent, custom-rendered popup (grouped labels, separators) rather than the OS-native picker.

### Reach for instead
- **native-select** — when you'd rather hand the picker UI to the OS (mobile scroll wheel, zero extra JS) and don't need custom-rendered items.
- **combobox** — when the list is long enough that users need to filter it by typing.

### Rules
- **Do:** Always pass a placeholder to `<SelectValue placeholder="…" />`. **Don't:** Leave SelectValue with no placeholder — an empty trigger reads as broken, not merely unselected.
- **Do:** Reach for Select when the option list is short (roughly ≤20) and doesn't need search. **Don't:** Force a long option list into Select with no search — users have to scroll through everything blind.

### Accessibility
- SelectTrigger renders role="combobox"; opening it expands a listbox — arrow keys navigate items, Enter selects, Escape closes.
- SelectValue's placeholder prop supplies the accessible "nothing selected yet" text — don't leave it empty.
- aria-invalid="true" on the trigger applies the destructive border/ring, the same token pattern as Input.

### Design tokens
`--input` · `--ring` · `--popover` · `--accent` · `--destructive` · `--radius-lg`

