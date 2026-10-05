# Quill Figma components — Wave A (core atoms)

File: `Dcf8lEB7Ash71iNl7WN4Jq` (Quill Design System). Each component lives on its own
`❖ <Name>` page and is **fully token-bound** — every fill/stroke/radius/spacing/height and
all type binds to a Figma variable or text style (no literal values). Built via `use_figma`.

## Built (Wave A — 15/15)

| Component | Page | Structure | Key bindings |
|---|---|---|---|
| Badge | ❖ Badge | Variant: default/secondary/destructive/outline/ghost/link | fills→semantic/*, radius→radius/4xl, text→Label/Small |
| Button | ❖ Button | Variant(6) × Size(default/sm/lg) = 18 | height→space/8·7·9, radius→radius/lg·md, text→Label/Default·Small |
| Input | ❖ Input | single field | stroke→semantic/input, radius→radius/lg, text→Body/S |
| Textarea | ❖ Textarea | single (tall field) | stroke→semantic/input, radius→radius/lg |
| Checkbox | ❖ Checkbox | Checked: off/on | size→space/4, radius→radius/sm, checked bg→primary + check glyph |
| Radio | ❖ Radio | Checked: off/on | size→space/4, radius→radius/4xl, dot→primary |
| Switch | ❖ Switch | Checked: off/on | track→semantic/input·primary, thumb→background·primary-foreground |
| Toggle | ❖ Toggle | Pressed: off/on | radius→radius/md, pressed bg→muted, format_bold glyph |
| Label | ❖ Label | single text | Label/Default + foreground |
| Kbd | ❖ Kbd | single keycap | bg→muted, border, radius→radius/sm, Label/Small |
| Avatar | ❖ Avatar | single circle | size→space/10, radius→radius/4xl, bg→muted |
| Spinner | ❖ Spinner | single | progress_activity glyph, foreground |
| Separator | ❖ Separator | single line | fill→semantic/border |
| Skeleton | ❖ Skeleton | single | bg→muted, radius→radius/md |
| Progress | ❖ Progress | single (track + ~60% fill) | track→muted, fill→primary, radius→radius/4xl |

## Build pattern (reliable)

- Build **each variant fresh** (`createComponentFromNode` per variant). NEVER clone + re-bind —
  re-binding fills on cloned/combined components corrupts the render to the literal fallback.
- `combineAsVariants(comps, page)` requires the components to already be **on the target page**.
- Variant names encode properties: `Variant=x`, `Size=y`, `Checked=on`, `Pressed=off`.
- **Opacity is a second assignment.** Binding a colour variable to a paint (`setBoundVariableForPaint`)
  resets the paint's opacity to the variable's own alpha and discards any opacity on the paint you
  passed in — one assignment `fills = [boundPaintAt0.2]` lands at 100 % (and `semantic/border`
  lands at 12 %, because its alias carries that alpha). Assign the bound paint first, then
  `node.fills = node.fills.map(p => ({ ...p, opacity }))`. The 2026-09-18 ToneBadge tints and Kanban
  columns shipped at 100 % for exactly this reason and were fixed with the second assignment.
- Figma variable names can't contain `.` — fractional spacing keys are sanitized (`space/2_5`).
- `createFrame`/`createAutoLayout` frames ship with a **default white fill** — clear
  `fills = []` on every wrapper/group frame (and on `createNodeFromSvg` import frames), or
  the card interior renders white over the cream surface. Only bind fills you actually want.

## Code Connect mapping (reference only — not on the roadmap)

Code Connect requires a **Dev/Full seat on a Figma Org/Enterprise plan** (blocks both the MCP
`add_code_connect_map` and the `figma connect publish` CLI). This workspace is on a lower plan
with no org-plan upgrade planned, so Code Connect stays off the roadmap. This 1:1 map — Figma
component set (node id) ↔ code component — is kept for reference in case that ever changes:
(Button and Toggle were rebuilt after the 2026-08-10 audit; ids refreshed 2026-09-15 from the file. The live list is `candidates` / `components` in `figma/sync-state.json`.)

| Figma node | Code component | Source |
|---|---|---|
| `65:13` | Badge | `src/components/ui/badge.tsx` |
| `359:267` | Button | `src/components/ui/button.tsx` |
| `77:5` | Input | `src/components/ui/input.tsx` |
| `84:4` | Textarea | `src/components/ui/textarea.tsx` |
| `78:9` | Checkbox | `src/components/ui/checkbox.tsx` |
| `80:8` | RadioGroupItem | `src/components/ui/radio-group.tsx` |
| `79:9` | Switch | `src/components/ui/switch.tsx` |
| `356:183` | Toggle | `src/components/ui/toggle.tsx` |
| `82:9` | Label | `src/components/ui/label.tsx` |
| `82:13` | Kbd | `src/components/ui/kbd.tsx` |
| `84:8` | Avatar | `src/components/ui/avatar.tsx` |
| `84:12` | Spinner | `src/components/ui/spinner.tsx` |
| `82:3` | Separator | `src/components/ui/separator.tsx` |
| `82:6` | Skeleton | `src/components/ui/skeleton.tsx` |
| `81:8` | Progress | `src/components/ui/progress.tsx` |

If this ever becomes relevant: `npm i -D @figma/code-connect`, add `*.figma.tsx` per component
(prop mappings from the variant properties above), `npx figma connect publish`.

### Variable code syntax (done — the token-level 1:1, NOT plan-gated)

All 109 Figma variables carry a Web **code syntax** = their CSS token, so Dev Mode shows the real
code a dev types (Figma names and CSS names are decoupled by design):

| Figma variable | Dev Mode shows |
|---|---|
| `color/terracotta-deep` | `var(--terracotta-deep)` |
| `semantic/primary` | `var(--primary)` |
| `space/2_5` | `var(--space-2.5)` |
| `radius/lg` | `var(--radius-lg)` |
| `text/base` | `var(--text-base)` |
| `semantic/link` | `var(--link)` |

This gives the token layer full design↔code parity without Code Connect — which is the intended
end state, since Code Connect itself isn't planned (see above). Re-apply after regenerating
variables via the mapping in the foundations sync.

## Remaining for Wave A

- **Visual QA pass:** review each page in Figma; refine any spacing/rounding nuances.
- Optional: add `Disabled` boolean + hover/focus states later (variant structure supports it).

## Wave B (composites) — 11/11 done

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
| Field | ❖ Field | Orientation(Vertical/Horizontal) × State(Default/Invalid), sparse 3-variant set; Label/Input/Switch **instances**; gaps→space/2·0_5; invalid overrides label/stroke/error→destructive |
| ButtonGroup | ❖ Button group | Orientation: horizontal/vertical; 3 hand-built fused outline segments (bg→background, stroke→border, h→space/8), end-only radii→radius/lg, inner borders collapsed via per-side strokeWeight=0 |
| InputGroup | ❖ Input group | Layout: inline/block; shell stroke→input, radius→lg; inline = icon/search + placeholder + Kbd "⌘K" instances; block = prompt box with block-end addon + primary send button (icon/arrow_forward) |

Wave B note: Field's `responsive` orientation is container-query behavior — not modelable
statically, deferred. ButtonGroupText / ButtonGroupSeparator and the InputGroup
inline-end-button arrangement are compositional micro-variants, deferred to usage in patterns.

**Build lesson:** after `createComponentFromNode`, a hug-layout component may come back FIXED-size —
set `primaryAxisSizingMode='AUTO'` and text nodes `textAutoResize='HEIGHT'`. Don't rotate a chevron
that's an auto-layout child (use the up/down glyph instead).

## Patterns

- **Code (source of truth):** the blocks in `registry/blocks/` (51 as of 2026-09-18),
  each with a story under `src/stories/patterns/` + a `Patterns / Overview` page.
- **The record of which blocks have a page is `patterns` in `../sync-state.json`** —
  one entry per block: `mirrored` (❖ page + pattern frame ids; the daily parity run
  checks both are still there), `missing` (not built yet) or `declined` (reason
  written down). `scripts/figma-pattern-coverage.test.mjs` fails when a block has
  no entry. The table below is the build log, not the record.
- **Content parity (since 2026-09-18):** `../pattern-baseline.json` holds what each mirrored
  frame shows (visible texts in order, icon components, top-level instances, bound variables);
  `scripts/figma-pattern-expect.mjs` renders every block with react-dom/server and reads back
  the strings and icon names; `scripts/figma-pattern-parity.test.mjs` requires a stamped page
  to match its block exactly on both. The daily run diffs every frame against the baseline and
  names the page when Figma moves. Icons on pattern pages are **instances of `icon/*`**, never
  composed vectors, so the check can see them.
- **Figma:** patterns mirror onto `❖ <Name>` pages by composing real component **instances**
  (with text overrides). Recipe: instance the components, override text/props, lay out with
  auto-layout, bind container tokens (card fill→`semantic/card`, stroke→`semantic/border`,
  radius→`radius/xl`), and clear `fills = []` on every wrapper/glyph frame.
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
| 3 | ❖ Analytics charts | 213:2 | area + bar charts via `createNodeFromSvg`, 0.25 node opacity on areas; fills/strokes re-bound to `color/chart/series/*` 2026-07-21 (two-series chart = series 1+2 in fixed order, legend follows; bar chart = series 3) |
| 4 | ❖ Sidebar navigation | 214:2 | sidebar tokens (`semantic/sidebar*`), per-side strokes |
| 4 | ❖ Mail inbox | 215:2 | list + reading pane; Avatar/Badge/Input instances |
| 4 | ❖ Login — split panel | 215:154 | primary brand panel + form; Button instance |
| 4 | ❖ Login — minimal | 215:187 | arrow glyph in composed primary button |
| 5 | ❖ Theme selector | 231:2 | dropdown trigger + open menu (Theme + Accent sections, menu node 233:2); four theme chips pinned via `setExplicitVariableModeForCollection` |

### Pattern pages built — session A, marketing and shells (2026-09-18)

Built from the block sources with the same recipe (real Button / Badge /
Separator / Breadcrumb instances, container tokens bound, wrapper fills
cleared). Text with no matching text style (sans headings, prices) is Raleway
with `fontSize` bound to the `text/*` token. Icons inside Button instances
are omitted on purpose: the Button twin has no icon slot, and a label-only
instance keeps its link to the twin, which a hand-composed button would lose.

| Block | Page | Page id | Frame id | Notes |
|---|---|---|---|---|
| hero | ❖ Hero | 568:2 | 696:25 | Badge secondary + Display/M + two lg Buttons |
| navbar | ❖ Navbar | 571:2 | 696:39 | bottom stroke only (per-side weight → border-width/1) |
| footer | ❖ Footer | 571:19 | 696:22 | Separator instance FILL; wordmark Fraunces + text/xl |
| feature-section | ❖ Feature section | 572:2 | 696:20 | Eyebrow → semantic/primary; icon tiles palette / dashboard / check_circle |
| testimonial | ❖ Testimonial | 572:27 | 696:65 | Heading/M pull-quote, initials disc |
| pricing | ❖ Pricing | 574:2 | 696:51 | Pro card stroke → semantic/ring @ border-width/2; check icons → primary |
| page-header | ❖ Page header | 574:85 | 696:50 | Breadcrumb instance with crumb text overrides |
| error-404 | ❖ Error 404 | 574:104 | 696:18 | 880×500 fixed; Display/L "404" in muted-foreground |
| empty-state | ❖ Empty state | 574:115 | 696:17 | dashed stroke (`dashPattern [4,4]`), round icon tile |
| cookie-consent | ❖ Cookie consent | 574:125 | 696:10 | Elevation/base; three sm Buttons, wrap enabled |


### Pattern pages built — session B, app pages (2026-09-18)

Same recipe. Icon-only buttons (`size="icon"`) are composed frames — width/height →
space/8, radius → radius/lg, ghost = no fill, default = semantic/primary —
because the Button twin's icon variants carry a fixed glyph that an instance cannot
swap. Text overrides inside Input / Textarea / Label / Tabs / Breadcrumb instances
set `characters` on the twin's text node (fonts loaded from the node's own segments).

| Block | Page | Page id | Frame id | Notes |
|---|---|---|---|---|
| dashboard | ❖ Dashboard | 578:2 | 696:11 | 880×600; sidebar fill → semantic/sidebar, active nav → semantic/accent; Input instance; KPI cards with Badge deltas |
| data-table | ❖ Data table | 579:2 | 696:12 | hand-built table (header h 40, per-row bottom stroke) like the Table twin; **ToneBadge instances** moss / gold |
| list-detail | ❖ List detail | 580:2 | 696:28 | 880×520; active thread → semantic/accent; Separator instances; composed ghost icon buttons |
| settings | ❖ Settings | 580:45 | 696:53 | Label + Input / Textarea instances, Separator, Switch `Checked=on` |
| tabs-page | ❖ Tabs page | 580:80 | 696:63 | Tabs instance (Variant=default) with label overrides, tab frames set to hug; only the active Account panel is drawn, as in the story |
| profile-card | ❖ Profile card | 580:104 | 696:52 | 64px initials disc, Badge secondary, two FILL Buttons |
| notifications | ❖ Notifications | 581:2 | 699:789 | link sm Button; unread dot 8px → semantic/primary |
| search-results | ❖ Search results | 581:40 | 699:787 | Input instance with value override; outline Badges |
| kanban | ❖ Kanban | 581:85 | 696:27 | columns fill → semantic/muted @ 0.5; card tags outline Badge |
| chat | ❖ Chat | 581:159 | 696:7 | 400×480; bubbles radius → radius/2xl, primary / muted; composed primary send button |

### Pattern pages built — session C, flows (2026-09-18)

| Block | Page | Page id | Frame id | Notes |
|---|---|---|---|---|
| signup | ❖ Signup | 584:2 | 696:54 | three Label + Input fields; "Sign in" link → semantic/primary, underlined |
| login-oauth | ❖ Login — OAuth | 585:2 | 696:36 | provider buttons are composed (paints copied from the Button outline variant) so they can carry the brand marks inlined from the source — Google keeps its four colours, GitHub / Apple bind to semantic/foreground; two Separator instances flank "or" |
| wizard | ❖ Wizard | 585:38 | 696:72 | stepper: done → primary disc + check, current → primary @ 0.1 with primary stroke, todo → muted; connectors → semantic/border |
| onboarding | ❖ Onboarding | 585:75 | 696:41 | progress track → semantic/muted, fill → semantic/primary at 50 %; done rows strikethrough; link sm Buttons |

### Pattern pages built — session D, the July pages rebuilt (2026-09-18)

The 22 pages built in July carried pre-2026-09-12 copy and the classic shadcn
card recipe. Each was rebuilt from its block on the same page (page ids kept,
new frame ids), stamped, and its content baseline re-read, so the stale list in
`sync-state.json` is empty.

| Block | Page | Page id | Frame id | Notes |
|---|---|---|---|---|
| contact-form | ❖ Contact form | 200:2 | 696:9 | Card anatomy; two-column name fields; Select and Textarea instances |
| forgot-password | ❖ Forgot password | 182:2 | 696:23 | vertical footer band; ghost Button with a start `arrow_back` |
| login | ❖ Login | 103:2 | 696:29 | Checkbox instance row; link Button in the footer |
| file-upload | ❖ File upload | 201:2 | 696:21 | dashed dropzone; Progress instance; ghost icon-sm close Buttons |
| announcement-banner | ❖ Announcement banner | 205:2 | 696:4 | card banner and primary banner; link Button with the default end arrow |
| newsletter | ❖ Newsletter | 185:2 | 696:40 | card-styled section; the round tile is a hard 9999 radius (no `rounded-full` token) |
| stat-cards | ❖ Stat cards | 105:2 | 699:786 | Fraunces `text/2xl` values; Badge default / secondary / destructive |
| signup-social | ❖ Signup — social first | 184:2 | 696:55 | page-local `brand/github` (633:9) and `brand/google` (633:15) components fill the outline Buttons' icon slot |
| checkout | ❖ Checkout | 203:2 | 696:8 | method tiles (the checked one → ring stroke + muted fill); `size="sm"` summary card |
| otp-verification | ❖ OTP verification | 183:2 | 696:42 | InputOTP instance with its sample digits hidden; the description is the three text runs the code renders |
| login-minimal | ❖ Login — minimal | 215:187 | 696:35 | no card; primary Button with the default end arrow |
| login-split-panel | ❖ Login — split panel | 215:154 | 696:37 | 960 × 560; primary brand panel; link xs "Forgot?" |
| activity-feed | ❖ Activity feed | 208:2 | 696:2 | three text runs per line; absolute 1 px rule behind 32 px Avatars with a 4 px card ring |
| mail-shell | ❖ Mail inbox | 215:2 | 696:38 | 960 × 560 two panes; preview lines truncate to one line |
| faq | ❖ FAQ | 207:76 | 696:19 | accordion composed (the twin has three fixed items); `keyboard_arrow_up` on the open item |
| team-section | ❖ Team section | 207:2 | 696:64 | four `size="sm"` cards; 40 px Avatars; ghost icon-sm mail Buttons |
| stats-band | ❖ Stats band | 204:2 | 696:56 | values bind `semantic/text-accent-color`; eyebrows bind `color/ink-muted` |
| sidebar-nav | ❖ Sidebar navigation | 214:2 | 699:788 | 256 px sidebar on the `shadcn/sidebar-*` tokens; composed breadcrumb; `dock_to_left` trigger |
| calendar-page | ❖ Calendar page | 210:2 | 696:5 | composed react-day-picker month: 28 px cells, outside days, July 14 selected |
| calendar-range | ❖ Calendar range | 211:2 | 696:6 | two months; July 20–24 with start / middle / end states |
| analytics-charts | ❖ Analytics charts | 213:2 | 696:3 | area paths and bars drawn as vectors from the block data; ticks and legend are text (client-drawn in code, so the test only requires the block's strings) |
| theme-selector | ❖ Theme selector | 231:2 | 696:71 | the tracked frame is the closed trigger — all the server render shows; the open menu sits beside it as an untracked reference (648:84) |

Thirteen Card-primitive frames on the September pages (pricing × 3, dashboard
× 3, settings, tabs page, profile card, notifications, signup, wizard,
onboarding) were on the old recipe too and were patched in place to the shipped
anatomy: `gap` and vertical padding `space/4`, side padding `space/4` on
Header / Content / Footer, ring `semantic/foreground` at 0.1 instead of the border
token, Header gap `space/1`, Fraunces titles at weight 500, and a Footer band
(`semantic/muted` at 0.5, top rule, padding `space/4`, root bottom padding 0).
The border token itself carries 12 % alpha, so a frame whose stroke reads
`semantic/border@0.12` is a plain `border-border` and is right as drawn.

Rules learned in this pass:

- **A node cannot carry a custom property.** `node.__spacing = …` throws
  `no such property` and rolls the whole script back; keep script state in a
  `Map` keyed by `node.id`.
- **Fraunces has no Medium instance in the file.** `fontName = { family:
  'Fraunces', style: 'Regular', variationSettings: { wght: 500 } }` sets the
  variable-font weight, and that is what `font-medium` headings (CardTitle) use.
- **`getNodeByIdAsync` reaches every page**, so a patch pass across pages runs
  in one script with no page switch.
- **Third-party marks are page-local components.** GitHub and Google marks sit
  beside the frame as `brand/*` components and are swapped into the Button's
  icon slot; they are not icons, and the icon sync ignores them.
- **Compose where the twin cannot flex.** Accordion (three fixed items),
  Breadcrumb (fixed items), Calendar (declined) and charts (vectors from the
  block data) are built by hand in the shipped anatomy; instances are used for
  everything else.

**Every block now has a declared Figma status:** 47 of 51 mirrored, 4 declined
(badge-on-card, alerts, command-palette, order-summary — reasons in
`sync-state.json`), 0 missing. The file holds 93 pages, alphabetical after
Foundations and Icons.

### ToneBadge twin (2026-09-18)

`❖ Tone badge` — component set **577:75**, code twin `registry/lib/tone-badge.tsx`.
Variants Tone(moss|gold|terracotta|indigo|neutral|muted) × Size(md|sm) × Solid(off|on) = 24,
each built fresh. Anatomy copied from Badge: height → space/5 (sm space/4),
padding → space/2 (sm space/1_5), gap → space/1, radius → radius/4xl;
label Raleway Medium, fontSize → text/2xs, 10 % tracking, uppercase. Tint fills are
the pigment base at the code's opacity (moss 0.2, gold 0.25, terracotta 0.16, indigo
0.2) with deep text (gold uses `color/gold-text`); neutral / muted use
`color/paper-deep` with `color/ink-soft` / `color/ink-muted`; Solid=on fills the deep
pigment with `color/paper` text. Listed in `sync-state.json` → `candidates` for
the next adopt run. The ❖ Invoice "Paid" chip (built before ToneBadge existed) was
swapped in place to a `Tone=moss` instance (node 581:188).

### AI kit twins (2026-10-02)

Code twins in `registry/lib` (the `src/components/ui` files are re-export shims, declined in
`sync-state.json` the way `tone-badge` is). All four are in `components` (adopted 2026-10-02 by
`figma-drift.mjs --adopt`). Edge styles and the `ai-edge/*` variables: `../README.md`, "AI edge".

| Twin | Page (id) | Node | Structure | Key bindings |
|---|---|---|---|---|
| AiMark | ❖ AI mark (1068:2) | set **1068:10** | Stars=two (1068:6, 18px) · Stars=one (1068:9, 16px) | each star its own gradient, corner to corner of the star, stops 0.28 / 0.5 / 0.72 bound to color/ai-from · via · to; vectors scale with the instance |
| AiBadge | ❖ AI badge (1068:11) | component **1068:12** | AiMark Stars=one at 13px + Label (TEXT property `Label`) | outline Badge anatomy: fill→semantic/background, stroke→semantic/input (the control line, 2026-10-04: semantic/border vanished on the dark themes) @ border-width/1, h→space/5, padding→space/2, gap→space/1, radius→radius/4xl; Label/Small in color/ink-soft |
| AiButton | ❖ AI button (1069:2) | set **1069:143** | Variant(outline / ghost / default / secondary) × Size(xs / sm / default / lg / icon) = 20; TEXT property `Label` | each variant is a ❖ Button variant detached in place (its bindings kept), with AiMark Stars=two at 18px in the start slot |
| PromptComposer | ❖ Prompt composer (1072:2) | set **1072:79** | Variant=default × Size(lg / sm) × Status(idle / working / error) + Variant=notebook (lg, idle) = 7; BOOLEAN `Show tabs` (on, = `showModes`), `Add button` (off, = `leading` +), `Mic` (off, idle variants only) | Field wrapper (gap −1.5, first child on top) holds the Modes tab row (padding-left 24 = box corner 16 + tab curve 8; first child on top, so the selected tab draws over its neighbour) over the box; the selected tab has four `Fillet *` vectors at its base corners (fills bound to semantic/background hide the straight edge and side; 1.5px edge arcs, left bound to ai-edge/rest-from, right a gradient ai-edge/rest-to → the box colour) so it curves into the box edge; Ask tab AI/Edge (rest) + AiMark 18px, Agent tab icon/person 18px (the unselected tab: fill semantic/muted, 1px INSIDE hairline stroke semantic/border on top, left and right only (bottom 0), label semantic/muted-foreground; 33px tall (bottom padding 7), 1.5px shorter than the selected tab, so it ends at the box's top edge and the box edge runs unbroken in front of it; verified 2026-10-02 after it had overlapped the edge by 1px), tab top corners→radius/lg (8px); box fill→semantic/background, radius→radius/xl (16px; notebook right corners radius/xl), edge = AI/Edge (rest) or (working) as a 1.5px INSIDE stroke; Send / Stop are ❖ Button `Size=icon` instances (Send `State=Disabled` with no text), radius→radius/4xl; error line = icon/error 16px (colour bound to semantic/destructive, 2px top pad, gap 6, top-aligned) + Text/sm in semantic/destructive; the Mic is a detached ghost-button frame (32px, radius full) holding an icon/mic instance at 20px, because a nested Button icon cannot be resized, still toggled by `Mic` |

- **AiButton is not a live Button instance.** Code sizes the mark 18px (`size-[18px]`; Button
  would shrink an svg to 16). The Button twin's icon slot forbids a size override on a nested
  instance, so each variant was built from a Button instance and detached in place, keeping
  every binding (fills, strokes, radius, padding, height). A change to the Button twin does
  not reach AiButton — push both.
- **Not drawn:** the composer's attachments, tool chips, `/` and `@` menu, drop hint and
  `disabled` status (stories, not variants). The mode tabs moved into the set on 2026-10-02
  (v0.16.1); `Show tabs` toggles the Modes row on every variant. The + and mic are ❖ Button
  ghost `Size=icon` instances (icon/add with a 1px semantic/border ring, icon/mic), both
  rounded-full→radius/4xl; with `Mic` on, hide Send on the instance — code shows the mic
  only while the box is empty. The working edge is the static full sweep; the 2.4s animation is CSS-only.
- **Notebook:** Fraunces Italic placeholder on 32px lines; the ruling is two 1px
  `color/line-soft` rules at 13 and 45px (code's repeating background tiles upward from its
  14px offset too); the 4px margin rule binds ai-from / via / to top to bottom.
- **Icons:** `icon/stop` and `icon/mic` were missing from the Icons page (code has 93) and were
  added by the icon sync.

| Block | Page | Page id | Frame id | Notes |
|---|---|---|---|---|
| ai-home | ❖ AI home | 1073:2 | 1108:41 | 1024×512; `ai-glow` = two radial fills (centre stop bound to color/ai-from / ai-to, paint opacity 0.18, transparent end at 0.7) over semantic/background; greeting in color/ink with no AI mark (v0.16.1; the old AiMark 1073:5 is hidden): no text style matches `fraunces-text font-heading text-xl font-medium tracking-normal`, so the layer binds font/heading + text/xl and carries Fraunces wght 500 · SOFT 50 · WONK 0, 140 % line height, 0 tracking; PromptComposer lg idle instance with `Show tabs`, `Add button` and `Mic` on and Send hidden, and the block's placeholder (the page's own tab row 1073:10 is hidden — the composer now draws the tabs); four starter cards (semantic/card, border, radius/lg, space/3 · 2_5 · 0_5). Visual baseline accepted 2026-10-04 at 0.72 % (`../README.md`, "Visual diff") |

### AI kit twins, Phase 2 (2026-10-04)

Code twins in `registry/lib` (the `src/components/ui` files are re-export shims, declined in
`sync-state.json`). All nine are in `components`, entered by hand from a REST read of each node
(`extractComponent`), and `node scripts/figma-drift.mjs` reports every one in sync. A set is tracked
through the variant named below. Sample copy is the `ai-chat` block's, so an AiChat instance needs no overrides.

| Twin | Page (id) | Node | Structure | Key bindings |
|---|---|---|---|---|
| AiNotice | ❖ AI notice (1132:4) | component **1132:9** | one centred line; TEXT property `Text` | px-2 → space/2, Text/xs in semantic/muted-foreground. The optional link is not drawn |
| AiThinking | ❖ AI thinking (1132:5) | set **1133:21** | Status=working, Open=false (1133:2, tracked) · Status=done, Open=false (1133:7) · Status=done, Open=true (1133:12); 320 wide | working: gap space/0_5, label = `ai-shimmer` as a gradient text fill (semantic/muted-foreground → color/ai-text-via → semantic/muted-foreground), activity Text/xs, `ai-line` 2px (color/ai-from · via · to · via · from) under an mt-1.5 (space/1_5) wrapper. done: chevron 14px + Text/sm in semantic/muted-foreground, gap space/1; open swaps the chevron for icon/keyboard_arrow_down (a rotated auto-layout child is not reliable) and shows the steps: ml-1.5, a 2px left rule (border-width/2, semantic/border), pl 14, Text/xs |
| AiMessage | ❖ AI message (1132:3) | set **1139:112** | State=default (1139:2, tracked) · streaming (1139:76) · stopped (1139:92); 576 wide; BOOLEAN `Thinking`, `Sources`, `Name` (all on) | avatar space/7, radius/4xl, semantic/background + semantic/border, AiMark Stars=two at 15px; gap space/2_5; body gap space/1_5; name row space/7 tall so "Assistant" (text/xs semibold, semantic/muted-foreground) sits on the avatar's centre line; AiThinking and Sources are instances; the answer is a wrapping row of text runs (text/sm at 162.5 %, semantic/foreground) and Citation instances, gap space/0_5 (the chip's ml-0.5), with the second chip grouped with the text after it (`Claim end`) so a comma never starts a line. streaming: caret 7×14 in semantic/foreground, no actions. stopped: "You stopped this answer." and Copy only |
| UserMessage | ❖ AI message (1132:3) | component **1139:113** | bubble; TEXT property `Text` | semantic/card + semantic/border, radius/xl with bottom-right radius/sm, py space/2, Text/sm in color/ink-soft |
| Citation | ❖ Citations (1132:6) | set **1135:20** | Kind=file (1135:2, tracked) · Kind=web (1135:11); TEXT `Label`, BOOLEAN `Preview` (off) | the chip shows the source's name: height space/5, px space/2, radius/md, semantic/muted, text/2xs semibold on a 20px line in color/ink-soft. `Preview` shows the hover card under the chip (absolute, 288 wide: semantic/popover, tint/foreground/10 ring, radius/lg, space/2_5, Elevation/base); Kind sets its icon (description / language, 13px) |
| Sources | ❖ Citations (1132:6) | set **1135:56** | Open=false (1135:21, tracked) · Open=true (1135:31); 544 wide | pill: height space/7, pl space/1_5, pr space/2_5, gap space/2, radius/4xl, semantic/background + semantic/border; 18px kind discs (semantic/muted, 2px semantic/background ring, overlap −6, icon 10px in color/ink-soft); count text/xs semibold. List: radius/lg, border, space/1, gap space/0_5; each row (space/2, gap space/2_5, radius/md) leads with a 22px kind tile (radius/md, semantic/muted, icon 14px), not a number |
| SuggestedPrompts | ❖ Suggested prompts (1132:8) | set **1136:31** | Layout=chips (1136:2, tracked) · cards (1136:9) · list (1136:22); 640 wide | chips: wrap, gap space/1_5; chip height space/8, px space/3, radius/4xl, semantic/background + semantic/border, Text/sm in color/ink-soft. cards: the ❖ AI home starter card (semantic/card, radius/lg, px space/3, py space/2_5, gap space/0_5), row gap space/2. list: rows py space/2_5, px space/1, gap space/2_5, top rule (the last one also a bottom rule) in semantic/border, icon/arrow_forward 16px in semantic/muted-foreground |
| ModelPicker Trigger | ❖ Model picker (1132:7) | component **1138:2** | a live ❖ Button instance (Variant=ghost, Size=sm), exposed | radius/4xl override, label and the icon/keyboard_arrow_down end icon (14px) in color/ink-soft. Change the label on the nested Button |
| ModelPicker Menu | ❖ Model picker (1132:7) | component **1138:8** | the open list, 288 wide | DropdownMenu anatomy: semantic/popover, tint/foreground/10 ring, radius/lg, Elevation/base, groups padded space/1, a semantic/border separator, "Choose" in Label/Small. Item: py and pl space/1_5, pr space/8, radius/md; the name row is space/5 tall and centres the name (Text/sm) with the badge (a live ❖ Tone badge instance, Tone=moss, Size=sm, 2026-10-04: the code's stock moss tone badge); description Text/xs; the 16px check sits on the name row's centre line |

| Block | Page | Page id | Frame id | Notes |
|---|---|---|---|---|
| ai-chat | ❖ AI chat | 1132:2 | 1140:2 | 1024×640 component on semantic/background. Chats rail 240 wide (space/2, gap space/0_5, right rule semantic/border): ❖ Button outline sm "New chat" with the start icon, day labels text/xs semibold, links Text/sm with radius/md, the current one on semantic/muted. Conversation: a 768 column (max-w-3xl), px space/4, py space/6, gap space/5 — UserMessage right-aligned, AiMessage State=default, SuggestedPrompts Layout=chips indented 38px; docked below (pt space/2, pb space/3, gap space/1_5) the PromptComposer sm idle instance with `Show tabs` off, `Model picker` on and the block's placeholder, then AiNotice. It shows the block's first render: reasoning and sources closed, no second turn. Visual baseline accepted 2026-10-04 at 1.59 % (`../README.md`, "Visual diff") |

- **PromptComposer gained a property.** `Model picker` (BOOLEAN, off) on set 1072:79 is the code's `trailing` slot: a hidden
  ModelPicker Trigger instance before Send / Stop in the six `Variant=default` variants. Nothing else on the set moved; its
  tracked entry and the ❖ AI home baseline still match (checked with `figma-drift.mjs`).
- **The reply actions are not live Button instances.** Code draws a 16px icon in a ghost `icon-sm` button; the ❖ Button
  twin's `icon-sm` variants hold a 14px icon that an instance cannot resize. Each action is that variant detached in place
  (space/7, radius/md kept) with the icon at 16px in semantic/muted-foreground, the same route the composer's mic took.
- **Two icons were missing.** `icon/thumb_up` (1131:4) and `icon/thumb_down` (1131:7) were added by the icon sync; the
  Icons page now holds 95, as code does.
- **No variable for three values**, left as typed numbers: 14px (`px-3.5` on UserMessage, `pl-3.5` on the steps), 38px
  (the follow-ups indent) and the 18 / 22px disc and tile sizes. Phase 2 adds no tokens.
- **Inline text is a wrapping row.** Figma cannot flow one paragraph around inline chips, so the answer breaks between
  runs, not inside one; at some widths a line ends a few words earlier than the browser's.
- **Not drawn:** the shimmer and line motion (CSS-only, shown as the full sweep), AiNotice's link, hover and focus states,
  a reply with no answer (it has no caret, Copy or action row: hide the answer and actions on an instance).

### AI kit twins, Phase 3 (2026-10-04)

Code twins in `registry/lib` (the `src/components/ui` files are re-export shims, declined in `sync-state.json`). Six entries
are in `components`, entered by hand from a REST read of each node (`extractComponent`), and `node scripts/figma-drift.mjs`
reports every one in sync. A set is tracked through the variant named below. Sample copy is each piece's first story. The
stamps in `sync-state.json` read 2026-10-05: the scripts write the UTC date.

| Twin | Page (id) | Node | Structure | Key bindings |
|---|---|---|---|---|
| AgentSteps | ❖ Agent steps (1172:2) | component **1172:151** | 448 wide; Header + five Step instances with the `InProgress` story's copy (the second one with `Detail` on, as the story opens it); TEXT `Title`, `Count` | card: semantic/card, semantic/border @ border-width/1, radius/xl, px space/4, py 14, gap space/2_5, Elevation/sm. Header gap space/2: AiMark Stars=one at 15px, title text/sm semibold in color/ink-soft, count Label/Small in semantic/muted-foreground. Rows gap space/0_5 |
| Step | ❖ Agent steps (1172:2) | set **1172:69** | Status=done (1172:19, tracked) · running (1172:35) · waiting (1172:48) · failed (1172:68); 414 wide; BOOLEAN `Detail` (off), `Retry` (off, failed only) | row: gap space/2_5, px space/1, py space/1_5, radius/md. Dots 16px (space/4, radius/4xl): done = color/moss-deep with icon/check 12px in color/paper; failed = color/terracotta-deep with icon/close; waiting = a 2px (border-width/2) semantic/input ring; running = icon/progress_activity in color/moss-deep. Label: done Text/sm in semantic/muted-foreground, running text/sm semibold in semantic/foreground, waiting and failed Text/sm in color/ink-soft. Meta Label/Small in semantic/muted-foreground. `Detail` shows the chevron (icon/keyboard_arrow_down 14px) and the detail: pt space/0_5, pb space/1_5, a 2px left rule in semantic/border, pl space/2_5, Text/xs. `Retry` shows a ❖ Button instance (ghost, xs) under pt space/1, label in semantic/destructive |
| ApprovalCard | ❖ Approval card (1174:2) | set **1174:94** | Kind=default, Editing=false (1174:37, tracked) · Kind=default, Editing=true (1174:72) · Kind=destructive, Editing=false (1174:93); 480 wide | the same card. Proposal tile: semantic/background, semantic/border outline (the divider line, 2026-10-05: the tile is read-only content), radius/lg, px space/3, py space/2_5, gap space/1_5; details are a label column (Text/sm, semantic/muted-foreground; each label ends with a colon, "To:", which the code adds) and a value column (semantic/foreground), gap space/3 and space/1; body Text/sm in color/ink-soft. Editing=true swaps the body for a ❖ Textarea instance (height space/24, the code's `min-h-24`) and shows Edit pressed. Buttons are ❖ Button instances with the start icon slot: default + icon/mail, outline + icon/edit, ghost on the right; destructive = the stock destructive Button + icon/delete. Consequence: icon/info (or icon/warning) 14px + Text/xs in semantic/muted-foreground, gap space/1_5 |
| QuestionCard | ❖ Question card (1175:2) | component **1175:85** | 480 wide; Header, question, three Option instances (the recommended one first, the free-text row last), actions; TEXT `Title`, `Question` | the same card. Question text/sm semibold in semantic/foreground; options gap space/1_5. Continue is the ❖ Button default in `State=Disabled` (nothing is chosen in the first render); Skip is the ghost Button |
| Option | ❖ Question card (1175:2) | set **1175:31** | Selected=false (1175:15, tracked) · Selected=true (1175:30); 446 wide; TEXT `Title`, `Description`; BOOLEAN `Recommended` (off), `Field` (off) | row: semantic/background, semantic/input outline @ border-width/1, radius/lg, px space/3, py space/2_5, gap space/2_5. ❖ Radio instance (off / on). Title text/sm semibold in semantic/foreground; `Recommended` shows a live ❖ Tone badge instance (Tone=moss, Size=sm), gap space/1_5; description Text/xs in semantic/muted-foreground, gap space/0_5; `Field` shows a ❖ Input instance under pt space/1_5. Selected=true: the outline binds semantic/foreground and a locked `Ring` rectangle (absolute, stretched, 2px INSIDE stroke @ border-width/2) draws the code's 1px inset ring, so the padding does not move |
| AiPopover | ❖ AI popover (1176:2) | set **1176:60** | State=ready (1176:30, tracked) · State=working (1176:59); 384 wide; TEXT `Title`; BOOLEAN `Insert below` (off) | Popover anatomy: semantic/popover, tint/foreground/10 ring @ border-width/1 (outside the layout, as a CSS ring), radius/lg, Elevation/base, plus the wash. Header (pt space/3, pb space/1, gap space/2): AiMark Stars=two at 18px, title text/sm semibold in semantic/foreground. Body pt space/1_5. ready: the suggestion tile (semantic/background, semantic/border outline (the divider line, 2026-10-05), radius/lg, px space/3, py space/2, text/sm at 162.5 % in semantic/foreground). working: gap space/1_5, the `ai-shimmer` label and the `ai-line` drawn exactly as the AiThinking twin draws them (the label's gradient fill and the Sweep rectangle are copies of 1133:3 and 1133:6). Actions (pt space/2_5, gap space/1_5): ❖ Button ghost Discard, outline Try again and Insert below, default Replace (plain solid, never the gradient); in working the last three are the `State=Disabled` variants |

| Block | Page | Page id | Frame id | Notes |
|---|---|---|---|---|
| ai-side-panel | ❖ AI side panel | 1180:2 | 1180:208 | 384×560 component, the `Default` story (the panel on its own; no Sheet, so no Close). semantic/popover plus the wash; the 1px semantic/border outline and radius/xl are the story's frame. Header (py and pr space/2_5, gap space/2): AiMark Stars=two at 18px, "Assistant" text/sm semibold, History. Thread (pt space/1, pb space/2_5, gap space/3, pinned to the bottom): the scope chip (height space/7, radius/4xl, semantic/background, semantic/input outline, pl space/2, pr space/1, gap space/1_5, icon/description 13px, Text/xs in color/ink-soft, a space/5 remove button with icon/close 12px); UserMessage right-aligned; AiMessage State=default with `Thinking`, `Sources` and `Name` off (the header already says "Assistant"), the block's sentence with one Citation (Kind=web) and Copy as its only action; SuggestedPrompts Layout=list with one row. Docked below (px space/3, pt space/2, pb space/3): PromptComposer sm idle, `Show tabs` off, the block's placeholder. No visual baseline yet (`../README.md`, "Visual diff") |

- **The wash** (`ai-wash`: top to bottom, `ai-from` at 12 % → `ai-via` at 8 % at 45 % → transparent) is two linear fills over the
  surface fill, the same route `ai-glow` took on ❖ AI home, because a bound gradient stop loses its alpha. Fill 1: stop 0 bound
  to color/ai-from, a transparent stop at 0.45, paint opacity 0.12 (0.16 until 2026-10-05, when code's top stop was lowered so small grey text on the wash meets AA). Fill 2: a transparent stop at 0, a stop at 0.45 bound to
  color/ai-via, a transparent stop at 1, paint opacity 0.08. No paint style and no new variable. Checked on 2026-10-04: an
  AiPopover instance inside a component inside a frame still draws the wash (looked at in Dark at 3x).
- **One detached Button: History.** Code draws a 16px icon in a ghost `icon-sm` button; the ❖ Button twin's `icon-sm` variant
  holds a 14px icon that an instance cannot resize. It is that variant detached in place (space/7, radius/md kept) with
  icon/history at 16px, the route Phase 2's reply actions took. Every other button is a live ❖ Button instance.
- **Overrides on live instances** (each paint is a full variable binding, never a paint opacity). Edit pressed
  (ApprovalCard, Editing=true) is the outline Button with its fill set to semantic/muted, copied from the `State=Hover`
  variant: that variant does not link its icon to the `Icon start` property, so an instance of it cannot show the
  icon. Retry's label is semantic/destructive. In the block, the UserMessage text and the follow-up label bind
  semantic/foreground: they inherit the panel's `text-popover-foreground`, where on a page they inherit the body's
  color/ink-soft. The block's AiMessage keeps its link to the twin: the answer row is bottom-aligned, its first text grows
  to fill the row, the second text run, the second chip and three of the four reply actions are hidden.
- **`icon/history` was missing.** Added by the icon sync (1171:4); the Icons page now holds 96, as code does.
- **No variable for these values**, left as typed numbers: 14px (`py-3.5` on the three cards; `px-3.5` and `pb-3.5` on the
  popover; `pl-3.5` and `px-3.5` on the panel), 19px (the one-line box, the code's `h-[1lh]`, that keeps a dot, a note or a
  radio on the first line), 30px (the detail's `ml-[1.875rem]`), 15px (the mark in the card headers), 162.5 %
  (`leading-relaxed` on the suggestion), the wash's 0.12 / 0.08 / 0.45, and the 384×560 of the panel. Phase 3 adds no tokens.
- **Each status keeps its own sample label.** A TEXT property has one default for a whole set, which would have written
  the done step's label over the failed one and the email's title over the delete card's. Step and ApprovalCard therefore
  carry no TEXT property: type on the instance.
- **Inline text is a wrapping row** (as in Phase 2): in the block the answer breaks one word earlier than the browser's,
  and the chip sits at the end of the row instead of straight after "shipped".
- **Read-only tiles take the divider line; controls take the control line** (2026-10-05, v0.19.0). The approval card's
  proposal tile (1174:8, 1174:43) and the popover's suggestion tile (1176:10) bind their 1px outline to semantic/border; what
  tells them apart from the surface is their semantic/background fill. Things people press, remove or type in keep
  semantic/input: the question card's Option rows and the side panel's scope chip. Draw a new tile by that rule. The
  stroke paints were copied from a node that already draws semantic/border (see `../README.md`, "Binding a colour on a NEW
  paint").
- **AiMessage gained a property.** `Name` (BOOLEAN, on) on set 1139:112 is the code's `hideName` turned round: off hides the
  name row (1139:8, 1139:82, 1139:98) in all three variants. Additive, as `Model picker` was on PromptComposer: nothing
  else on the set moved, and its tracked entry still matches. Code then pads the first row by half of what is left of
  the avatar's 28px after one line of text, so the two share a centre line; a property cannot add padding, so on the
  side panel's instance the Answer row carries that padding as a typed override (2.625px, for the 22.75px answer line).
  An instance with `Name` off and `Thinking` on, or the stopped line first, needs the same by hand (4px and 6px).
- **Not drawn:** the fade under the header when the thread is scrolled (a scroll-time mask; the frame shows the thread
  at rest); the Sheet's full width on a phone and where focus lands when it opens (neither has a Figma equivalent);
  hover and focus states; the spinner's motion and the shimmer and line motion (CSS-only, shown as the full
  sweep); the outcome line that replaces the buttons once the person has decided, on both cards; a step that has detail
  but is closed (`Detail` draws it open); the destructive card with a proposal tile (the story has nothing to show, so
  no tile is drawn); the popover's height cap and scrolling body, and the text it is anchored to; the History button's
  behaviour, the Sheet around the panel and its Close; `tabular-nums` on the counts.

### Accent (2026-07-11; re-pinned to moss 2026-07-20)

Code adds `data-accent="terracotta|moss|indigo|gold"` (eyebrows, accent italics,
links, focus rings). Figma can't model a second runtime dimension — the Primitives
collection is at its 4-mode ceiling — so the accent is **pinned to the code default,
moss** (was terracotta until v0.2.6 made moss the default):
- `semantic/link`, `semantic/ring`, `semantic/sidebar-ring` re-aliased → `color/moss-deep`
  (originally fixed indigo/ink, then terracotta; re-synced to moss 2026-07-20).
- The ❖ Theme selector menu lists Moss first with the selected check (matches the
  v0.2.6 dropdown order).
- New primitive `color/gold-text` (VariableID:232:3) — gold's AA text cut
  (`#826637` / `#E2CA9E` / `#996D18` / `#ECC883`); gold/deep is only 3.3:1 on light grounds.
- The ❖ Theme selector menu shows the Accent section with pigment swatches.

### Variable modes (four themes, 2026-07-11)

`Quill Primitives` (VariableCollectionId:3:2) now has four modes — **Light (Dawn),
Dark (Dusk), Classic Light, Classic Dark** — matching the code's `data-theme`
values (`light`/`dark`/`classic-light`/`classic-dark`). All 29 COLOR variables
carry per-mode values sourced from `tokens/quill.figma.json` (the DTCG export
emits the same four modes). `Quill Semantic` stays single-mode: its aliases
resolve through the Primitives modes. FLOAT/STRING variables are mode-independent
(new modes inherit the default-mode value). Note: 4 modes is the Professional-plan
ceiling — a fifth theme would need an Org plan or a second collection.

## Wave C (overlays/compounds) — 16/16 done (2026-07-20)

| Component | Page | Notes |
|---|---|---|
| Dialog | ❖ Dialog | popover surface + foreground/10 ring + Elevation/base; full-bleed muted/50 footer with **Button instances** (Cancel/Save) |
| AlertDialog | ❖ Alert Dialog | destructive Button instance (10%-opacity fill re-applied — same instance quirk as Badge) |
| Sheet | ❖ Sheet | Side=Right (320×420, border-l, stacked full-width buttons) / Side=Bottom (border-t, footer row) |
| Drawer | ❖ Drawer | bottom, rounded-t-xl, muted grab handle, stacked footer buttons |
| Popover | ❖ Popover | w-72, p-2.5; title/desc + Label/Input instances row |
| HoverCard | ❖ Hover Card | w-64; Avatar instance + name/bio/joined (fixed primary-axis width — hug collapses horizontal shells) |
| DropdownMenu | ❖ Dropdown Menu | p-1 groups, rounded-md items, icons + ⌘-shortcuts, separator, destructive item |
| ContextMenu | ❖ Context Menu | no-icon items, disabled row at 50% opacity, destructive Delete |
| Menubar | ❖ Menubar | h-8 bordered bar, p-[3px] (literal in code too), gap-0.5 triggers |
| Command | ❖ Command | rounded-xl + Elevation/lg; h-10 search row, group labels, selected item bg-muted |
| Combobox | ❖ Combobox | embedded search m-1 bg/border input@30%; checked option via icon/check |
| ToggleGroup | ❖ Toggle Group | 3 icon toggles (format_bold/italic/underlined), middle pressed bg-muted |
| Slider | ❖ Slider | absolute layout: track input, range primary, thumb background + ring stroke |
| InputOTP | ❖ Input OTP | two fused 3-slot groups (border collapse like ButtonGroup) + icon/remove dash |
| Table | ❖ Table | h-10 rows, border-b, Badge instances for status, right-aligned amounts |
| Toast | ❖ Toast | Variant: Default/Success/Destructive; icons check_circle→semantic/success, dangerous→destructive |

Deferred with reasons: Navigation Menu (complex marketing nav, low app value),
Calendar (already mocked in two pattern pages), Carousel/Chart (SVG-heavy; charts
live in the Analytics pattern), Scroll Area/Resizable/Collapsible (interaction-only),
Empty/Item (trivial wrappers), Native Select (visually = Select), Sidebar (exists
as pattern), AspectRatio (trivial CSS wrapper — sets an aspect-ratio custom property
on a plain div, no fill/border/token binding of its own; nothing to represent as a
Figma component).

## Sync audit (2026-08-10)

A full live-file audit (every page enumerated via the Plugin API, every
component's `variantGroupProperties` diffed against its current `.tsx` source —
not against this doc, which had drifted) found 3 components whose Figma variant
structure had fallen behind code as the components evolved after their original
build date. All 3 fixed and re-verified against live Storybook renders:

- **Button** — was `Variant(6) × Size(default/sm/lg)` = 18. Code had grown to 8
  sizes (`xs`, `icon`, `icon-xs`, `icon-sm`, `icon-lg` added). Now `Variant(6) ×
  Size(8)` = 48, matching `buttonVariants` in `button.tsx` exactly. Also fixed a
  pre-existing bug found along the way: the `destructive` variant's fill was
  fully opaque with same-color text (invisible) instead of the `/10`-opacity
  tint `bg-destructive/10 text-destructive` actually renders — same class of
  issue the original build notes flagged for Badge, missed here. Fixed on all
  8 destructive size variants.
- **Toggle** — was `Pressed: off/on` only (2 variants), a leftover from before
  `toggle.tsx` grew a `variant`/`size` axis. Now `Variant(default/outline) ×
  Size(default/sm/lg) × Pressed(off/on)` = 12. Also fixed a pre-existing binding
  error: the two original variants were bound to `radius/md` (6px) but
  code actually renders 8px (`radius/lg`) for the default/lg size tier —
  corrected across all default/lg-tier variants.
- **Tabs** — was a single component, no variant axis. `tabs.tsx` has a real
  `variant: default/line` prop (segmented-pill vs. underline style) with no
  Figma counterpart. Added the `line` variant, built from a live Storybook
  screenshot of `LineVariant` rather than guessed from source, since Tailwind's
  cascade order isn't always obvious from the class strings alone.

Everything else audited (Badge, Alert, Checkbox/Switch/Radio, Field, Button
group, Input group, Sheet, Toast) already matched current code exactly.

**Lesson for future syncs:** this doc is a build log, not a live source of
truth — always verify against the file directly (`figma.variables`,
`variantGroupProperties`, live Storybook screenshots) before trusting what's
written here or assuming "built" means "still current."

## Button icon slot (2026-09-18)

The Button set (`359:267`) carries four component properties: **Icon start** / **Icon end**
(booleans, off by default) and **Icon start swap** / **Icon end swap** (instance swaps over the
91 `icon/*` components; defaults `icon/add` and `icon/arrow_forward`). The 24 text-size
variants hold a hidden 16 / 14 / 12 px icon instance at each end (default & lg 16, sm 14, xs 12,
the code's `size-4 / 3.5 / 3`); the 24 icon-only variants hold one always-visible instance
bound to **Icon start swap**. Each icon's vector fill is overridden per variant to the variant's
text colour, so a swapped icon follows the button. Two gotchas: (1) **setting a swap to the icon
that is already the default resets the override** to `deprecated/text-strong` — when the default icon is
the one you want, set only the boolean; (2) the code shrinks padding on the icon side
(`has-data-[icon=inline-end]:pr-2`), which Figma cannot express conditionally, so slot
buttons sit 2 px wider than the render. Every icon button across the 47 mirrored pages is now
an instance with the slot on (35 code-side occurrences → 43 visible icon instances once rows and
cards repeat); the composed icon-only buttons on the 2026-09-18 pages and the composed July
buttons (Mail inbox toolbar + Send, Login — minimal Continue, Theme selector trigger,
Announcement dismiss glyphs) were replaced in place, and the buttons the July pages never had
(File upload row dismiss, Team section mail, Login — split panel magic link + rule) were added.

## Visual parity sweep + master components (2026-09-19)

Every twin (44), every pattern page (47) and the three example pages were
compared **visually** against their Storybook render — Figma screenshots via
the MCP exporter, Storybook via the repo's own Playwright in the bare iframe
(`iframe.html?id=<story>&viewMode=story`, Dawn, DPR 2; popups opened by
script). The daily check reads bindings and copy; it cannot see a paint that
renders wrong, so the sweep found what it never could:

| Twin / page | Drift | Fix |
|---|---|---|
| Badge `Variant=destructive` (65:5) | fill at 100 % — text and fill both destructive, label invisible | opacity 0.1 (second assignment) |
| Checkbox / Radio `Checked=off` (78:4, 80:4) | strokeWeight 0 — the unchecked control was invisible | 1 px bound to `border-width/1` (Figma stores it per side) |
| Alert `Variant=destructive` (94:16) | destructive stroke; code keeps `border` | stroke → `semantic/border` |
| Input group `Layout=Block` send button | arrow vector `deprecated/text-strong` on a primary fill | `semantic/primary-foreground` |
| Breadcrumb (97:10), Pagination (97:25), ❖ Search results titles, ❖ Sidebar navigation crumb | drawn muted / ink; in code these are `<a>` and the shipped CSS colours anchors `var(--text-accent-color)` | `semantic/text-accent-color` |
| Pagination active cell | tan fill; code = Button `outline` | `semantic/background` + `semantic/border`; "Previous" / "Next" labels added |
| Dialog (263:112), Sheet Right / Bottom | no close button; `showCloseButton` defaults true | Button instance `ghost` × `icon-sm`, swap `icon/close`, absolute top-right (8 px dialog, 12 px sheet) |
| Command (266:35) | plain search row with bottom rule; code wraps the input in an `InputGroup` (`h-8 rounded-lg bg-input/30 border-input/30`) | row restyled in place, icon at 50 % |
| ❖ Stat cards "+6" badge | destructive instance kept the pre-fix solid paint | two-step component-paint recipe |
| notifications block (**code**) | `flex-row` on a grid `CardHeader` is inert — the action wrapped under the title | `flex flex-row`; page re-stamped |

Rules learned (add to the recipe above):

- **An instance-override paint must copy the component's paint, never a
  placeholder.** `setBoundVariableForPaint` on a black placeholder stores the
  binding but the instance *renders the placeholder*. Copy `mc.fills[0]`
  (real colour + binding), then set opacity in a second assignment.
- **Verify a colour by sampling**, not by reading the binding: a temporary
  1 × 1 `SLICE` over the pixel, `exportAsync`, read the PNG (pngjs is in
  `node_modules`). This is how the placeholder case above was caught.
- **Pattern page canvases are paper** (`#F5EDDD`, the Storybook ground). Page
  backgrounds refuse a variable binding, so the value is raw and does not
  follow Dusk / Classic.
- **A link is green.** The shipped theme colours every `<a>` with
  `--text-accent-color`; any block text rendered as an anchor (breadcrumb
  crumbs, pagination cells, result titles) binds `semantic/text-accent-color`.


Round two of the sweep (an independent QA agent re-read every fix by pixel sample) added: Radio `Checked=on` was drawn inverted (grey ring + dark dot; code fills the disc `primary` with a `primary-foreground` dot), the Checkbox check was a thin 6.8 px vector reading grey (now an `icon/check` instance at 14 px, the code's `size-3.5`), Badge `Variant=link` was underlined at rest (code underlines on hover only), the Sheet footer stacked the primary button above the outline one (the story stacks outline first), and every ❖ component page sat on Figma's default grey canvas — all 93 ❖ pages are paper now.

- **Tints are variables, not paint opacity.** A paint-level opacity on a bound colour is
  dropped when the component is instanced inside another component (the app-page
  template drew every tinted badge and card ring solid), while a variable whose value
  carries the alpha survives any depth (the 12 % `semantic/border` alias always did). The
  opacity modifiers code puts on tokens are therefore 13 `tint/<token>/<pct>` variables in
  the Primitives collection — `tint/destructive/10`, `tint/foreground/10`, `tint/muted/50`,
  `tint/input/30`, `tint/primary/10`, `tint/chart-1/20`, `tint/chart-2/20`,
  `tint/sidebar-border/8`, `tint/sidebar-foreground/70` and the four ToneBadge pigment
  tints — derived per mode by `syncTints()` in `../sync-foundations.figma.js` (single
  source: the `TINTS` table there). Every tinted paint binds one at paint opacity 1; the
  "opacity is a second assignment" recipe above is now only for one-off values that have
  no tint variable, and never inside a component that will be instanced. Popover, Dropdown
  menu, Context menu and Combobox had been ringed with `semantic/foreground` at 100 % —
  found by the binding dump, not by eye.
- **An instance-override paint does not survive nesting.** The stat-cards "+6" badge had its fill overridden to 10 % (instance-paint recipe); the ❖ Stat cards page rendered right, but an instance of that page inside the app-page template drew the badge solid again. The robust fix is *no override at all*: fix the paint on the main component, `resetOverrides()` on the instance and re-apply only its text. Reach for the instance-paint recipe only when the component itself cannot carry the value.

### Master components

Every mirrored pattern frame is now a **main component** (`❖ <Name>` page →
one `COMPONENT` named after the block, description `Code twin:
registry/blocks/<block>.tsx`). `createComponentFromNode` keeps the children
but issues a **new node id** — the ids in `sync-state.json → patterns` and
`pattern-baseline.json` were rewritten in the same pass. The three example
pages (`registry/examples`) are **template components** composed from those
block components as instances, on their own `❖ Example: …` pages, tracked in
`sync-state.json → templates` by the same guards (coverage, content, re-stamp,
daily presence check).

| Template | Page | Page id | Component id | Composition |
|---|---|---|---|---|
| example-app-page | ❖ Example: app page | 700:2 | 700:274 | Sidebar nav shell (placeholder cards hidden) + Page header + Stat cards + Data table stacked in the content area |
| example-auth-page | ❖ Example: auth page | 697:234 | 697:289 | Login — split panel alone |
| example-marketing-page | ❖ Example: marketing page | 697:2 | 697:233 | Navbar → Hero → Feature section → Pricing (96 / 48 px section) → Testimonial (centred, 96 px) → Footer |

### Accordion re-cut (2026-09-19, after the sweep)

Ryan's spot check. A screenshot comparison had passed the Accordion; a **property-level**
comparison (computed styles read from the live story with Playwright vs the twin's node
dump) did not: trigger at Body/Base 15.2 Regular vs code `text-sm font-medium` (13.6
Medium, line-height 142.857 %, and −0.48 px tracking inherited from the shipped
`h1–h6 { letter-spacing: -0.03em }` rule — the trigger sits in an `h3`); item padding 16
vs `py-2.5`; a hand-drawn chevron hugging the label vs a 16 px `icon/keyboard_arrow_down`
at the right edge; content muted-foreground vs the shipped `body { color: var(--ink-soft) }`;
a rule under the last item. Rules for the next sweep:

- **Screenshots find layout and colour drift; they miss type metrics.** Pair every visual
  pass with a computed-style dump of the story (`getComputedStyle` on the slots) against
  the twin's text nodes: family, weight, size, line-height, letter-spacing, colour.
- **`text-sm` / `text-base` carry Tailwind's own line-heights** (142.857 % / 150 %), not
  the body 1.7 the `Body/*` text styles encode. A twin text that mirrors a `text-*`
  utility binds `text/*` for size and sets the utility's line-height; the `Body/*`
  styles are for untagged prose only. Open: audit the other twins for Body/S on
  `text-sm` text.
- **Headings leak tracking.** Anything rendered inside an `h1–h6` (Accordion header,
  CardTitle, DialogTitle…) inherits −0.03em from the shipped base layer.
- **A CSS border adds to the box; a Figma inside stroke does not.** Ruled items get the
  border width added to their padding (Accordion: paddingBottom 11 on `not-last` items).

## Sync fixture (2026-08-12, retired 2026-10-04)

`❖ Test` (component node `371:7`) was the **bi-directional sync fixture** — its code twin
was `src/components/ui/test-card.tsx` (story `Sandbox / Test`). Both directions were proven
on it: Figma edit pulled into code (~2 min), code edit pushed onto the node in place (~1 min).

Retired 2026-10-04 (CRA-267). It was never part of the design system, and the daily parity
run checks every real twin, so the stand-in had no job left. Removed together: the component
file, its story, its `sync-state.json` entry, and in Figma the component and its `❖ Test`
page (the page held nothing else and the component had no instances anywhere in the file).
To walk the workflow, use a real twin such as Button (`359:267`) or ToneBadge (`577:75`);
procedure in `../README.md` ("Component sync — pull & push"). Code is the ultimate source of truth.

## State axis, tranche 1 — form controls (2026-09-22)

CRA-221, decided by Ryan: every state the code styles exists on its Figma twin, one to one. Scoped from the
code — `src/components/ui` carries state styling in 36 primitives — and built control by control. The six form
controls share one recipe in code, so they went first:

| control | set | was | now | states |
|---|---|---|---|---|
| Input | `828:36` | single `77:5` | 4 variants, `77:5` = Default | Focus · Invalid · Disabled |
| Textarea | `830:1004` | single `84:4` | 4, `84:4` = Default | Focus · Invalid · Disabled |
| Select (trigger) | `830:1019` | single `96:12` | 4, `96:12` = Default | Focus · Invalid · Disabled |
| Checkbox | `78:9` | Checked ×2 | Checked × State = 8 | Focus · Invalid · Disabled |
| Radio | `80:8` | Checked ×2 | 8 | Focus · Invalid · Disabled |
| Switch | `79:9` | Checked ×2 | 8 | Focus · Invalid · Disabled |

What each state is, from the classes: **Focus** = `focus-visible:border-ring` + `ring-3 ring-ring/50` — the 1px
border binds `semantic/ring`, plus a ring. **Invalid** = `aria-invalid:border-destructive` + `ring-3
ring-destructive/20` — a checked Checkbox / Radio keeps `border-primary` (`aria-invalid:aria-checked:border-primary`),
so only the ring changes there. **Disabled** = `opacity-50`, and `bg-input/50` on Input and Textarea. The tints
`tint/ring/50`, `tint/destructive/20`, `tint/input/50` were declared in 0.10.6 for this. The default variant keeps
its node id and its children, so the daily parity check (which tracks one variant per set) is unaffected.

**The ring recipe — a drop shadow does not work.** The obvious Figma ring (`DROP_SHADOW`, blur 0, spread 3) widens
the node's render bounds but draws **nothing** on a frame with no fill: sampled 2 px outside the border →
paper, with or without a variable binding, with or without `showShadowBehindNode`. What renders is geometry:
a locked `Ring` rectangle as the first child, absolutely positioned at 0,0, the node's size and radius,
**no fill, a 3 px `OUTSIDE` stroke** bound to the tint, constraints STRETCH/STRETCH, with `clipsContent` off
on the variant. That is a CSS box-shadow ring exactly: a band outside the box, nothing under it (a filled
rectangle behind the field showed through the transparent interior — wrong). Sampled: `#a0a289` outside
(moss-deep at 50 % over paper), `#f5eddd` inside. `clone()` puts the copy on `figma.currentPage`, so a
set-building script must `setCurrentPageAsync` its page first or `combineAsVariants` throws.

Not built yet, in this order: **Button** (hover / active / focus / disabled / invalid on 48 variants = 240),
Toggle (hover / focus / disabled / invalid on 12), Badge (focus / invalid), Tabs (hover / focus / disabled),
Slider, Input OTP, Input group, Native select, Label (peer-disabled), Calendar (disabled / selected); then
the menu items (focus / disabled), Accordion (focus / disabled), Sidebar items (hover / active / focus /
disabled), Table row (hover / selected). The dark-only `ring-destructive/40` and `bg-input/80` have no
variable (a tint carries one alpha across modes).

## State axis, tranche 2 — Button and Toggle (2026-09-22)

| set | was | now | states |
|---|---|---|---|
| Button `359:267` | Variant × Size = 48 | × State = **288** | Hover · Focus · Invalid · Active · Disabled |
| Toggle `356:183` | Variant × Size × Pressed = 12 | × State = **60** | Hover · Focus · Invalid · Disabled |

Both sets are manual grids, so each state is the 48- (or 12-) variant grid copied into a block to the right
(744 px / one set width + 48 apart); the originals were renamed `…, State=Default` and keep their ids.

Button states come from the cva per variant: **Hover** — default `bg-primary/80` (`tint/primary/80`); outline
and ghost `bg-muted text-foreground`; secondary `color-mix(in oklch, secondary, foreground 5%)`, which two
stacked fills (`semantic/secondary` under `tint/foreground/5`) render exactly; destructive `bg-destructive/20`;
link `underline` on the label. **Focus** — `border-ring` + Ring `tint/ring/50`, except destructive, whose own
classes are `border-destructive/40` + `ring-destructive/20`. **Invalid** — `border-destructive` + Ring
`tint/destructive/20`. **Active** — `translate-y-px`: paddingTop +1 / paddingBottom −1 on the auto-layout frame,
so the label sits 1 px lower at the same height. **Disabled** — opacity 50 %. `aria-expanded` (a menu open)
renders as Hover for outline / ghost and as Default for secondary, so it is not a separate variant. The three
tints `tint/primary/80`, `tint/foreground/5`, `tint/destructive/40` were declared for this (0.10.8) and are
recorded in `sync-state.variables`.

Toggle: Hover `bg-muted text-foreground`; Focus `border-ring ring-[3px] ring-ring/50`; Invalid
`border-destructive ring-destructive/20`; Disabled opacity 50 %. Pressed was already an axis.

## State axis, tranche 3 — Badge, Tabs, Slider, Input OTP, Input group, Label (2026-09-22)

| set | was | now | states, from the classes |
|---|---|---|---|
| Badge `65:13` | Variant × 6 | **24** | Hover (the badge as a link: default `primary/80`, secondary `secondary/80`, destructive `destructive/20`, outline / ghost `muted` + muted-foreground, link underline) · Focus · Invalid. No disabled state in code. |
| Tabs `355:19` | Variant × 2 | **8** | Shown on the second, inactive trigger: Hover `text-foreground` · Focus ring · Disabled 50 %. The list twin's children stay frames, so the parity signature holds. |
| Slider `835:25` | single `267:159` | **5** | Hover, Focus, Active — each `ring-3` on the thumb's `ring-ring/50`, identical by design, three variants because the code names three states (an ELLIPSE ring around the thumb) · Disabled 50 %. |
| Input OTP `835:70` | single `267:175` | **4** | Focus = the active slot (`data-[active=true]:border-ring ring-ring/50`, on the first slot) · Invalid = every slot `border-destructive`, ring on the group · Disabled 50 %. |
| Input group `261:113` | Layout × 2 | **8** | Focus (control focus → group `border-ring ring-ring/50`) · Invalid · Disabled (50 % + `bg-input/50`). |
| Label `835:1225` | single `82:9` | **2** | Disabled (`peer-disabled:opacity-50`). |

`tint/secondary/80` was declared for the secondary badge's link hover (0.10.9). Not twins, so no State axis:
Native select, Calendar, Sidebar (patterns or declined).

## State axis, tranche 4 — list items (2026-09-22). The axis is complete.

These twins are whole popups, lists or bars, so the state is shown on one member (the second item, or the
first link), keeping every child a frame so the parity signature holds.

| set | states, from the classes |
|---|---|
| DropdownMenu `837:64` · ContextMenu `837:97` | Focus = `focus:bg-accent text-accent-foreground ring-[1.5px] ring-inset ring-ring` (a 1.5 px INSIDE stroke) · Disabled = `data-disabled:opacity-50` |
| Menubar `837:120` (the bar) | Hover = `hover:bg-muted` · Open = `aria-expanded:bg-muted` (renders as Hover; its own variant because the code names it) |
| Combobox `837:157` | Highlighted = `data-highlighted:bg-accent …` · Disabled |
| Command `837:196` | Disabled. The selected item (`data-selected:bg-muted`) is the first in every variant already. |
| Accordion `837:243` | Hover = `hover:underline` · Focus = `focus-visible:border-ring ring-3 ring-ring/50` · Disabled = `aria-disabled:opacity-50` |
| Table `837:314` | Hover = `hover:bg-muted/50` · Selected = `data-[state=selected]:bg-muted` |
| Breadcrumb `837:1432` | Hover = `hover:text-foreground` on a link |

**Where the axis ends.** Every twin whose code carries state styling now has it. ToggleGroup and Pagination
compose Toggle and Button instances, so their states live on those sets. Dialog, Sheet, Drawer, Popover,
HoverCard and Tooltip style `data-open` — the popup being present — which is the twin itself. Item, Sidebar,
Calendar, Native select, Navigation menu, Resizable and Scroll area have state styling in code but no twin
(patterns, or declined), so nothing to add there.

## Next

- Visual QA sweep in Dusk / Classic modes (the 2026-09-19 sweep covered Dawn only).
- Extend the type audit to read Fraunces axes (SOFT / WONK / opsz), not just weight.
