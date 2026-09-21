# Quill colour roles — intent lines (DRAFT)

Measured 2026-09-21 on branch `feat/semantic-contract`, commit `3ab9d75` plus 28 uncommitted files (the tree was being edited while this was measured — see "Evidence method"). Every number is **verified** (ran it) unless tagged **(inferred)**.

## Summary

1. **Zero usage:** 4 of the 31 contract roles are used nowhere in shipped code in any form — `chart-4`, `chart-5`, `sidebar-primary`, `sidebar-primary-foreground`. Three more (`chart-1`, `chart-2`, `chart-3`) are never used as a class, only as one CSS-variable read each. All 8 kept Quill roles have **0** uses in the four shipped directories; 6 of them (`success`, `warning`, `danger`, `info`, `working`, `queued`) are read nowhere in the whole repo.
2. **Most used (class uses, 842 total):** `muted-foreground` 146 · `foreground` 122 · `destructive` 85 · `muted` 74 · `ring` 62.
3. **Seven surface roles are only three colours.** `card` = `popover` = `sidebar` (paper-warm); `secondary` = `muted` = `accent` = `sidebar-accent` (paper-deep). Nothing on screen tells them apart, so the intent line is the only thing that does.
4. **Conflicts found (code vs written docs):** link-styled text is ink (`text-primary`) while docs say links follow the accent · `ring` is used as a "selected / featured" outline, not only focus · hover wash has two names (`hover:bg-muted` and `hover:bg-accent`) · hand-built cards use two different outlines · section roots force ink over the ink-soft body default · `destructive` and `--danger` are one colour with two names · DESIGN.md still describes a neutral `--focus-ring` that does not exist, and still lists "CTAs" under moss and "links" under indigo.
5. **The source moved mid-session.** `tokens.shadcn` is now `tokens.semantic` (the 31 roles) and the 8 kept roles now live in a new `tokens.status` group; the 10 retired names are in `tokens.deprecated`. Every role → primitive mapping is unchanged (checked by loading the live module).

Reading the counts: "blocks" = `registry/blocks` + `registry/examples` + `registry/lib` (what an agent composes with); "primitives" = `src/components/ui` (stock shadcn parts the theme restyles).

---

## Contract roles (31)

### `background` — 29 uses (blocks 11, primitives 18)
- **Resolves to:** paper, the base page colour (pressed cream in Dawn).
- **Use for:** the page ground and full-width sections; also the cut-out fill of controls that sit on another surface (outline button, switch thumb, active tab).
- **Never for:** cards, menus or dialogs. Those sit one step warmer, on `card` or `popover`.
- **Pairs with:** `foreground`.
- **Top forms:** `bg-background` 21 · `ring-background` 3 · `text-background` 2
- **Examples:** `registry/blocks/dashboard.tsx:24` app shell root · `registry/blocks/navbar.tsx:9` top nav bar · `src/components/ui/switch.tsx:27` the switch thumb · `src/components/ui/tooltip.tsx:54` `text-background`, tooltip text on an ink fill.

### `foreground` — 122 uses (blocks 70, primitives 52)
- **Resolves to:** ink, the warm near-black.
- **Use for:** strong text: headings, names, values, totals. At 10% it is the hairline ring around cards and floating panels.
- **Never for:** captions, meta or placeholder text. That is `muted-foreground`.
- **Pairs with:** `background`.
- **Top forms:** `text-foreground` 98 · `ring-foreground/10` 17 · `bg-foreground` 5
- **Examples:** `registry/blocks/empty-state.tsx:12` empty-state title · `registry/blocks/data-table.tsx:57` member name in a table row · `src/components/ui/card.tsx:16` Card outline (`ring-foreground/10`) · `src/components/ui/tooltip.tsx:54` tooltip fill (`bg-foreground`).
- **Conflicts:** the shipped theme sets body copy to ink-soft (`registry/themes/quill.css`, base layer `body { color: var(--ink-soft) }`) and DESIGN.md says "Body copy is ink-soft". But section roots set `text-foreground` (`hero.tsx:8`, `footer.tsx:12`, `dashboard.tsx:24`) and `list-detail.tsx:57` sets it on a message body, so unclassed paragraphs inside them render ink, not ink-soft. There is no contract role for ink-soft.

### `card` — 14 uses (blocks 10, primitives 4)
- **Resolves to:** paper-warm, one step warmer than the page.
- **Use for:** in-page raised surfaces: cards, inline banners, the chat window, kanban tasks, the empty-state panel.
- **Never for:** floating layers such as menus and dialogs (those are `popover`), and never the page ground.
- **Pairs with:** `card-foreground`; outline is `ring-1 ring-foreground/10`.
- **Top forms:** `bg-card` 13 · `ring-card` 1
- **Examples:** `src/components/ui/card.tsx:16` the Card itself · `registry/blocks/kanban.tsx:22` a kanban task · `registry/blocks/activity-feed.tsx:56` `ring-card`, a card-coloured halo that masks the timeline rule behind each avatar.
- **Conflicts:** two outlines for the same object. The Card primitive and 3 blocks (`faq.tsx:47`, `newsletter.tsx:10`, `stats-band.tsx:13`) use the 10% ink ring DESIGN.md documents; 6 hand-built block cards use `border border-border`, which is 12% (`announcement-banner.tsx:10`, `chat.tsx:15`, `cookie-consent.tsx:7`, `empty-state.tsx:7`, `kanban.tsx:22`, `testimonial.tsx:4`). Also `cookie-consent.tsx:7` is a floating bar with `shadow-md` built on `bg-card`; by the rule above it would be `popover` (same colour today). One of the 14 uses is `src/components/ui/test-card.tsx:20`, a Figma round-trip fixture that is not in the registry.

