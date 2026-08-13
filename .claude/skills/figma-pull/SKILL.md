---
name: figma-pull
description: Pull a component's design edits from the Quill Figma file into its code twin — read the node, diff token bindings against the source, apply surgical edits, verify in Storybook. Usage — /figma-pull <component name or Figma node id>.
---

# /figma-pull — Figma → code component sync

Land a designer's Figma edits in the codebase. **Code is the ultimate source of
truth**: the pull produces a reviewable code change (branch → PR → CI), never a
silent overwrite. Full rationale: `figma/README.md` § "Component sync — pull & push".

File key: `Dcf8lEB7Ash71iNl7WN4Jq` (Quill Design System).

## Steps

1. **Load the `figma:figma-use` skill first** (mandatory before any `use_figma` call).

2. **Resolve the pair.** The argument is a component name or node id.
   - Node-id table (Figma component ↔ code source): `figma/components/README.md`,
     "Code Connect mapping" section.
   - Sync fixture: `❖ Test` node `371:7` ↔ `src/components/ui/test-card.tsx`.
   - Unknown name → find the `❖ <Name>` page and its COMPONENT/COMPONENT_SET node.

3. **Read the node** (read-only `use_figma`; switch to its page with
   `setCurrentPageAsync` first). For the component and every child capture:
   - fills/strokes: `paint.boundVariables?.color?.id` → resolve to the **variable
     name** via `getVariableByIdAsync`, plus the raw value as fallback
   - `node.boundVariables` for: strokeWeight, per-corner radii, per-side padding,
     itemSpacing — variable name + current raw value
   - `effectStyleId` / `textStyleId` → style names; text `characters`
   - child structure, and for INSTANCE children the main component + variant props
   - finish with `await node.screenshot()` for the visual reference

4. **Translate bindings → code**, editing the existing source file surgically
   (never regenerate the file):

   | Figma | Code |
   |---|---|
   | fill/stroke → `shadcn/<x>` | `bg-<x>` / `border-<x>` / `text-<x>` |
   | `corner-radius/<s>` | `rounded-<s>` |
   | `spacing/<n>` (padding/gap) | `p-<n>` / `gap-<n>` (`spacing/2_5` → `p-2.5`) |
   | `border-width/1` | `border` (2 → `border-2`) |
   | `Elevation/<s>` effect style | `shadow-<s>` (`base` → `shadow`) |
   | `color/pigment/<name>[/deep]` | `[var(--<name>[-deep])]` arbitrary value |
   | text style `Heading/* Body/* Label/*` | nearest type classes (see DESIGN.md ramp) |

   - **Unbound raw values**: match to the nearest token (12px gap → `gap-3`);
     if nothing matches, flag it to the user instead of hardcoding.
   - **Component INSTANCES** (❖ Button, ❖ Badge, …) map to the real code
     component with the matching variant/size props — never hand-rolled markup.
   - **Out of scope by design** (fill with code-side judgment, don't block):
     behavior, responsive rules, a11y semantics, edge cases.

5. **Verify**: Storybook (`npm run storybook`, port 6006) side-by-side with the
   step-3 screenshot. Iterate until they match.

6. **Update the parity baseline** — rewrite this component's entry in
   `figma/sync-state.json` (bindings, raws, texts, childSignature, code.classes,
   lastSynced) so the scheduled `figma-parity` drift job measures from the new
   agreed state. New variables encountered go into the `variables` id→name map.

7. **Ship** per repo convention: branch → version bump + CHANGELOG →
   `npm run build:llms` (llms.txt embeds the version) → PR → CI green → merge.
   Skip only if the user asked for local-only.

## Gotchas proven in practice

- The build-log READMEs drift — trust the live file (`variantGroupProperties`,
  actual bindings), not the docs.
- A designer hand-editing in Figma often *drops* variable bindings without
  changing the value (boundTo null, raw value unchanged) — that's parity noise,
  not a design change; don't translate it, and let the next `/figma-push`
  re-assert the binding.
- The `Sandbox / Test` story is exempt from usage-doc coverage
  (`SANDBOX_FIXTURES` in `scripts/usage-coverage.test.mjs`); real components
  are not — a pull that creates a new component must ship a usage file.
