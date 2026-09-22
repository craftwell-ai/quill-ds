// Figma Plugin-API snippet: apply Fraunces axis values from <workdir>/axes-plan.json.
// Run through the Figma MCP `use_figma` (load the figma-use skill first). Fill the two
// constants from the plan: STYLE_MOVES = { '<text style name>': { SOFT, WONK } } for styles
// that move as a whole; LAYER_EDITS = [{ ids: ['1:2', …], want: { SOFT, WONK } }] for
// layers that take their own values. Keep a call to ~40 layers; responses cap near 20 KB.
//
// A text style's fontName carries variationSettings like a node's does; setting a node's
// fontName on a styled layer detaches that property from the style, which is intended for
// LAYER_EDITS (the plan only puts a layer there when its style cannot carry the value).
const STYLE_MOVES = {/* from axes-plan.json → styles (non-split) */}
const LAYER_EDITS = [/* from axes-plan.json → layerEdits */]

const axesOf = (family) => figma.getFontFamilyVariationAxes(family)
const merged = (fontName, want) => ({ family: fontName.family, style: fontName.style, variationSettings: { ...(fontName.variationSettings || {}), ...want } })
const read = (fontName) => { const v = fontName.variationSettings || {}; return { SOFT: v.SOFT, WONK: v.WONK, wght: v.wght } }

const out = { styles: {}, layers: [], skipped: [], mutatedNodeIds: [], mutatedStyleIds: [] }
const fraunces = axesOf('Fraunces')
if (!fraunces || !fraunces.includes('SOFT') || !fraunces.includes('WONK')) throw new Error('Fraunces in this file exposes axes ' + JSON.stringify(fraunces) + ' — SOFT/WONK missing')

// 1. Styles
const styles = await figma.getLocalTextStylesAsync()
for (const [name, want] of Object.entries(STYLE_MOVES)) {
  const s = styles.find((x) => x.name === name)
  if (!s) { out.skipped.push({ style: name, reason: 'no such style' }); continue }
  if (s.fontName.family !== 'Fraunces') { out.skipped.push({ style: name, reason: 'not Fraunces: ' + s.fontName.family }); continue }
  await figma.loadFontAsync({ family: s.fontName.family, style: s.fontName.style })
  const before = read(s.fontName)
  s.fontName = merged(s.fontName, want)
  out.styles[name] = { before, after: read(s.fontName) }
  out.mutatedStyleIds.push(s.id)
}

// 2. Layers (pages load on demand; a layer's page must be loaded before it is touched)
const loadedPages = new Set()
for (const edit of LAYER_EDITS) {
  for (const id of edit.ids) {
    const n = await figma.getNodeByIdAsync(id)
    if (!n || n.type !== 'TEXT') { out.skipped.push({ id, reason: n ? 'not TEXT: ' + n.type : 'not found' }); continue }
    let page = n; while (page && page.type !== 'PAGE') page = page.parent
    if (page && !loadedPages.has(page.id)) { await page.loadAsync(); loadedPages.add(page.id) }
    if (typeof n.fontName === 'symbol') { out.skipped.push({ id, reason: 'mixed fonts' }); continue }
    if (n.fontName.family !== 'Fraunces') { out.skipped.push({ id, reason: 'not Fraunces: ' + n.fontName.family }); continue }
    await figma.loadFontAsync({ family: n.fontName.family, style: n.fontName.style })
    const before = read(n.fontName)
    n.fontName = merged(n.fontName, edit.want)
    out.layers.push({ id, chars: n.characters.slice(0, 24), before, after: read(n.fontName) })
    out.mutatedNodeIds.push(id)
  }
}
return out