### `card-foreground` — 3 uses (blocks 0, primitives 3)
- **Resolves to:** ink.
- **Use for:** the default text colour, set once on the root of a Card or Alert.
- **Never for:** text anywhere outside a `card` surface.
- **Pairs with:** `card`.
- **Top forms:** `text-card-foreground` 3
- **Examples:** `src/components/ui/card.tsx:16` Card root · `src/components/ui/alert.tsx:11` default Alert · `src/components/ui/test-card.tsx:20` (fixture).
- **Conflicts:** blocks that hand-build a card set `text-foreground` instead (`chat.tsx:15`, `cookie-consent.tsx:7`, `testimonial.tsx:4`). Both are ink today, so nothing looks wrong — but the pairing is not followed.

### `popover` — 19 uses (blocks 0, primitives 19)
- **Resolves to:** paper-warm (the same colour as `card`).
- **Use for:** anything that floats above the page: menus, selects, popovers, hover cards, dialogs, sheets, drawers, the command palette.
- **Never for:** in-page cards or sections. Those are `card`.
- **Pairs with:** `popover-foreground`; outline is `ring-1 ring-foreground/10` plus a shadow.
- **Top forms:** `bg-popover` 19
- **Examples:** `src/components/ui/popover.tsx:41` PopoverContent · `src/components/ui/dialog.tsx:57` DialogContent · `src/components/ui/sheet.tsx:57` SheetContent.

### `popover-foreground` — 16 uses (blocks 0, primitives 16)
- **Resolves to:** ink.
- **Use for:** the default text colour inside a floating layer, set once on its root.
- **Never for:** text outside a `popover` surface.
- **Pairs with:** `popover`.
- **Top forms:** `text-popover-foreground` 16
- **Examples:** `src/components/ui/dropdown-menu.tsx:45` DropdownMenuContent · `src/components/ui/hover-card.tsx:42` HoverCardContent.

### `primary` — 46 uses (blocks 17, primitives 29)
- **Resolves to:** ink. It is near-black, **not** a brand colour.
- **Use for:** the main action and "on / done" states: default button, checked checkbox, radio and switch, progress fill, selected date, finished step, unread dot.
- **Never for:** brand colour or "make it pop" emphasis. The brand accent is the accent pigment (`--accent-pigment-text`).
- **Pairs with:** `primary-foreground`.
- **Top forms:** `bg-primary` 24 · `text-primary` 10 · `border-primary` 4
- **Examples:** `src/components/ui/button.tsx:11` default Button · `registry/blocks/onboarding.tsx:30` progress bar fill · `registry/blocks/notifications.tsx:36` unread dot · `registry/blocks/login-split-panel.tsx:12` the ink brand panel.
- **Conflicts:** (a) **Links.** DESIGN.md and foundations.mjs say links follow the accent. Shipped link styling is ink: the Button `link` variant (`button.tsx:20`), the Badge link (`badge.tsx:21`) and the "Sign in" link (`signup.tsx:39`) are all `text-primary` + underline. A bare `<a>` with no class does get the accent colour, from the theme's base layer. (b) **Eyebrow.** DESIGN.md's eyebrow recipe is `text-ink-muted` or the accent text cut; `feature-section.tsx:14` uses `text-primary`. Same file, line 25, and `pricing.tsx:39` colour icons with `text-primary`. In stock shadcn that class means "brand colour"; in Quill it renders ink.

### `primary-foreground` — 22 uses (blocks 11, primitives 11)
- **Resolves to:** paper.
- **Use for:** text and icons that sit on an ink (`primary`) fill.
- **Never for:** text on a paper surface. It is paper-coloured, so it disappears.
- **Pairs with:** `primary`.
- **Top forms:** `text-primary-foreground` 19 · `bg-primary-foreground` 2 · `bg-primary-foreground/10` 1
- **Examples:** `src/components/ui/button.tsx:11` default Button label · `registry/blocks/announcement-banner.tsx:27` text on the ink banner · `src/components/ui/radio-group.tsx:33` the dot inside a checked radio.

### `secondary` — 4 class uses (blocks 0, primitives 4); reached 11 more times through `variant="secondary"` in blocks
- **Resolves to:** paper-deep.
- **Use for:** the fill of the secondary button and the neutral badge. Reach it with `variant="secondary"`, not with a class.
- **Never for:** a second brand colour, or general wells and panels. Those are `muted`.
- **Pairs with:** `secondary-foreground`.
- **Top forms:** `bg-secondary` 3 · `bg-secondary/80` 1
- **Examples:** `src/components/ui/button.tsx:15` secondary Button · `src/components/ui/badge.tsx:14` secondary Badge · via the prop: `registry/blocks/kanban.tsx:18` column count badge, `registry/blocks/announcement-banner.tsx:33` "Save a seat" button.

### `secondary-foreground` — 3 uses (blocks 0, primitives 3)
- **Resolves to:** ink.
- **Use for:** the label on a secondary button or badge. It arrives with the variant.
- **Never for:** "secondary" (quieter) text. Quiet text is `muted-foreground`.
- **Pairs with:** `secondary`.
- **Top forms:** `text-secondary-foreground` 3
- **Examples:** `src/components/ui/button.tsx:15` · `src/components/ui/badge.tsx:14`.

### `muted` — 74 uses (blocks 20, primitives 54)
- **Resolves to:** paper-deep.
- **Use for:** quiet fills: icon wells, avatar fallbacks, skeletons, tab tracks, received chat bubbles; and the hover wash on buttons, toggles and table rows.
- **Never for:** text. `text-muted` is a paper tone and vanishes; quiet text is `muted-foreground`. (0 uses of `text-muted` in shipped code.)
- **Pairs with:** `muted-foreground` for icons and captions on it, `foreground` for content.
- **Top forms:** `bg-muted` 59 · `bg-muted/50` 13 · `fill-muted` 2
- **Examples:** `registry/blocks/empty-state.tsx:8` icon circle · `src/components/ui/skeleton.tsx:8` Skeleton · `src/components/ui/button.tsx:17` ghost Button hover · `registry/blocks/chat.tsx:30` received message bubble.
- **Conflicts:** one hover colour, two names. Buttons, toggles, table rows and `mail-shell.tsx:61` use `hover:bg-muted`; menu items, `navbar.tsx:16`, `list-detail.tsx:26` and `search-results.tsx:25` use `hover:bg-accent`. Both are paper-deep, so they look identical. Pick one rule per kind of element (suggested under `accent`).

