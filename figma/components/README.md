# Quill Figma components — Wave A (core atoms)

File: `Dcf8lEB7Ash71iNl7WN4Jq` (Quill Design System). Each component lives on its own
`❖ <Name>` page and is **fully token-bound** — every fill/stroke/radius/spacing/height and
all type binds to a Figma variable or text style (no literal values). Built via `use_figma`.

## Built (Wave A — 15/15)

| Component | Page | Structure | Key bindings |
|---|---|---|---|
| Badge | ❖ Badge | Variant: default/secondary/destructive/outline/ghost/link | fills→shadcn/*, radius→corner-radius/4xl, text→Label/Small |
| Button | ❖ Button | Variant(6) × Size(default/sm/lg) = 18 | height→spacing/8·7·9, radius→corner-radius/lg·md, text→Label/Default·Small |
| Input | ❖ Input | single field | stroke→shadcn/input, radius→corner-radius/lg, text→Body/S |
| Textarea | ❖ Textarea | single (tall field) | stroke→shadcn/input, radius→corner-radius/lg |
| Checkbox | ❖ Checkbox | Checked: off/on | size→spacing/4, radius→corner-radius/sm, checked bg→primary + check glyph |
| Radio | ❖ Radio | Checked: off/on | size→spacing/4, radius→corner-radius/4xl, dot→primary |
| Switch | ❖ Switch | Checked: off/on | track→shadcn/input·primary, thumb→background·primary-foreground |
| Toggle | ❖ Toggle | Pressed: off/on | radius→corner-radius/md, pressed bg→muted, format_bold glyph |
| Label | ❖ Label | single text | Label/Default + foreground |
| Kbd | ❖ Kbd | single keycap | bg→muted, border, radius→corner-radius/sm, Label/Small |
| Avatar | ❖ Avatar | single circle | size→spacing/10, radius→corner-radius/4xl, bg→muted |
| Spinner | ❖ Spinner | single | progress_activity glyph, foreground |
| Separator | ❖ Separator | single line | fill→shadcn/border |
| Skeleton | ❖ Skeleton | single | bg→muted, radius→corner-radius/md |
| Progress | ❖ Progress | single (track + ~60% fill) | track→muted, fill→primary, radius→corner-radius/4xl |

## Build pattern (reliable)

- Build **each variant fresh** (`createComponentFromNode` per variant). NEVER clone + re-bind —
  re-binding fills on cloned/combined components corrupts the render to the literal fallback.
- `combineAsVariants(comps, page)` requires the components to already be **on the target page**.
- Variant names encode properties: `Variant=x`, `Size=y`, `Checked=on`, `Pressed=off`.
- Fill opacity (e.g. destructive `/10`) must be applied via `fills.map(p => ({...p, opacity}))`.
- Figma variable names can't contain `.` — fractional spacing keys are sanitized (`spacing/2_5`).

## Remaining for Wave A

- **Code Connect:** map each `❖` component ↔ its `src/components/ui/*.tsx` (Figma Dev Mode → code).
- **Visual QA pass:** review each page in Figma; refine any spacing/rounding nuances.
- Optional: add `Disabled` boolean + hover/focus states later (variant structure supports it).

## Next waves

- Wave B (composites: Card, Alert, Tabs, Tooltip, Select, Field, groups, Breadcrumb, Pagination, Accordion).
- Wave C (complex overlays/compounds), then Patterns.
