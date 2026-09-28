# native-select (component)

The browser's own `<select>`, restyled to match the theme — the OS-native picker, not a custom-rendered popover.

### When to use
- You need a short, simple option list and want the OS-native picker (mobile scroll wheel, keyboard type-ahead, zero extra JS) instead of a custom-rendered popover.

### Reach for instead
- **select** — when you want the popup fully custom-rendered — consistent look across platforms, grouped labels, separators — instead of the OS-native picker.
- **combobox** — when the list is long or users need to filter by typing — native `<select>` has no search.

### Rules
- **Do:** Add a disabled first option (value="") as the placeholder prompt, e.g. `<NativeSelectOption value="" disabled>Select category…</NativeSelectOption>` — native `<select>` has no placeholder attribute. **Don't:** Default to a real option's value with no placeholder option — the first real option then looks pre-chosen even though the user never picked it.
- **Do:** Build every option list with NativeSelectOption and NativeSelectOptGroup. **Don't:** Render raw `<option>`/`<optgroup>` tags — they skip the bg-[Canvas]/text-[CanvasText] theming those subcomponents apply for readable native popovers across themes.

### Accessibility
- Renders a real native `<select>`; keyboard, screen reader, and mobile scroll-wheel behavior all come from the browser for free.
- The chevron icon is aria-hidden; the accessible name comes from a `<label htmlFor>` or aria-label on the `<select>` itself, not from the icon.
- size="sm" only changes height (h-7 vs h-8); tab order and semantics stay identical.

### Design tokens
`--input` · `--ring` · `--destructive` · `--radius-lg` · `--radius-md`