### `muted-foreground` — 146 uses (blocks 94, primitives 52) — the most-used role
- **Resolves to:** ink-muted.
- **Use for:** supporting text: descriptions, captions, timestamps, helper text, placeholders, table meta; and icons at rest.
- **Never for:** headings, values, or the main label of a control; and never on an ink fill.
- **Pairs with:** sits on `background`, `card` and `muted`.
- **Top forms:** `text-muted-foreground` 145 · `fill-muted-foreground` 1
- **Examples:** `src/components/ui/card.tsx:54` CardDescription · `src/components/ui/input.tsx:13` placeholder text · `registry/blocks/data-table.tsx:58` email under a member's name · `registry/blocks/empty-state.tsx:13` empty-state explanation.

### `accent` — 24 uses (blocks 6, primitives 18)
- **Resolves to:** paper-deep — the pale highlight surface. **Not** the brand accent.
- **Use for:** the highlighted item: the menu or list row under the pointer or keyboard focus, and the current item in a nav.
- **Never for:** brand emphasis, CTAs or accent text. It is a pale paper tone; the brand accent is the accent pigment.
- **Pairs with:** `accent-foreground`.
- **Top forms:** `bg-accent` 24 (every one sits behind hover, focus, open or an "active" flag)
- **Examples:** `src/components/ui/dropdown-menu.tsx:92` focused menu item · `registry/blocks/dashboard.tsx:31` current and hovered nav item · `registry/blocks/list-detail.tsx:26` hovered / selected thread row.
- **Conflicts:** shares the hover job with `muted` (see `muted`). What the code does today, stated as a rule: **items in a list or menu highlight with `accent`; standalone controls (buttons, toggles) and table rows wash with `muted`**. `mail-shell.tsx:61` is the one list that breaks it.

### `accent-foreground` — 34 uses (blocks 3, primitives 31)
- **Resolves to:** ink.
- **Use for:** text and icons on a highlighted (`accent`) row.
- **Never for:** accent-coloured text. It is ink; coloured accent text is `--accent-pigment-text`.
- **Pairs with:** `accent`.
- **Top forms:** `text-accent-foreground` 34
- **Examples:** `src/components/ui/select.tsx:121` focused SelectItem · `registry/blocks/navbar.tsx:16` hovered nav link.

### `destructive` — 85 uses (blocks 0, primitives 85); blocks reach it through `variant="destructive"` (2 sites)
- **Resolves to:** terracotta-deep.
- **Use for:** errors and destructive actions: the invalid-field border and ring, field error text, the destructive button, badge, alert and menu item.
- **Never for:** a solid fill with white text. No `destructive-foreground` role exists; shipped buttons are a 10% tint with destructive text. Never a hover colour.
- **Pairs with:** itself — `bg-destructive/10` under `text-destructive`.
- **Top forms:** `ring-destructive/20` 16 · `ring-destructive/40` 16 (all behind `dark:`) · `text-destructive` 15 · `border-destructive` 15. There is no plain `bg-destructive` anywhere.
- **Examples:** `src/components/ui/button.tsx:19` destructive Button · `src/components/ui/input.tsx:13` `aria-invalid` border and ring · `src/components/ui/field.tsx:220` FieldError text · `registry/blocks/alerts.tsx:18` "Payment failed" alert (via the variant).
- **Conflicts:** `destructive` (a class) and `--danger` (a variable) are the same colour under two names. `stat-cards.tsx:14` puts the destructive badge on a rising "Open tickets" number — a bad trend, not an error or a destructive action.

### `border` — 46 uses (blocks 26, primitives 20)
- **Resolves to:** line-soft — ink at 12% in Dawn and Classic Dark, 11% in Dusk, Classic Light and Intelligent.
- **Use for:** hairlines: outlines of panels and lists, row rules, separators, timeline and step connectors (`bg-border` draws a 1px line), chart grid lines.
- **Never for:** the edge of a form control. At 12% it fails the 3:1 rule; controls use `input`.
- **Pairs with:** —
- **Top forms:** `border-border` 28 · `bg-border` 13 · `stroke-border` 3
- **Examples:** `src/components/ui/separator.tsx:18` Separator · `registry/blocks/data-table.tsx:40` table frame · `registry/blocks/activity-feed.tsx:53` timeline rule · `registry/blocks/wizard.tsx:40` connector between steps.
- **Note:** on the site a bare `border` class also draws in this colour (`src/app/globals.css:828`, `* { @apply border-border outline-ring/50 }`). The shipped theme file has no such rule; in an app it comes from shadcn's own starter CSS **(inferred — not checked in a consumer app)**.

### `input` — 43 uses (blocks 2, primitives 41)
- **Resolves to:** line-control — a solid mid-tone chosen to reach 3:1 against the page (WCAG 1.4.11, non-text contrast).
- **Use for:** the boundary of anything you type into or toggle (input, textarea, select, checkbox, radio, dropzone), and the empty track of a switch, slider or progress bar.
- **Never for:** decorative dividers or card outlines (too heavy — use `border`), and never text.
- **Pairs with:** `ring` for focus, `destructive` for invalid.
- **Top forms:** `border-input` 14 · `bg-input/30` 13 · `bg-input/50` 6
- **Examples:** `src/components/ui/input.tsx:13` Input border · `src/components/ui/switch.tsx:20` unchecked switch track · `registry/blocks/file-upload.tsx:31` dashed dropzone edge · `registry/blocks/onboarding.tsx:40` empty checklist circle.
- **Conflicts:** progress track colour. The Progress primitive uses `bg-input` (`progress.tsx:33`); `onboarding.tsx:28` hand-builds a progress bar on `bg-muted`. Also worth knowing: 20 of the 43 uses sit behind the `dark:` variant (the faint control fill on dark themes).

