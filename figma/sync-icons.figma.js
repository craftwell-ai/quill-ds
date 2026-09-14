// Re-runnable Figma Plugin-API sync for Quill icons (Material Symbols Outlined 400).
//
// Executed via the Figma MCP `use_figma` on file Dcf8lEB7Ash71iNl7WN4Jq with an
// `ICONS` object in scope — the `icons` export of src/components/ui/icons.core.mjs
// (the sync core written by `npm run build:icons`; the gitignored
// icons.all.generated.mjs holds the whole library in the same shape), i.e.
// { name: { viewBox, paths } }. Idempotent: clears the prior gallery + icon/*
// components and rebuilds, so a re-run creates no duplicates.
//
// Source of truth is code (scripts/build-icons.mjs → icons.core.mjs). Do not
// edit icon geometry here. See figma/README.md, "Re-run the icon sync".
//
// Design rules honored:
//   - fill-rule="evenodd" on every path — required so hollow-ring icons (info, help,
//     check_circle, credit_card, folder_open, dashboard, description, dangerous)
//     render as outlines, not filled discs. Setting windingRule after import does NOT
//     re-tessellate; it must be in the SVG at createNodeFromSvg time.
//   - NO hardcoded colors. Each icon's vector fill is bound to the `text/strong`
//     color variable; the gallery background to `surface/page`. Everything = tokens.
//   - Icons live on their own "Icons" page (Foundations / Icons / Components / Patterns).

async function syncIcons(ICONS) {
  // --- resolve token variables (no hardcoded colors) ---
  const vars = await figma.variables.getLocalVariablesAsync()
  const byName = Object.fromEntries(vars.map((v) => [v.name, v]))
  const iconColor = byName['text/strong'] || byName['shadcn/foreground'] || byName['color/ink/base']
  const bgColor = byName['surface/page'] || byName['shadcn/background'] || byName['color/paper/base']
  if (!iconColor) throw new Error('icon color variable not found — run the foundations sync first')

  // --- ensure the Icons page ---
  let iconsPage = figma.root.children.find((p) => p.name === 'Icons')
  if (!iconsPage) { iconsPage = figma.createPage(); iconsPage.name = 'Icons' }
  await figma.setCurrentPageAsync(iconsPage)

  // --- idempotent: clear prior gallery + icon components ---
  iconsPage.findAll((n) => n.type === 'COMPONENT' && n.name.startsWith('icon/')).forEach((c) => c.remove())
  const oldG = iconsPage.findOne((n) => n.type === 'FRAME' && n.name === 'Quill Icons')
  if (oldG) oldG.remove()

  // --- wrapping gallery container ---
  const gallery = figma.createAutoLayout('HORIZONTAL', { name: 'Quill Icons', itemSpacing: 20, counterAxisSpacing: 20 })
  gallery.layoutWrap = 'WRAP'
  gallery.paddingTop = gallery.paddingBottom = gallery.paddingLeft = gallery.paddingRight = 28
  gallery.cornerRadius = 12
  gallery.x = 0
  gallery.y = 0
  gallery.primaryAxisSizingMode = 'FIXED'
  gallery.counterAxisSizingMode = 'AUTO'
  gallery.resize(396, 200)

  // --- build each icon/* component ---
  const created = []
  for (const [name, def] of Object.entries(ICONS)) {
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${def.viewBox}">` +
      def.paths.map((d) => `<path fill-rule="evenodd" d="${d}"/>`).join('') +
      `</svg>`
    const frame = figma.createNodeFromSvg(svg)
    if (frame.width && Math.abs(frame.width - 24) > 0.5) frame.rescale(24 / frame.width)
    // bind vector fill to the token (not a literal color)
    frame.findAll((n) => n.type === 'VECTOR' && 'fills' in n).forEach((v) => {
      const paint = (v.fills && v.fills[0]) || { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }
      v.fills = [figma.variables.setBoundVariableForPaint(paint, 'color', iconColor)]
    })
    const comp = figma.createComponentFromNode(frame)
    comp.name = 'icon/' + name
    gallery.appendChild(comp)
    comp.layoutSizingHorizontal = 'FIXED'
    comp.layoutSizingVertical = 'FIXED'
    comp.resize(24, 24)
    created.push(comp.name)
  }

  // gallery background = token
  if (bgColor) {
    const p = (gallery.fills && gallery.fills[0]) || { type: 'SOLID', color: { r: 1, g: 1, b: 1 } }
    gallery.fills = [figma.variables.setBoundVariableForPaint(p, 'color', bgColor)]
  }

  return { page: iconsPage.name, created: created.length, iconColorVar: iconColor.name, galleryBgVar: bgColor && bgColor.name }
}

return await syncIcons(ICONS)
