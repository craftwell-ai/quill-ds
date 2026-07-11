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
- `createFrame`/`createAutoLayout` frames ship with a **default white fill** — clear
  `fills = []` on every wrapper/group frame (and on `createNodeFromSvg` import frames), or
  the card interior renders white over the cream surface. Only bind fills you actually want.

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

### Variable code syntax (done — the token-level 1:1, NOT plan-gated)

All 109 Figma variables carry a Web **code syntax** = their CSS token, so Dev Mode shows the real
code a dev types (Figma names and CSS names are decoupled by design):

| Figma variable | Dev Mode shows |
|---|---|
| `color/pigment/terracotta/deep` | `var(--terracotta-deep)` |
| `shadcn/primary` | `var(--primary)` |
| `spacing/2_5` | `var(--space-2.5)` |
| `corner-radius/lg` | `var(--radius-lg)` |
| `type/base` | `var(--text-base)` |
| `status/link` | `var(--link)` |

This gives the token layer full design↔code parity without Code Connect. Code Connect remains an
optional **component-level** enhancement (real `<Button>` code + props in Dev Mode), gated by plan.
Re-apply after regenerating variables via the mapping in the foundations sync.

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

## Patterns

- **Code (source of truth):** 28 pattern stories under `src/stories/patterns/`
  (Auth/Forms/Data/State/Marketing/Shells/Nav) + a `Patterns / Overview` page.
- **Figma:** patterns mirror onto `❖ <Name>` pages by composing real component **instances**
  (with text overrides). Recipe: instance the components, override text/props, lay out with
  auto-layout, bind container tokens (card fill→`shadcn/card`, stroke→`shadcn/border`,
  radius→`corner-radius/xl`), and clear `fills = []` on every wrapper/glyph frame.
  - Quirk: a **destructive Badge instance** drops its 10%-opacity fill (renders solid) — re-apply
    `fills.map(p => ({...p, opacity: 0.1}))` on the instance, or use another variant.

### Pattern pages built (all batches complete, 2026-07-10/11)

| Batch | Page | Node | Notes |
|---|---|---|---|
| — | ❖ Login | 103:3 | Input + Button instances |
| — | ❖ Stat cards | 105:3 | Badge instances |
| 1 | ❖ Forgot password | 182:2 | |
| 1 | ❖ OTP verification | 183:2 | hand-built token-bound slots |
| 1 | ❖ Signup — social first | 184:2 | Separator divider; real GitHub/Google marks |
| 1 | ❖ Newsletter | 185:2 | mail glyph as SVG, fill→muted-foreground |
| 2 | ❖ Contact form | 200:2 | Input/Textarea/Select instances |
| 2 | ❖ File upload | 201:2 | dashed dropzone + Progress instance |
| 2 | ❖ Checkout | 203:2 | two-column form + order summary |
| 2 | ❖ Stats band | 204:2 | |
| 2 | ❖ Announcement banner | 205:2 | |
| 3 | ❖ Team section | 207:2 | Avatar instances |
| 3 | ❖ FAQ | 207:76 | Accordion instance |
| 3 | ❖ Activity feed | 208:2 | timeline glyphs as SVG |
| 3 | ❖ Invoice | 209:2 | table rows, tabular figures |
| 3 | ❖ Calendar page | 210:2 | month grid + session list |
| 3 | ❖ Calendar range | 211:2 | two-month range selection |
| 3 | ❖ Analytics charts | 213:2 | area + bar charts via `createNodeFromSvg`, fills bound to pigment vars, 0.25 node opacity on areas |
| 4 | ❖ Sidebar navigation | 214:2 | sidebar tokens (`shadcn/sidebar*`), per-side strokes |
| 4 | ❖ Mail inbox | 215:2 | list + reading pane; Avatar/Badge/Input instances |
| 4 | ❖ Login — split panel | 215:154 | primary brand panel + form; Button instance |
| 4 | ❖ Login — minimal | 215:187 | arrow glyph in composed primary button |

## Next

- Finish Wave B, then Wave C (overlays/compounds).
- Visual QA sweep of pattern pages in light/dark modes.