### `ring` — 62 uses (blocks 5, primitives 57)
- **Resolves to:** the accent pigment's text cut — moss-deep by default; follows `data-accent`.
- **Use for:** keyboard focus: a 3px ring at 50% plus a ring-coloured border, the same on every control. It is already built into the primitives.
- **Never for:** a hand-picked focus colour, or a decorative outline.
- **Pairs with:** —
- **Top forms:** `ring-ring/50` 22 · `border-ring` 21 · `ring-ring` 17
- **Examples:** `src/components/ui/button.tsx:7` Button focus · `src/components/ui/input.tsx:13` Input focus · `registry/blocks/mail-shell.tsx:61` focus outline on a message row.
- **Conflicts:** (a) `ring` is also a "chosen" outline with no focus involved: `pricing.tsx:24` featured plan (`ring-2 ring-ring`) and `checkout.tsx:35` selected payment method (`has-data-checked:border-ring`). The docs reserve the accent for the accent word, eyebrows, links and the focus ring. Decide whether "selected / featured" joins that list. (b) DESIGN.md §3 (lines 162 and 168) still says Dusk focus is a neutral cream `--focus-ring`; that variable exists in neither CSS file (0 matches), and §6 says focus is the accent.

### `chart-1` — 0 class uses; 1 variable read
- **Resolves to:** chart-series-1 — a deep terracotta-hue cut made only for data **(hue name inferred from the hex and the source comment)**.
- **Use for:** the first data series in a chart, passed as `var(--chart-1)` in the chart config.
- **Never for:** UI colour (badges, status, text, fills), and never swapped with another series.
- **Pairs with:** `chart-2`…`chart-5`, always in that order.
- **Example:** `registry/blocks/analytics-charts.tsx:28` the "Readers" area series.

### `chart-2` — 0 class uses; 1 variable read
- **Resolves to:** chart-series-2 — the indigo-hue data cut **(hue inferred)**.
- **Use for:** the second data series.
- **Never for:** links, info states or any UI; never the first series.
- **Pairs with:** the chart series, in order.
- **Example:** `registry/blocks/analytics-charts.tsx:29` the "Subscribers" area series.

### `chart-3` — 0 class uses; 1 variable read
- **Resolves to:** chart-series-3 — the gold-hue data cut **(hue inferred)**.
- **Use for:** the third data series.
- **Never for:** warnings, highlights or any UI.
- **Pairs with:** the chart series, in order.
- **Example:** `registry/blocks/analytics-charts.tsx:39` the "Print sales" bars.
- **Conflicts:** that bar chart has a single series, yet it takes `chart-3`, not `chart-1`. The source rule says "assign series colors in this fixed order"; it does not say whether each new chart restarts at 1. Worth one sentence in the final docs.

### `chart-4` — **0 uses in any form**
- **Resolves to:** chart-series-4 — a plum made only for charts; it has no UI pigment twin **(hue inferred)**.
- **Use for:** the fourth data series **(inferred — nothing ships with four series)**.
- **Never for:** any UI. Never skip to it to "get a purple".
- **Pairs with:** the chart series, in order.

### `chart-5` — **0 uses in any form**
- **Resolves to:** chart-series-5 — the moss-hue data cut **(hue inferred)**.
- **Use for:** the fifth data series **(inferred — nothing ships with five series)**.
- **Never for:** success states or any UI. Past five series, group the rest as "Other" rather than inventing a colour **(inferred)**.
- **Pairs with:** the chart series, in order.

> All five: the source comment in `src/tokens/quill.tokens.mjs` (under `chart`) says these are a lightness ramp as well as a hue wheel so they survive colour-blindness, and "never cycle or reorder survivors when a filter drops one". Raw pigments (`--moss`, `--terracotta`…) are too grey to work as data marks.

### `sidebar` — 6 uses (blocks 1, primitives 5)
- **Resolves to:** paper-warm (the same colour as `card`).
- **Use for:** the ground of the app's side navigation rail.
- **Never for:** any surface that is not the side navigation. Cards use `card`.
- **Pairs with:** `sidebar-foreground`.
- **Top forms:** `bg-sidebar` 6
- **Examples:** `src/components/ui/sidebar.tsx:173` Sidebar · `registry/blocks/dashboard.tsx:25` a hand-built `<aside>`.
- **Conflicts:** `dashboard.tsx:25-31` hand-builds its rail with `bg-sidebar` but then uses the general roles inside it (`border-border`, `bg-accent`, `text-muted-foreground`) instead of the `sidebar-*` family. Colours match except the edge: `border` is 12% ink, `sidebar-border` is 8%.

### `sidebar-foreground` — 8 uses (blocks 0, primitives 8)
- **Resolves to:** ink.
- **Use for:** default text and icons inside the sidebar; at 70% for group labels.
- **Never for:** text outside the sidebar.
- **Pairs with:** `sidebar`.
- **Top forms:** `text-sidebar-foreground` 7 · `text-sidebar-foreground/70` 1
- **Examples:** `src/components/ui/sidebar.tsx:173` Sidebar root · `src/components/ui/sidebar.tsx:405` SidebarGroupLabel (the 70% form).

### `sidebar-primary` — **0 uses in any form**
- **Resolves to:** ink.
- **Use for:** a solid ink element inside the sidebar, such as the workspace logo tile **(inferred — no shipped use)**.
- **Never for:** the current nav item. That is `sidebar-accent`.
- **Pairs with:** `sidebar-primary-foreground`.
- **Conflicts:** the one place that fits, the logo tile at `registry/blocks/sidebar-nav.tsx:50`, uses `bg-primary text-primary-foreground` instead. Same colours.

