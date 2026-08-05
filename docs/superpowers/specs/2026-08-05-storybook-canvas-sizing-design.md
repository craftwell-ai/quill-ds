# Storybook Canvas Sizing — Design

**Date:** 2026-08-05
**Status:** Approved (brainstorm with Ryan, 2026-08-05)

## Purpose

Every Storybook story canvas (the preview box around a rendered component, both on
autodocs pages and the standalone Canvas/story view) is forced to a minimum height
of a full viewport, regardless of how small the actual component is. A tiny Select
trigger sits in a box hundreds of pixels taller than it needs, with a small top
margin and a huge, effectively unbounded bottom margin. Ryan asked for containers
that hug their content with equal top/bottom margin — and, for components that
reveal a dropdown/popup (Select, Combobox, etc.), for that margin to stay equal
even once the popup is open, rather than the popup visually overlapping whatever
comes after it on the page.

## Root cause (verified 2026-08-04/05)

`.storybook/preview.tsx`'s `withTheme` decorator wraps every story in a `<div>`
with `padding: 24` and an unconditional `minHeight: '100vh'`. That `minHeight` is
what forces every story — including a single Button — into a near-full-screen box.
The `padding: 24` itself is already equal on all sides; the *visible* asymmetry
comes from real content sitting near the top of that oversized box while the rest
is empty space down to the 100vh floor.

Separately, dropdown-style overlays (Select, Combobox, DropdownMenu, Popover,
HoverCard, Tooltip, Command, Menubar, NavigationMenu, ContextMenu) all render
through the same Base UI portal mechanism: a `[data-base-ui-portal]` element
appended as a direct sibling of the story root under `<body>`, positioned with
`position: fixed`, entirely outside our wrapper's box. Confirmed live for Select:
opening it renders a `[role="listbox"]` inside `[data-base-ui-portal] > div[data-open]`,
positioned in viewport coordinates, unaffected by the wrapper's height. Shrinking
the wrapper to closed-state content does not clip this popup — but with nothing
reserving space for it, the open popup will visually overlap whatever content sits
below the (now much shorter) wrapper on the page.

## Design

### 1. Conditional height — drop `minHeight: 100vh` except for full-page patterns

10 of the 105 stories are deliberate full-page mockups already using
`layout: 'fullscreen'`: `sidebar`, `patterns/SidebarNav`, `patterns/Navbar`,
`patterns/MailShell`, `patterns/LoginVariants`, `patterns/Hero`,
`patterns/Error404`, `patterns/ListDetail`, `patterns/DashboardShell`,
`patterns/Footer`. These should keep filling the viewport — that's the correct
look for a full-page mockup.

In `withTheme`, read `context.parameters.layout`. When it is `'fullscreen'`, keep
today's `minHeight: '100vh'`. For the other 95 stories (`'centered'` and
`'padded'`), drop `minHeight` entirely — the wrapper hugs its content, with the
existing `padding: 24` (unchanged) providing equal top/bottom margin by
construction. This alone satisfies "much smaller" and "equal margin" for every
story with no dropdown.

### 2. Reserved space for open overlays

New file `.storybook/use-overlay-space.ts`, one exported hook:
`useOverlaySpace(wrapperRef: RefObject<HTMLElement>, basePadding: number)`.

- On mount, creates a `MutationObserver` on `document.body` with
  `{ childList: true, attributes: true, attributeFilter: ['data-open'], subtree: true }`.
- On each mutation, schedules a measurement on the next `requestAnimationFrame`
  (so Base UI's Floating-UI positioning has settled).
- The measurement: query `[data-base-ui-portal] [data-open]`, and for every match,
  read `getBoundingClientRect().bottom`. Take the maximum across all currently-open
  portals (handles nested menus / multiple simultaneous overlays).
- If that maximum exceeds `wrapper.getBoundingClientRect().bottom - basePadding`,
  set the wrapper's `paddingBottom` so the wrapper's bottom edge lands exactly
  `basePadding` px below the lowest open popup. Otherwise reset `paddingBottom` to
  `basePadding`.
- Disconnects the observer on unmount.

`withTheme` calls this hook unconditionally (it's a no-op — no open portals found —
on stories with nothing to observe, so it's safe to call for every story,
`fullscreen` included).

### 3. Why this approach over the alternatives considered

- **Fixed per-component padding guess** (rejected by Ryan during brainstorming):
  simpler, but a guess — a long option list could still overflow a hand-picked
  number, and every new dropdown-style component needs someone to remember to add
  one.
- **Generic `document.body.scrollHeight` growth-watching** (considered, not
  chosen): doesn't depend on Base UI internals at all, but translating "body got
  N px taller" into "wrapper needs N px more bottom padding" is a fuzzy
  approximation — it doesn't tell you *where* the growth happened. Reading the
  portal's own bounding rect directly (the chosen approach) is precise and no
  harder to implement.

## Edge cases

- **Multiple open overlays** (e.g. a Menubar with an open submenu): max-across-all
  logic handles this without special-casing.
- **Long option lists**: Base UI already caps popup height to the visible
  viewport via CSS (`max-h-(--available-height)`), so reserved space is always
  bounded — never unbounded growth.
- **Hover-triggered overlays** (Tooltip, HoverCard): assumed to use the same
  portal convention as Select; verify during implementation since only Select has
  been directly confirmed.
- **No open portals found**: the hook is a no-op and leaves padding at
  `basePadding` — never throws.

## Testing

- **Automated**: add a `play` function to Select's `Default` story (and one more
  overlay component, e.g. `DropdownMenu`, as a second data point), using the
  existing `within`/`userEvent`/`screen`/`expect` pattern already used elsewhere
  in this codebase (e.g. `combobox.stories.tsx`). The play function opens the
  overlay, reads the wrapper's and the popup's `getBoundingClientRect()`, and
  asserts the wrapper grew enough that its bottom edge is at least `basePadding`
  px below the popup's bottom edge. This runs for real in the existing
  `test-storybook` Playwright suite — no new test infrastructure needed.
- **Manual**: before/after screenshots across a representative sample — a small
  `centered` story (Button), a wider `padded` story (Table), and one `fullscreen`
  pattern (Dashboard shell) to confirm it's untouched.

## Out of scope

- Any change to the 10 `fullscreen` pattern stories' own sizing.
- Any change to individual component/pattern story files beyond the 1-2 that gain
  a new `play` function for testing.
- The unrelated Calendar dark-mode background-color bug (tracked separately).

## Success criteria

- The 95 non-fullscreen stories render with no forced minimum height; visible
  top and bottom margin around the closed-state component are equal.
- Opening any dropdown-style overlay grows the reserved space so the same equal
  margin holds with the overlay open, and nothing below the story is visually
  covered.
- The 10 `fullscreen` pattern stories are pixel-identical to their current
  behavior.
