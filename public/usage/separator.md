# separator (component)

A thin decorative divider line between stacked or inline content — horizontal by default, vertical for toolbars and inline groups.

### When to use
- You need a plain visual divider between grouped content — stacked sections, or inline items in a toolbar — with no label or content of its own.

### Rules
- **Do:** Give a vertical Separator an explicit height (e.g. `h-4`), as every vertical story here does. **Don't:** Add `orientation="vertical"` with no height class and expect it to reach the row's full height automatically — inside an `items-center` row it collapses to zero height and disappears.
- **Do:** Use the default `orientation="horizontal"` between stacked content, and `orientation="vertical"` between inline items in a row. **Don't:** Use a horizontal Separator inside an inline row expecting it to divide items side-by-side — it renders as a full-width line, not a thin vertical rule.

### Accessibility
- Separator renders `role="separator"` via Base UI and is purely decorative — it carries no accessible name and should never be the only thing conveying a grouping; pair it with real heading or section structure for that.

### Design tokens
`--border`