### `sidebar-primary-foreground` — **0 uses in any form**
- **Resolves to:** paper.
- **Use for:** text or an icon on a `sidebar-primary` fill **(inferred — no shipped use)**.
- **Never for:** text on the sidebar's own paper-warm ground; it disappears.
- **Pairs with:** `sidebar-primary`.

### `sidebar-accent` — 11 uses (blocks 0, primitives 11)
- **Resolves to:** paper-deep (the same colour as `accent`).
- **Use for:** the hovered, pressed and current item in the sidebar. It arrives with `SidebarMenuButton` and its `isActive` prop.
- **Never for:** brand emphasis. It is the pale highlight, as `accent` is.
- **Pairs with:** `sidebar-accent-foreground`.
- **Top forms:** `bg-sidebar-accent` 11 (all behind hover, active or open states)
- **Examples:** `src/components/ui/sidebar.tsx:480` SidebarMenuButton · `src/components/ui/sidebar.tsx:684` SidebarMenuSubButton.

### `sidebar-accent-foreground` — 16 uses (blocks 0, primitives 16)
- **Resolves to:** ink.
- **Use for:** text and icons on a highlighted sidebar item.
- **Never for:** accent-coloured text.
- **Pairs with:** `sidebar-accent`.
- **Top forms:** `text-sidebar-accent-foreground` 16
- **Examples:** `src/components/ui/sidebar.tsx:484` default menu button hover · `src/components/ui/sidebar.tsx:594` SidebarMenuBadge on a hovered item.

### `sidebar-border` — 4 class uses + 1 variable read (blocks 0, primitives 5)
- **Resolves to:** line-faint — ink at 8% in Dawn (7% on Dusk, Classic Light and Intelligent); lighter than `border`.
- **Use for:** dividers and sub-menu guide lines inside the sidebar, and the outline of a floating sidebar.
- **Never for:** lines outside the sidebar. Those are `border`.
- **Pairs with:** `sidebar`.
- **Top forms:** `bg-sidebar-border` 2 · `ring-sidebar-border` 1 · `border-sidebar-border` 1
- **Examples:** `src/components/ui/sidebar.tsx:363` SidebarSeparator · `src/components/ui/sidebar.tsx:646` SidebarMenuSub guide line · `src/components/ui/sidebar.tsx:486` outline menu button (`var(--sidebar-border)` in a shadow).

### `sidebar-ring` — 5 uses (blocks 0, primitives 5)
- **Resolves to:** the accent pigment's text cut (the same as `ring`).
- **Use for:** the keyboard focus ring on sidebar items. Built into the Sidebar parts.
- **Never for:** a hand-picked focus colour or a decorative outline.
- **Pairs with:** —
- **Top forms:** `ring-sidebar-ring` 5
- **Examples:** `src/components/ui/sidebar.tsx:480` SidebarMenuButton · `src/components/ui/sidebar.tsx:429` SidebarGroupAction.

---

## Quill roles kept (8)

None of these has a Tailwind class. Verified: the shipped theme exposes 50 `--color-*` keys to Tailwind and none is one of these eight. They exist only as plain CSS variables, defined five times each in `registry/themes/quill.css` (once per theme).

"Reads" below counts `var(--name)` — places that actually use the colour, not places that define it.

| Role | Shipped code (4 dirs) | `registry/themes/quill.css` | `src/app` | Anywhere else in repo |
|---|---|---|---|---|
| `text-accent-color` | 0 | 2 | 2 (`globals.css:854`, `:866`) | a story + a Figma README |
| `link` | 0 | 0 | 1 (`page.tsx:444`) | a story + a Figma README |
| `success` | 0 | 0 | 0 | none |
| `warning` | 0 | 0 | 0 | none |
| `danger` | 0 | 0 | 0 | none |
| `info` | 0 | 0 | 0 | none |
| `working` | 0 | 0 | 0 | none |
| `queued` | 0 | 0 | 0 | none |

### `text-accent-color` — 0 shipped uses; 2 reads in the shipped theme
- **Resolves to:** the accent pigment's text cut — moss-deep by default; follows `data-accent`.
- **Use for:** the one italic accent word in a headline, and default link colour. Both come free from the theme (`.fraunces-accent`, bare `<a>`).
- **Never for:** buttons, fills or body text. One accent word per headline, never two.
- **Pairs with:** paper surfaces (every accent cut clears 4.5:1 on them, per the theme comment).
- **Reads:** `registry/themes/quill.css:756` `a { color: … }` · `registry/themes/quill.css:761` `.fraunces-accent`.
- **Conflicts:** the one block that shows accent-coloured text skips this role and reads the primitive directly: `registry/blocks/stats-band.tsx:25`, `text-[var(--accent-pigment-text)]` on the big stat numerals. Numerals are not on the docs' list of accent uses (accent word, eyebrows, links, focus ring).

### `link` — 0 shipped uses; 0 reads in the shipped theme
- **Resolves to:** the accent pigment's text cut — identical to `text-accent-color`.
- **Use for:** the colour of a text link inside prose, when you must set it by hand **(inferred — nothing shipped does)**.
- **Never for:** buttons or navigation items. Nav links are `muted-foreground` with an `accent` highlight.
- **Pairs with:** paper surfaces.
- **Conflicts:** two names, one job. The theme colours bare links with `--text-accent-color`, not `--link`; and shipped link-styled elements are ink (`text-primary`, see `primary`). Its only reader is the marketing site (`src/app/page.tsx:444`).

### `success` — 0 reads anywhere
- **Resolves to:** moss-deep.
- **Use for:** text or an icon that confirms something worked **(inferred — no user)**.
- **Never for:** a fill behind text, or decoration. It is moss, which is also the default brand accent, so use it only when the meaning is "succeeded".
- **Pairs with:** paper surfaces.
- **Conflicts:** shipped status colour does not come from here. Status pills use ToneBadge with `tone="moss"` (`registry/lib/tone-badge.tsx:22`, `text-moss-deep` on `bg-moss/20`; used at `data-table.tsx:63`). The "Changes saved" alert (`alerts.tsx:13`) is the plain neutral Alert with no success colour at all.

