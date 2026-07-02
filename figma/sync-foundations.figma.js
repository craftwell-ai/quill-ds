// Re-runnable Figma Plugin-API upsert for Quill foundations.
//
// Executed via the Figma MCP `use_figma` on file Dcf8lEB7Ash71iNl7WN4Jq, with a
// `DTCG` object in scope (the contents of tokens/quill.figma.json). Idempotent:
// every collection, mode, variable, and style is matched by name and updated in
// place — a re-run creates zero new objects. See figma/README.md to re-run.
//
// Source of truth is code (src/tokens/quill.tokens.mjs). Do not edit values here.

const REM = 16 // DTCG dimensions are rem; Figma numeric variables are px.
const COLOR_SCOPES = ['ALL_FILLS', 'STROKE_COLOR', 'EFFECT_COLOR'] // ALL_FILLS already covers text/frame/shape fills

// ---- color parsing ----
function hexToRgb(hex) {
  const n = hex.replace('#', '')
  const b = n.length === 3 ? n.split('').map((c) => c + c).join('') : n
  return { r: parseInt(b.slice(0, 2), 16) / 255, g: parseInt(b.slice(2, 4), 16) / 255, b: parseInt(b.slice(4, 6), 16) / 255 }
}
// "#hex" or "rgba(r,g,b,a)" → {r,g,b,a} (all 0–1)
function toFigmaColor(css) {
  const m = css.match(/rgba?\(([^)]+)\)/)
  if (m) {
    const p = m[1].split(',').map((s) => s.trim())
    return { r: +p[0] / 255, g: +p[1] / 255, b: +p[2] / 255, a: p[3] !== undefined ? +p[3] : 1 }
  }
  const { r, g, b } = hexToRgb(css)
  return { r, g, b, a: 1 }
}

// walk DTCG.Primitives.color leaves → { path:[...], modes:{Light,Dark} }
function walkColorLeaves(node, prefix, out) {
  for (const [k, v] of Object.entries(node)) {
    if (v && v.$type === 'color') out.push({ path: [...prefix, k], modes: v.$extensions['com.figma'].modes })
    else if (v && typeof v === 'object') walkColorLeaves(v, [...prefix, k], out)
  }
}

// ---- collection / mode / variable upserts (idempotent by name) ----
async function upsertCollection(name) {
  const cols = await figma.variables.getLocalVariableCollectionsAsync()
  return cols.find((c) => c.name === name) || figma.variables.createVariableCollection(name)
}
// Ensure the collection has exactly the named modes (in order); returns { name: modeId }
function ensureModes(col, names) {
  col.renameMode(col.modes[0].modeId, names[0])
  const ids = { [names[0]]: col.modes[0].modeId }
  for (const n of names.slice(1)) {
    const existing = col.modes.find((m) => m.name === n)
    ids[n] = existing ? existing.modeId : col.addMode(n)
  }
  return ids
}
async function varsInCollection(col) {
  const map = {}
  for (const v of await figma.variables.getLocalVariablesAsync()) {
    if (v.variableCollectionId === col.id) map[v.name] = v
  }
  return map
}

async function syncPrimitiveColors(DTCG) {
  const col = await upsertCollection('Quill Primitives')
  const modes = ensureModes(col, ['Light', 'Dark'])
  const existing = await varsInCollection(col)
  const leaves = []
  walkColorLeaves(DTCG.Primitives.color, [], leaves)
  let created = 0
  let updated = 0
  for (const { path, modes: mv } of leaves) {
    const name = 'color/' + path.join('/')
    let v = existing[name]
    if (!v) {
      v = figma.variables.createVariable(name, col, 'COLOR')
      v.scopes = COLOR_SCOPES
      created++
    } else updated++
    v.setValueForMode(modes.Light, toFigmaColor(mv.Light))
    v.setValueForMode(modes.Dark, toFigmaColor(mv.Dark))
    existing[name] = v
  }
  return { collection: col.name, modes: Object.keys(modes), created, updated, total: leaves.length }
}

// ---- scalar primitives: radius/type (FLOAT, rem→px) + font (STRING, family) ----
const RADIUS_SCOPES = ['CORNER_RADIUS']
const SIZE_SCOPES = ['FONT_SIZE']
const FONT_SCOPES = ['FONT_FAMILY']

