# Components — Wave A (Core Atoms) Design Spec

**Date:** 2026-07-02
**Phase:** Phase 2 (Components), Wave A. Foundations + Icons are complete and merged.
**Relation:** Consumes the Figma foundation (variables, text styles, effect styles) and `icon/*` components. Establishes the reusable component-build pipeline reused by Waves B/C.

## Goal

Build **Figma components for the Wave A core atoms**, each a faithful 1:1 of its React counterpart, fully token-bound, on its own page, and linked back to code via Code Connect.

## Wave A component set (~15)

Button, Badge, Input, Textarea, Checkbox, Switch, Radio (RadioGroup item), Label, Avatar, Kbd, Spinner, Separator, Skeleton, Progress, Toggle.

These are the highest-use atoms with the cleanest variant structure; building them proves the pipeline (variant sets, token binding, icon slots, Code Connect) for the harder waves.

## Locked decisions (from the project's directives)

1. **Variant structure = Option A.** Model the design-meaningful axes as Figma **variant properties** (`Variant`, `Size`) mirroring each component's `cva`. Handle the rest with **component properties**: a `Disabled` boolean, text properties for labels, and instance-swap/boolean for icons. **No** hover/focus as separate static variants (those are for interactive components / code). The variant set is structured so a `State` axis can be added later without restructuring.
2. **Per-component page.** Each component gets its own Figma page named **`❖ <Name>`** (e.g. `❖ Button`). Icons/Foundations pages stay unprefixed.
3. **No hardcoded values.** Every fill, stroke, corner-radius, spacing/gap/padding, and text style binds to a **variable or style** (`setBoundVariableForPaint`, bound FLOAT vars for radius/spacing, applied text styles). Zero literal colors/sizes.
4. **Icons via instance-swap** to the `icon/*` components (Material Symbols Outlined 200), never redrawn.
5. **1:1 with code.** Variant/size options, names, and visual result match the code (pull exact values from each component's `cva`). Behavioral parity is out of scope (Figma is static); Code Connect provides the enforced code link.
6. **Storybook side already exists** — the 55 component stories are the code source of truth under `Components /*`. This phase builds their **Figma** twins; it does not rewrite the React components.

## Worked example — Button (the pipeline template)

Button's `cva` (source of truth — `src/components/ui/button.tsx`):
- **Variant** (6): `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`
- **Size** (8): `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`
- Component properties: `Label` (text), `Leading icon` (boolean + instance-swap → `icon/*`), `Trailing icon` (boolean + instance-swap), `Disabled` (boolean → applies 50% opacity, matching `disabled:opacity-50`).

Build steps per component (via `use_figma`, following figma-generate-library):
1. Create the `❖ Button` page.
2. Build one base component frame with **auto-layout** (height/padding/gap bound to spacing vars; `corner-radius` bound to the radius var; fills/text bound to the shadcn/semantic vars per variant — e.g. `default` → `primary` bg + `primary-foreground` text; `destructive` → `destructive`; `outline` → `border` stroke + transparent bg; `link` → `primary` text underline). Text uses the appropriate text style.
3. Duplicate + adjust per Variant×Size combination; set variant properties; `figma.combineAsVariants` into a component set named `Button`.
4. Add the boolean/text/instance-swap component properties.
5. Screenshot-verify against the Storybook render for visual parity.
6. Code Connect: map the Figma component set → `Button` (`src/components/ui/button.tsx`) with prop mappings (Variant→variant, Size→size, Disabled→disabled).

The cartesian Button set (6×8 = 48) is large; where a size only differs by padding/icon-size (not layout), generate all combinations but keep them token-bound so they stay maintainable. Simpler atoms (Badge 4×1, Switch, Checkbox, Separator, Skeleton) are far smaller.

## Token-binding rules (per property)

| Property | Bound to |
|---|---|
| Background / text / border fills | `shadcn/*` or `text|surface|border/*` semantic variables |
| Corner radius | `corner-radius/*` FLOAT variable |
| Padding / gap / height | `spacing/*` FLOAT variables |
| Border width | `border-width/*` FLOAT variable |
| Type (family/size/line-height) | the matching **text style** (Body/*, etc.) |
| Elevation (where used) | the `Elevation/*` effect style |
| Icons | instance of `icon/*` |
| Disabled state | opacity 0.5 (matches `disabled:opacity-50`) |

## Verification

- **Per component:** screenshot the Figma variant set and compare to the Storybook story; confirm variant/size names match the `cva`; confirm (read-back) that fills/radii/spacing resolve to **bound variables**, not literals; flip a frame to Dark mode and confirm it adapts.
- **Code Connect:** `get_code_connect_map` shows each Wave A component mapped.
- **Idempotency:** re-running a component's build upserts by name (page + component set) without duplicates.
- No regression to the code/Storybook side (`test-storybook` stays 230/230 — this phase mostly adds Figma + a Code Connect config, minimal code change).

## Architecture / artifacts

| Artifact | Responsibility |
|---|---|
| `figma/components/<name>.figma.js` | re-runnable `use_figma` builder per component (upsert page + component set, bind tokens) |
| `figma/components/README.md` | run order, file key, Code Connect steps, built inventory |
| Figma: `❖ <Name>` pages + component sets | the deliverable |
| Code Connect config (per component) | the enforced Figma↔code link |

## Risks

- **Combinatorial size** (Button 48, Toggle, etc.) — mitigated by scripted generation + token binding; simpler atoms dominate the set.
- **use_figma payload limits** — one component set per call, split large sets across calls (upsert by name so it's resumable).
- **Code Connect** requires the Figma components to exist first + repo access; done after each component builds.
- **Figma static limits** — no true interactivity; documented, Code Connect bridges to real code.

## Out of scope (later waves)

Wave B (composites: Card, Alert, Tabs, Tooltip, Select, Field, Input/Button groups, Breadcrumb, Pagination, Accordion) and Wave C (complex overlays/compounds). Patterns phase is separate.

## Next

writing-plans → per-component tasks (Button first as the pipeline proof), executed via subagent-driven-development where the build is scriptable; the interactive Figma calls run inline.