### `warning` — 0 reads anywhere
- **Resolves to:** gold-text — the darker gold made for text, because gold-deep fails 4.5:1 on light themes.
- **Use for:** cautionary text or an icon **(inferred — no user)**.
- **Never for:** errors (that is `destructive`), and never swap in `--gold` or `--gold-deep` for text.
- **Pairs with:** paper surfaces.
- **Conflicts:** shipped caution is ToneBadge `tone="gold"` (`tone-badge.tsx:25`, `text-gold-text` on `bg-gold/25`; used for "Invited" at `data-table.tsx:23`).

### `danger` — 0 reads anywhere
- **Resolves to:** terracotta-deep — the same colour as `destructive`.
- **Use for:** nothing `destructive` does not already cover **(inferred)**. Prefer `text-destructive`; it has a class and 85 shipped uses.
- **Never for:** a hover colour, or "attention" that is not an error.
- **Pairs with:** paper surfaces.
- **Conflicts:** duplicate of `destructive`. An agent given both names has no reason to choose one. Either retire it or give it a distinct job.

### `info` — 0 reads anywhere
- **Resolves to:** indigo-deep.
- **Use for:** neutral, informational text or an icon **(inferred — no user)**.
- **Never for:** links. Links follow the accent, not indigo.
- **Pairs with:** paper surfaces.
- **Conflicts:** shipped "info" is ToneBadge `tone="indigo"` (`tone-badge.tsx:27`). The "Heads up" alert (`alerts.tsx:8`) is the neutral Alert with no info colour. DESIGN.md line 68 still describes indigo as "links, info".

### `working` — 0 reads anywhere
- **Resolves to:** teal-deep — teal's text-safe cut.
- **Use for:** "an agent is running right now" — live activity in agent dashboards **(inferred from the source comment — no user)**.
- **Never for:** success or info. Teal sits between moss and indigo so that live work reads as its own signal.
- **Pairs with:** paper surfaces; pairs in meaning with `queued`.
- **Conflicts:** nothing shipped can show it. ToneBadge has six tones and none is teal.

### `queued` — 0 reads anywhere
- **Resolves to:** ink-muted — the same colour as `muted-foreground`.
- **Use for:** "waiting its turn" in a run list. It should recede **(inferred from the source comment — no user)**.
- **Never for:** anything that needs attention. The source says it "recedes, never signals".
- **Pairs with:** `working`.
- **Conflicts:** same colour as `muted-foreground`, which has a class and 146 uses. ToneBadge `tone="muted"` already gives the receding pill.

---

## Tints (13)

A tint is one token at a fixed see-through strength — what `bg-destructive/10` means in Tailwind (an "opacity modifier": the `/10` after a colour class). Figma needs them as real variables because an opacity set on a paint is lost when a component is nested. Source: the `TINTS` table in `figma/sync-foundations.figma.js` (currently at line 362; base names were renamed `shadcn/…` → `semantic/…` while this was being measured).

| # | Figma tint | Token @ strength | Matching class in shipped code | Count | One example |
|---|---|---|---|---|---|
| 1 | `tint/destructive/10` | `destructive` @ 10% | `bg-destructive/10` | 5 | `src/components/ui/button.tsx:19` destructive Button fill |
| 2 | `tint/moss/20` | `moss` pigment @ 20% | `bg-moss/20` | 1 | `registry/lib/tone-badge.tsx:22` |
| 3 | `tint/gold/25` | `gold` pigment @ 25% | `bg-gold/25` | 1 | `registry/lib/tone-badge.tsx:25` |
| 4 | `tint/terracotta/16` | `terracotta` pigment @ 16% | `bg-terracotta/16` | 1 | `registry/lib/tone-badge.tsx:26` |
| 5 | `tint/indigo/20` | `indigo` pigment @ 20% | `bg-indigo/20` | 1 | `registry/lib/tone-badge.tsx:27` |
| 6 | `tint/foreground/10` | `foreground` @ 10% | `ring-foreground/10` | 17 | `src/components/ui/card.tsx:16` Card outline |
| 7 | `tint/input/30` | `input` @ 30% | `bg-input/30` 13 (11 behind `dark:`) + `border-input/30` 2 | 15 | `src/components/ui/command.tsx:76` command search field |
| 8 | `tint/chart-1/20` | `chart-1` @ 20% | **no class** — Recharts props `fill` + `fillOpacity={0.2}` | 1 | `registry/blocks/analytics-charts.tsx:63-64` "Readers" area fill |
| 9 | `tint/chart-2/20` | `chart-2` @ 20% | **no class** — same props | 1 | `registry/blocks/analytics-charts.tsx:71-72` "Subscribers" area fill |
| 10 | `tint/muted/50` | `muted` @ 50% | `bg-muted/50` | 13 | `src/components/ui/card.tsx:88` CardFooter |
| 11 | `tint/primary/10` | `primary` @ 10% | `bg-primary/10` | 2 | `registry/blocks/wizard.tsx:31` current-step circle |
| 12 | `tint/sidebar-border/8` | `sidebar-border` @ 8% | **none found** (`sidebar-border/8` = 0) | 0 | see note below |
| 13 | `tint/sidebar-foreground/70` | `sidebar-foreground` @ 70% | `text-sidebar-foreground/70` | 1 | `src/components/ui/sidebar.tsx:405` SidebarGroupLabel |

### Intent lines

**`tint/destructive/10`**
- **Resolves to:** terracotta-deep at 10%.
- **Use for:** the fill of the destructive button and badge, and the focused destructive menu item.
- **Never for:** a whole alert or panel. The destructive Alert stays on `card`; only its text turns terracotta.
- **Pairs with:** `text-destructive`. (Dark themes step up to 20% — `bg-destructive/20`, 7 uses — which has no tint variable.)

