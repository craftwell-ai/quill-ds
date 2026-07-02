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

## Code Connect mapping (ready to publish on plan upgrade)

Code Connect requires a **Dev/Full seat on a Figma Org/Enterprise plan** (blocks both the MCP
`add_code_connect_map` and the `figma connect publish` CLI). Until then, this is the intended
1:1 map — Figma component set (node id) ↔ code component — ready to wire up:

| Figma node | Code component | Source |
|---|---|---|
| `65:13` | Badge | `src/components/ui/badge.tsx` |
| `76:56` | Button | `src/components/ui/button.tsx` |
| `77:5` | Input | `src/components/ui/input.tsx` |
| `84:4` | Textarea | `src/components/ui/textarea.tsx` |
| `78:9` | Checkbox | `src/components/ui/checkbox.tsx` |
| `80:8` | RadioGroupItem | `src/components/ui/radio-group.tsx` |
| `79:9` | Switch | `src/components/ui/switch.tsx` |
| `84:23` | Toggle | `src/components/ui/toggle.tsx` |
| `82:9` | Label | `src/components/ui/label.tsx` |
| `82:13` | Kbd | `src/components/ui/kbd.tsx` |
| `84:8` | Avatar | `src/components/ui/avatar.tsx` |
| `84:12` | Spinner | `src/components/ui/spinner.tsx` |
| `82:3` | Separator | `src/components/ui/separator.tsx` |
| `82:6` | Skeleton | `src/components/ui/skeleton.tsx` |
| `81:8` | Progress | `src/components/ui/progress.tsx` |

On upgrade: `npm i -D @figma/code-connect`, add `*.figma.tsx` per component (prop mappings from
the variant properties above), `npx figma connect publish`.

## Remaining for Wave A

- **Code Connect** — blocked by plan (mapping above is ready).
- **Visual QA pass:** review each page in Figma; refine any spacing/rounding nuances.
- Optional: add `Disabled` boolean + hover/focus states later (variant structure supports it).

## Wave B (composites) — 8 done

| Component | Page | Notes |
|---|---|---|
| Card | ❖ Card | container (header/content/footer); footer uses real **Button instances** |
| Alert | ❖ Alert | Variant: default/destructive; icon + title + description |
| Tabs | ❖ Tabs | segmented TabsList; active tab uses the `Elevation/xs` style |
| Tooltip | ❖ Tooltip | dark bubble + arrow |
| Select | ❖ Select | trigger + chevron (like Input) |
| Breadcrumb | ❖ Breadcrumb | links + chevron separators + current page |
| Pagination | ❖ Pagination | prev/next + numbered cells, active bordered |
| Accordion | ❖ Accordion | 3 items, first expanded + description |

Remaining Wave B: Field, Input/Button groups (thin composition wrappers).

**Build lesson:** after `createComponentFromNode`, a hug-layout component may come back FIXED-size —
set `primaryAxisSizingMode='AUTO'` and text nodes `textAutoResize='HEIGHT'`. Don't rotate a chevron
that's an auto-layout child (use the up/down glyph instead).

## Patterns (code-first, Storybook — done separately)

28 pattern stories under `src/stories/patterns/` (Auth/Forms/Data/State/Marketing/Shells/Nav) + a
`Patterns / Overview` page. These compose the coded components; a subset can be mirrored into Figma
`❖` Pattern pages once the composite components they use exist in Figma (Card/Alert now do).

## Next

- Finish Wave B, then Wave C (overlays/compounds). Mirror key patterns into Figma.
