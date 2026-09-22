// READ-ONLY Figma Plugin-API snippet for the type audit. Run through the Figma MCP
// `use_figma` (load the figma-use skill first), a handful of root ids per call —
// responses are capped near 20 KB — and write each root's result to
// <workdir>/figma/<kind>__<name>.json as { kind, name, id, code, ...result }.
//
// Two things this snippet knows that a first draft did not:
//  - a text search misses layers inside nested instances until an INSTANCE search
//    has walked them (351 of 1,077 layers were invisible without it);
//  - `page.loadAsync()` lets ONE script read roots that live on different pages.
const IDS = [/* root ids from <workdir>/roots.json */]
const styles = Object.fromEntries((await figma.getLocalTextStylesAsync()).map((s) => [s.id, s.name]))
const out = {}
const loaded = new Set()
for (const id of IDS) {
  let root = await figma.getNodeByIdAsync(id)
  if (!root) { out[id] = { error: 'not found' }; continue }
  let page = root; while (page && page.type !== 'PAGE') page = page.parent
  if (!loaded.has(page.id)) { await page.loadAsync(); loaded.add(page.id) }
  // a twin's id names one variant; audit the whole set
  if (root.type === 'COMPONENT' && root.parent && root.parent.type === 'COMPONENT_SET') root = root.parent
  let prev = -1, count = 0
  do { prev = count; count = root.findAllWithCriteria({ types: ['INSTANCE'] }).length } while (count !== prev)
  const texts = root.findAllWithCriteria({ types: ['TEXT'] })
  const seen = new Map()
  let hidden = 0, mixed = 0
  for (const t of texts) {
    let v = t, vis = true; while (v && v.id !== root.id) { if (v.visible === false) { vis = false; break } v = v.parent }
    if (!vis) { hidden++; continue }
    if ([t.fontName, t.fontSize, t.lineHeight, t.letterSpacing].some((x) => typeof x === 'symbol')) { mixed++; continue }
    const lh = t.lineHeight.unit === 'AUTO' ? 'auto' : Math.round(t.lineHeight.value * 100) / 100 + (t.lineHeight.unit === 'PERCENT' ? '%' : 'px')
    const ls = Math.round(t.letterSpacing.value * 100) / 100 + (t.letterSpacing.unit === 'PERCENT' ? '%' : 'px')
    // fontWeight reads the variation axis: Fraunces at wght 500 is still style "Regular"
    const row = { chars: t.characters.replace(/\s+/g, ' ').slice(0, 60), font: t.fontName.family + '/' + t.fontName.style, weight: t.fontWeight, size: Math.round(t.fontSize * 100) / 100, lh, ls, textCase: t.textCase, style: styles[t.textStyleId] || '', inInstance: t.id.includes(';') }
    const key = JSON.stringify(row)
    if (!seen.has(key)) seen.set(key, { ...row, n: 0, id: t.id })
    seen.get(key).n++
  }
  out[id] = { rootId: root.id, figmaName: root.name, type: root.type, page: page.name, texts: texts.length, hidden, mixed, rows: [...seen.values()] }
}
return out