**`tint/moss/20`** · **`tint/gold/25`** · **`tint/terracotta/16`** · **`tint/indigo/20`**
- **Resolves to:** the base pigment at the stated strength.
- **Use for:** the wash behind a tinted ToneBadge, and nothing else: moss = positive / current, gold = caution, terracotta = attention, indigo = informational.
- **Never for:** hand-built pills or panels. Render every tag through ToneBadge (DESIGN.md calls a hand-rolled pill a contract violation).
- **Pairs with:** the pigment's text cut — `text-moss-deep`, `text-gold-text` (**not** gold-deep, it fails AA on the tint), `text-terracotta-deep`, `text-indigo-deep`.

**`tint/foreground/10`**
- **Resolves to:** ink at 10%.
- **Use for:** the hairline ring around a Card and around every floating panel (popover, menu, dialog, select, hover card).
- **Never for:** a fill or text; and not for dividers inside a surface — those are `border`.
- **Pairs with:** `card` or `popover` underneath.

**`tint/input/30`**
- **Resolves to:** line-control at 30%.
- **Use for:** the faint fill inside form controls on dark themes, and the fill and edge of the search field inside the command palette and combobox.
- **Never for:** the control's main edge on the page — that stays solid `input` to keep 3:1.
- **Pairs with:** `border-input`.

**`tint/chart-1/20`** · **`tint/chart-2/20`**
- **Resolves to:** the series colour at 20%.
- **Use for:** the soft area under a line in an area chart, under a full-strength stroke of the same series.
- **Never for:** UI tints (badges, highlights), and never a series other than the stroke's own.
- **Pairs with:** a 2px stroke in the same `chart-N`.

**`tint/muted/50`**
- **Resolves to:** paper-deep at 50%.
- **Use for:** a half-strength well: card, dialog and table footers, table-row hover, kanban columns, the "muted" Item.
- **Never for:** text, or anywhere the full `muted` fill is already the quiet option (icon wells, skeletons).
- **Pairs with:** `foreground` / `muted-foreground` content.

**`tint/primary/10`**
- **Resolves to:** ink at 10%.
- **Use for:** the "current, not yet done" state next to a solid-ink "done" state: the current wizard step, a checked choice card on dark themes.
- **Never for:** hover. Hover is `muted` / `accent`.
- **Pairs with:** `text-primary` and `ring-primary` (`wizard.tsx:31`).

**`tint/sidebar-border/8`**
- **Resolves to:** ink at 8%.
- **Use for:** the sidebar's faint dividers in Figma **(inferred)**.
- **Never for:** lines outside the sidebar.
- **Note:** no class with `/8` exists in shipped code. **(inferred)** The 8% is not an opacity modifier at all: `sidebar-border` points at line-faint, which already *is* ink at 8% in Dawn, so this tint equals the plain role (`bg-sidebar-border`, `sidebar.tsx:363`). Line-faint is 7% on Dusk, Classic Light and Intelligent, while the tint is fixed at 8% in every mode — a one-point drift in three themes. I read this from the token values; I did not open Figma.

**`tint/sidebar-foreground/70`**
- **Resolves to:** ink at 70%.
- **Use for:** the small group label above a set of sidebar links.
- **Never for:** sidebar link text itself — that is full-strength `sidebar-foreground`.
- **Pairs with:** `sidebar`.

### Opacity forms in shipped code that have NO tint variable
Reverse check, for completeness (contract roles only; all 27 opacity forms were enumerated, and the 7 that match a tint above are left out, leaving these 20):
`ring-ring/50` 22 · `ring-destructive/20` 16 · `ring-destructive/40` 16 (all `dark:`) · `border-destructive/50` 9 (all `dark:`) · `bg-destructive/20` 7 · `bg-input/50` 6 · `bg-input/80` 4 (all `dark:`) · `bg-primary/80` 2 · `bg-primary-foreground/10` 1 · `bg-secondary/80` 1 · `border-destructive/40` 1 · `bg-destructive/30` 1 · `stroke-border/50` 1 · `border-border/50` 1 · `border-primary/30` 1 · `bg-primary/5` 1 · `border-primary/20` 1 · `bg-background/20` 1 · `bg-background/10` 1 · `text-foreground/75` 1.
The focus ring (`ring-ring/50`) is the biggest one without a Figma twin.

---

## Evidence method

**What was scanned.** Four directories only, every file in them, no extension filter: `registry/blocks` (51), `registry/lib` (3), `registry/examples` (3), `src/components/ui` (1,066) = **1,123 files** (113 `.tsx`, 1 `.ts`, 1 `.mts`, 1,008 `.mjs`). 1,005 of the `.mjs` files are icon glyph data in `src/components/ui/icons/`; they were scanned and contain 0 hits. 94 files contain at least one role class (45 blocks, 2 examples, 47 primitives). Six blocks contain none, because they are built only from primitives: `alerts`, `analytics-charts`, `badge-on-card`, `forgot-password`, `login`, `tabs-page`.

**Tree state.** Commit `3ab9d75` on `feat/semantic-contract`, with 28 uncommitted files being edited during the measurement (including `src/tokens/quill.tokens.mjs`, `DESIGN.md`, `figma/sync-foundations.figma.js`, `registry/themes/quill.css` and one scanned file, `src/components/ui/test-card.tsx` — a comment-only change). The count was run twice, before and after those edits landed; the two hit sets are identical (842 hits).