const remToPx = (v) => parseFloat(v) * REM
// full CSS stack → primary Figma family name (first segment, unquoted)
const primaryFamily = (stack) => stack.split(',')[0].trim().replace(/^["']|["']$/g, '')

function upsertScalar(col, name, value, type, scopes, modeIds, existing) {
  let v = existing[name]
  let created = 0
  if (!v) {
    v = figma.variables.createVariable(name, col, type)
    v.scopes = scopes
    created = 1
  }
  for (const id of Object.values(modeIds)) v.setValueForMode(id, value)
  existing[name] = v
  return created
}

async function syncPrimitiveScalars(DTCG) {
  const col = await upsertCollection('Quill Primitives')
  const modes = ensureModes(col, ['Light', 'Dark'])
  const existing = await varsInCollection(col)
  let created = 0
  let updated = 0
  const bump = (c) => (c ? created++ : updated++)
  for (const [k, t] of Object.entries(DTCG.Primitives.radius)) bump(upsertScalar(col, 'radius/' + k, remToPx(t.$value), 'FLOAT', RADIUS_SCOPES, modes, existing))
  for (const [k, t] of Object.entries(DTCG.Primitives.type)) bump(upsertScalar(col, 'type/' + k, remToPx(t.$value), 'FLOAT', SIZE_SCOPES, modes, existing))
  for (const [k, t] of Object.entries(DTCG.Primitives.font)) bump(upsertScalar(col, 'font/' + k, primaryFamily(t.$value), 'STRING', FONT_SCOPES, modes, existing))
  return {
    created,
    updated,
    radius: Object.keys(DTCG.Primitives.radius).length,
    type: Object.keys(DTCG.Primitives.type).length,
    font: Object.keys(DTCG.Primitives.font).length,
  }
}

// ---- Semantic collection: aliases → Primitives ----
// "{Primitives.color.pigment.terracotta.deep}" → "color/pigment/terracotta/deep"
const dtcgRefToVarName = (ref) => 'color/' + ref.replace(/^\{Primitives\.color\.|\}$/g, '').split('.').join('/')

async function syncSemanticAliases(DTCG) {
  const primCol = await upsertCollection('Quill Primitives')
  const primByName = await varsInCollection(primCol)
  const semCol = await upsertCollection('Quill Semantic')
  const modeId = semCol.modes[0].modeId // single mode
  const existing = await varsInCollection(semCol)
  let created = 0
  let updated = 0
  const missing = []
  const buckets = ['text', 'surface', 'border', 'status', 'shadcn']
  for (const bucket of buckets) {
    for (const [key, tok] of Object.entries(DTCG.Theme[bucket])) {
      const prim = primByName[dtcgRefToVarName(tok.$value)]
      if (!prim) { missing.push(`${bucket}/${key} → ${tok.$value}`); continue }
      const leaf = key.startsWith(bucket + '-') ? key.slice(bucket.length + 1) : key
      const name = bucket + '/' + leaf
      let v = existing[name]
      if (!v) {
        v = figma.variables.createVariable(name, semCol, 'COLOR')
        v.scopes = COLOR_SCOPES
        created++
      } else updated++
      v.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: prim.id })
      existing[name] = v
    }
  }
  if (missing.length) throw new Error('Unresolved aliases: ' + missing.join(', '))
  return { collection: semCol.name, created, updated, buckets: buckets.map((b) => `${b}:${Object.keys(DTCG.Theme[b]).length}`) }
}

// ---- Text styles (curated; sizes mirror the type scale; color applied via variables on layers) ----
const TEXT_STYLES = [
  { name: 'Display/XL', family: 'Fraunces', style: 'Regular', size: 88, lh: 105, ls: -3 },
  { name: 'Display/L', family: 'Fraunces', style: 'Regular', size: 64, lh: 105, ls: -3 },
  { name: 'Display/M', family: 'Fraunces', style: 'Regular', size: 48, lh: 110, ls: -3 },
  { name: 'Heading/L', family: 'Fraunces', style: 'Regular', size: 32, lh: 120, ls: -2 },
  { name: 'Heading/M', family: 'Fraunces', style: 'Regular', size: 24, lh: 120, ls: -2 },
  { name: 'Heading/S', family: 'Fraunces', style: 'Regular', size: 18, lh: 130, ls: -1 },
  { name: 'Body/L', family: 'Inter', style: 'Regular', size: 18, lh: 170 },
  { name: 'Body/Base', family: 'Inter', style: 'Regular', size: 15.2, lh: 170 },
  { name: 'Body/S', family: 'Inter', style: 'Regular', size: 13.6, lh: 160 },
  { name: 'Body/XS', family: 'Inter', style: 'Regular', size: 12, lh: 150 },
  { name: 'Accent', family: 'Fraunces', style: 'Italic', size: 28, lh: 120, ls: -2 },
  { name: 'Eyebrow', family: 'Inter', style: 'Medium', size: 11, lh: 100, ls: 15, textCase: 'UPPER' },
]

async function syncTextStyles() {
  const fonts = [...new Set(TEXT_STYLES.map((s) => s.family + '|' + s.style))].map((x) => {
    const [family, style] = x.split('|')
    return { family, style }
  })
  for (const f of fonts) await figma.loadFontAsync(f)
  const byName = Object.fromEntries((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]))
  let created = 0
  let updated = 0
  for (const s of TEXT_STYLES) {
    let ts = byName[s.name]
    if (!ts) { ts = figma.createTextStyle(); created++ } else updated++
    ts.name = s.name
    ts.fontName = { family: s.family, style: s.style }
    ts.fontSize = s.size
    ts.lineHeight = { unit: 'PERCENT', value: s.lh }
    ts.letterSpacing = { unit: 'PERCENT', value: s.ls ?? 0 }
    ts.textCase = s.textCase || 'ORIGINAL'
    byName[s.name] = ts
  }
  return { created, updated, total: TEXT_STYLES.length }
}

async function syncFoundations(DTCG) {
  const results = {}
  results.colors = await syncPrimitiveColors(DTCG)
  results.scalars = await syncPrimitiveScalars(DTCG)
  results.semantic = await syncSemanticAliases(DTCG)
  results.text = await syncTextStyles()
  // Wired up in the next task:
  //   results.effects  = await syncEffectStyles(DTCG)
  return results
}
