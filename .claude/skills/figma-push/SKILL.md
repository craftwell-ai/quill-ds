---
name: figma-push
description: Push a code component's current state onto its Figma twin — upsert bindings, styles, and text on the existing node, never recreate it. Doubles as parity repair for bindings dropped by hand-editing. Usage — /figma-push <component name or Figma node id>.
---

# /figma-push — code → Figma component sync

Update the Figma twin to match code. **Code is the ultimate source of truth**;
the push is a mirror refresh, and it doubles as parity repair (re-asserting
variable bindings that Figma-side hand-editing dropped). Full rationale:
`figma/README.md` § "Component sync — pull & push".

File key: `Dcf8lEB7Ash71iNl7WN4Jq` (Quill Design System).

## Steps

1. **Code first.** If the user asked for a change, edit the source file and
   verify in Storybook *before* touching Figma. If code already changed, read
   the current classes — they are the spec.

2. **Load the `figma:figma-use` skill** (mandatory before any `use_figma` call).

3. **Resolve the pair** — same lookup as `/figma-pull` (node-id table in
   `figma/components/README.md`; fixture `❖ Test` = node `371:7` ↔
   `src/components/ui/test-card.tsx`).

4. **Resolve variables/styles by NAME, live** — `getLocalVariablesAsync()` /
   `getLocalTextStylesAsync()` / `getLocalEffectStylesAsync()`, matched by name
   (`corner-radius/2xl`, `Elevation/lg`). Never trust remembered IDs beyond the
   fixture's. Class → variable mapping is the `/figma-pull` table, reversed.

5. **Upsert the existing node in place — NEVER recreate it.** Recreating breaks
   node identity and orphans every instance. One `use_figma` script
   (`setCurrentPageAsync` to its page first):
   - radii/padding/gap/strokeWeight: `node.setBoundVariable(prop, variable)`
   - fills/strokes: `figma.variables.setBoundVariableForPaint(paint, 'color', v)`
     — returns a NEW paint; reassign the whole array
   - elevation: `await node.setEffectStyleIdAsync(styleId)`
   - text: canonical recipe — `await figma.loadFontAsync(textNode.fontName)`
     *then* set `characters` (works on text inside instances too)
   - variant changes on INSTANCE children: `instance.setProperties({...})`
   - update the component `description` so its binding map stays current
   - finish with `await node.screenshot()` and return all mutated node IDs

6. **Verify** the returned screenshot against the Storybook render. Report any
   property that has no Figma representation (motion, variable-font axes,
   responsive behavior — see `figma/README.md` "Not representable in Figma").

7. **Update the parity baseline** — rewrite this component's entry in
   `figma/sync-state.json` (bindings, raws, texts, childSignature, code.classes,
   lastSynced) so the scheduled `figma-parity` drift job measures from the new
   agreed state. New variables encountered go into the `variables` id→name map.

## Gotchas proven in practice

- `setBoundVariableForPaint` returns a new paint object — capture and reassign,
  mutating in place silently does nothing.
- Fonts must be loaded before ANY text mutation, including inside instances
  (`Cannot write to node with unloaded font` otherwise).
- Structural code changes (new children, removed children) still upsert: add or
  remove ONLY the affected children inside the existing component frame; for new
  buttons/badges etc., place **instances** of the ❖ library components, fully
  token-bound, per the build pattern in `figma/components/README.md`.
- New wrapper frames ship with a default white fill — clear `fills = []` unless
  a fill is intended.
- **Stroke weight binds per-side.** A node with per-side weights has NO
  `boundVariables.strokeWeight` — it has `strokeTopWeight`/`Bottom`/`Left`/`Right`.
  Reading only the uniform key reports a false "dropped binding" and tempts a
  pointless repair; `setBoundVariable('strokeWeight', v)` is then a silent no-op.
  Always check the per-side keys before concluding a binding was lost.