**Step 1 — enumerate, then classify (the main count).**
Script: `/private/tmp/claude-501/-Users-ryanphillips-projects-quill-ds/e45790ac-c72a-4109-9e1d-246847ccf9bc/scratchpad/count-roles.mjs`
Run: `node count-roles.mjs "$PWD/hits.json"` from that folder. It:
1. splits every line into class-like words on `[\s"'`{}<>,;]+`;
2. strips variant prefixes (`hover:`, `dark:`, `data-[…]:`, `[&>svg]:`) by cutting at the last `:` that is not inside `[]` or `()`;
3. strips a leading or trailing `!` and a leading `-`, then splits off an opacity modifier at the first `/` outside brackets;
4. keeps the word only if what is left matches `^[a-z][a-z0-9-]*$`;
5. finds the **longest** role name the word ends with (`-<role>`), so `text-muted-foreground` is `muted-foreground`, never `muted` or `foreground`, and `bg-sidebar-accent-foreground` is never `accent`;
6. accepts it if the leftover prefix is a colour prefix: `bg text border border-{t,r,b,l,x,y,s,e} ring ring-offset inset-ring outline fill stroke from via to divide decoration shadow inset-shadow drop-shadow caret accent placeholder text-shadow`. Anything else goes to an "unclassified" list that is printed, not dropped.
Result: 842 hits; 0 on comment lines; prefixes actually seen: `text` 370, `bg` 264, `ring` 99, `border` 98, `fill` 4, `stroke` 4, `outline` 2, `ring-offset` 1. The 18 unclassified words were all read by hand and none is a role use: `add-card`, `hover-card`, `test-card`, `dashed-border`, `command-input`, `combobox-chip-input`, `sidebar-input`, `icon-sidebar`, `non-destructive`, `quill-accent`, `data-accent` ×3, `bg-ink-muted`, `text-ink-muted` ×4 (the last two are the ink-muted primitive, not the `muted` role).

**Step 2 — independent cross-check (different method, raw regex, no word splitting).** For each role `R`:
```
find registry/blocks registry/lib registry/examples src/components/ui -type f -print0 | xargs -0 perl -ne \
 'BEGIN{$n=0} while (/(?:^|[^A-Za-z0-9_-])(?:bg|text|border(?:-[trblxyse])?|ring(?:-offset)?|inset-ring|outline|fill|stroke|from|via|to|divide|decoration|shadow|inset-shadow|drop-shadow|caret|accent|placeholder)-R(?![A-Za-z0-9_-])/g) {$n++} END{print $n}'
```
The trailing `(?![A-Za-z0-9_-])` allows `/NN` but blocks a longer role (`bg-card` cannot match `bg-card-foreground`); the leading class blocks `-accent-foreground` from counting as `foreground`. **All 31 roles matched the Step 1 count exactly.**

**Step 3 — CSS-variable reads of contract roles** (for roles with no class, e.g. charts): regex `--(color-)?(<role>)(?![A-Za-z0-9_-])` over the same files → 12 hits: `--chart-1/2/3` (`analytics-charts.tsx:28,29,39`), `--secondary` + `--foreground` (`button.tsx:15`), `--color-border` ×2 (`chart.tsx:232,244`), `--sidebar-border` + `--sidebar-accent` (`sidebar.tsx:486`), `--popover`, `--popover-foreground`, `--border` (`sonner.tsx:34-36`). Zero-use roles were re-checked with a plain string search (`grep -rn -- "sidebar-primary"`, `"chart-4"`, `"chart-5"` → 0 each) plus a control that must hit (`"sidebar-accent"` → 8).

**Step 4 — the 8 Quill roles.** Any mention in shipped code: `perl -ne 'while (/--NAME(?![A-Za-z0-9_-])/g)'` over the four directories → 0 for all eight, with a control (`--chart-1` → 1) to prove the command finds things. Reads vs definitions elsewhere: `var\(\s*--NAME\s*[,)]` (a read) and `(?<![A-Za-z0-9_-])--NAME\s*:` (a definition) over `registry/themes/quill.css` and all 4 files of `src/app`. Repo-wide reads: `grep -rnE "var\(\s*--NAME\s*[,)]" . --exclude-dir={node_modules,.next,storybook-static,.git,coverage}`. Tailwind exposure: listed every `color-*` key in the base item's `cssVars.theme` in `registry.json` (50 keys) and checked none is one of the eight. (My first attempt at this step silently failed because zsh did not split a directory list; I re-ran it rather than report the blank as a zero.)

**Step 5 — tints.** Re-read the `TINTS` table from the live file, then matched each to opacity-modified forms in `hits.json`; pigment tints (not contract roles) were found by enumerating every mention of `moss|gold|terracotta|indigo|teal|accent-pigment|ink-*|paper-*|line-*` in shipped `.tsx`. Chart tints were found by `grep -rnE "fillOpacity|strokeOpacity"`.

**Step 6 — element descriptions.** Every cited `file:line` was opened and the surrounding JSX read; for primitives the enclosing component name was resolved from the nearest `function X` / `const X = cva` above the line.

**Docs read for intent and conflicts:** `src/tokens/quill.tokens.mjs` (live module loaded with `node --input-type=module` to print the three role groups), `src/usage/foundations.mjs`, `DESIGN.md` (re-read after it changed mid-session; §2's old "Semantic aliases" list, which called `--accent` terracotta and `--link` indigo, is already gone in the working tree), `PRODUCT.md`, `registry/themes/quill.css`, `registry.json`. Point-in-time measure of how many of the 31 roles each agent-facing file names: `registry/agent-rules/quill.md` 3, `public/llms.txt` 12, `DESIGN.md` 17.

**Not determined.**
- Whether `dark:` classes fire in a consumer app. The site defines the `dark` variant for `data-theme` (`src/app/globals.css:6`); the shipped theme file and the base registry item do not. 64 role uses sit behind `dark:` (`destructive` 31, `input` 20, `foreground` 4, `primary` 4, `muted` 2, and 1 each for `background`, `primary-foreground`, `muted-foreground`). I did not inspect a consumer app.
- Figma itself. Tint values and the `sidebar-border/8` reading come from the sync script and token values, not from the Figma file.
- Contrast of any pairing. No ratios were computed here; the ones quoted come from comments in the token source.
- Hue names for `chart-1…5` are read off the hex values and the source comment's list, not measured.
