// Re-runnable Figma Plugin-API upsert for Quill foundations.
//
// Executed via the Figma MCP `use_figma` on file Dcf8lEB7Ash71iNl7WN4Jq, with a
// `DTCG` object in scope (the contents of tokens/quill.figma.json). Idempotent:
// every collection, mode, variable, and style is matched by name and updated in
// place — a re-run creates zero new objects. See figma/README.md to re-run.
//
// Source of truth is code (src/tokens/quill.tokens.mjs). Do not edit values here.

const REM = 16 // DTCG dimensions are rem; Figma numeric variables are px.
// The file's four modes. The DTCG export also carries Intelligent, which is
// skipped by decision (figma/README.md, "Variable modes") — the Professional
// plan's ceiling is four modes per collection.
const MODES = ['Light', 'Dark', 'Classic Light', 'Classic Dark']
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

// walk DTCG.Primitives.color leaves → { path:[...], modes:{ <mode name>: css } }
function walkColorLeaves(node, prefix, out) {
  for (const [k, v] of Object.entries(node)) {
    if (v && v.$type === 'color') out.push({ path: [...prefix, k], tok: v, modes: v.$extensions['com.figma'].modes })
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

// ---- names come from the export ----
// build-tokens writes each variable's Figma name (the CSS name with one group
// level: `color/paper-warm`, `space/2_5`, `semantic/muted`) and, where it was
// called something else before 0.10.0, its `legacyName`. A variable found under
// the legacy name is RENAMED in place — its id and every binding survive. Creating
// the new name beside it would orphan the 1,259 bindings the library carries.
const figmaName = (tok) => tok.$extensions['com.figma'].name
const legacyName = (tok) => tok.$extensions['com.figma'].legacyName
let renamed = 0
function adopt(existing, tok) {
  const name = figmaName(tok)
  const legacy = legacyName(tok)
  if (!existing[name] && legacy && existing[legacy]) {
    existing[legacy].name = name
    existing[name] = existing[legacy]
    delete existing[legacy]
    renamed++
  }
  return name
}

async function syncPrimitiveColors(DTCG) {
  const col = await upsertCollection('Quill Primitives')
  const modes = ensureModes(col, MODES)
  const existing = await varsInCollection(col)
  const leaves = []
  walkColorLeaves(DTCG.Primitives.color, [], leaves)
  let created = 0
  let updated = 0
  for (const { tok, modes: mv } of leaves) {
    const name = adopt(existing, tok)
    let v = existing[name]
    if (!v) {
      v = figma.variables.createVariable(name, col, 'COLOR')
      v.scopes = COLOR_SCOPES
      created++
    } else updated++
    for (const m of MODES) if (mv[m]) v.setValueForMode(modes[m], toFigmaColor(mv[m]))
    existing[name] = v
  }
  return { collection: col.name, modes: Object.keys(modes), created, updated, total: leaves.length }
}

// ---- scalar primitives: radius/type (FLOAT, rem→px) + font (STRING, family) ----
const RADIUS_SCOPES = ['CORNER_RADIUS']
const SIZE_SCOPES = ['FONT_SIZE']
const FONT_SCOPES = ['FONT_FAMILY']
const SPACE_SCOPES = ['GAP', 'WIDTH_HEIGHT']
const STROKE_SCOPES = ['STROKE_FLOAT']

const remToPx = (v) => parseFloat(v) * REM
// rem → px (×16); px values pass through unchanged (border widths).
const dimToPx = (v) => (v.trim().endsWith('rem') ? parseFloat(v) * REM : parseFloat(v))
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
  const modes = ensureModes(col, MODES)
  const existing = await varsInCollection(col)
  let created = 0
  let updated = 0
  const bump = (c) => (c ? created++ : updated++)
  for (const [k, t] of Object.entries(DTCG.Primitives.spacing)) bump(upsertScalar(col, adopt(existing, t), dimToPx(t.$value), 'FLOAT', SPACE_SCOPES, modes, existing))
  for (const [k, t] of Object.entries(DTCG.Primitives.radius)) bump(upsertScalar(col, adopt(existing, t), dimToPx(t.$value), 'FLOAT', RADIUS_SCOPES, modes, existing))
  for (const [k, t] of Object.entries(DTCG.Primitives.borderWidth)) bump(upsertScalar(col, adopt(existing, t), dimToPx(t.$value), 'FLOAT', STROKE_SCOPES, modes, existing))
  for (const [k, t] of Object.entries(DTCG.Primitives.type)) bump(upsertScalar(col, adopt(existing, t), dimToPx(t.$value), 'FLOAT', SIZE_SCOPES, modes, existing))
  for (const [k, t] of Object.entries(DTCG.Primitives.font)) bump(upsertScalar(col, adopt(existing, t), primaryFamily(t.$value), 'STRING', FONT_SCOPES, modes, existing))
  return {
    created,
    updated,
    spacing: Object.keys(DTCG.Primitives.spacing).length,
    radius: Object.keys(DTCG.Primitives.radius).length,
    borderWidth: Object.keys(DTCG.Primitives.borderWidth).length,
    type: Object.keys(DTCG.Primitives.type).length,
    font: Object.keys(DTCG.Primitives.font).length,
  }
}

// ---- Semantic collection: aliases → Primitives ----
// "{Primitives.color.pigment.terracotta.deep}" → that leaf's Figma name
function primitiveNameOf(DTCG, ref) {
  const leaf = ref.replace(/^\{|\}$/g, '').split('.').reduce((node, seg) => node && node[seg], DTCG)
  if (!leaf) throw new Error('Unresolved alias: ' + ref)
  return figmaName(leaf)
}

async function syncSemanticAliases(DTCG) {
  const primCol = await upsertCollection('Quill Primitives')
  const primByName = await varsInCollection(primCol)
  const semCol = await upsertCollection('Quill Semantic')
  const modeId = semCol.modes[0].modeId // single mode
  const existing = await varsInCollection(semCol)
  let created = 0
  let updated = 0
  const missing = []
  // One group: the 31 contract roles, then the status roles the contract has no word for.
  for (const [key, tok] of Object.entries(DTCG.Theme.semantic)) {
    const prim = primByName[primitiveNameOf(DTCG, tok.$value)]
    if (!prim) { missing.push(`semantic/${key} → ${tok.$value}`); continue }
    const name = adopt(existing, tok)
    let v = existing[name]
    if (!v) {
      v = figma.variables.createVariable(name, semCol, 'COLOR')
      v.scopes = COLOR_SCOPES
      created++
    } else updated++
    v.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: prim.id })
    existing[name] = v
  }
  if (missing.length) throw new Error('Unresolved aliases: ' + missing.join(', '))
  // Names retired in 0.10.0 are parked, never deleted: a file that consumes the
  // library may be bound to one. Out of the picker, out of the published set.
  let parked = 0
  for (const tok of Object.values(DTCG.Deprecated)) {
    const name = adopt(existing, tok)
    const v = existing[name]
    if (!v) continue
    v.hiddenFromPublishing = true
    v.scopes = []
    v.description = 'Retired in Quill 0.10.0 — use the semantic contract (semantic/*).'
    parked++
  }
  return { collection: semCol.name, created, updated, parked, total: Object.keys(DTCG.Theme.semantic).length }
}

// ---- Text styles ----
// Every field names a token KEY, resolved from the export when the sync runs:
// `font`, `size`, and — where the value is one a role holds — `leading` and
// `tracking`. `leading: 'paired'` is the line height the size's own utility
// renders (`text-sm` → 142.857%): what the type audit found most bound layers
// already are in code. They were typed numbers once, and drifted where nothing checked:
// Heading/S and Body/L sat at 18 while `lg` is 18.4; the Eyebrow at 11 while code
// and DESIGN.md both say `text-xs`. Colour is applied through variables on the
// layers, not here.
const TEXT_STYLES = [
  { name: 'Display/XL', font: 'display', style: 'Regular', size: '5xl', leading: 'display', tracking: 'display' },
  { name: 'Display/L', font: 'display', style: 'Regular', size: '4xl', leading: 'display', tracking: 'display' },
  { name: 'Display/M', font: 'display', style: 'Regular', size: '3xl', lh: 110, tracking: 'display' },
  { name: 'Heading/L', font: 'heading', style: 'Regular', size: '2xl', leading: 'heading', ls: -2 },
  { name: 'Heading/M', font: 'heading', style: 'Regular', size: 'xl', leading: 'heading', ls: -2 },
  { name: 'Heading/S', font: 'heading', style: 'Regular', size: 'lg', lh: 130, ls: -1 },
  { name: 'Body/L', font: 'sans', style: 'Regular', size: 'lg', leading: 'reading' },
  { name: 'Body/Base', font: 'sans', style: 'Regular', size: 'base', leading: 'reading' },
  { name: 'Body/S', font: 'sans', style: 'Regular', size: 'sm', leading: 'paired' },
  { name: 'Body/XS', font: 'sans', style: 'Regular', size: 'xs', leading: 'paired' },
  // Label styles — Raleway Medium for form/control labels, badges, chips (text-sm / text-xs + font-medium).
  { name: 'Label/Default', font: 'sans', style: 'Medium', size: 'sm', leading: 'paired' },
  { name: 'Label/Small', font: 'sans', style: 'Medium', size: 'xs', leading: 'paired' },
  { name: 'Accent', font: 'display', style: 'Italic', px: 28, leading: 'heading', ls: -2 },
  { name: 'Eyebrow', font: 'sans', style: 'Medium', size: 'xs', lh: 100, tracking: 'eyebrow', textCase: 'UPPER' },
]
// Styles allowed a typed `px` because no type token holds their size. In code the
// accent word is an <em> that inherits its heading's size, so a fixed-size Accent
// style has no twin to read from. The list may only shrink.
const OFF_SCALE = new Set(['Accent'])
// Styles still typing a line height (`lh`) or tracking (`ls`). None of these values
// is a role, and most disagree with what code renders: every h1–h6 tracks at
// -0.03em, not -2 or -1; `text-sm` draws a 142.857% line, not 160 or 140. Moving
// them re-spaces every layer bound to the style, so they wait for a visual pass —
// bind to `Text/*` or a role there, then delete the entry. The list may only shrink.
const TYPED_METRICS = {
  'Display/M': ['lh'], 'Heading/L': ['ls'], 'Heading/M': ['ls'], 'Heading/S': ['lh', 'ls'], Accent: ['ls'], Eyebrow: ['lh'],
}

// Curated rows resolved against the export, plus one `Text/<size>` style per
// `text-*` utility, generated whole: the size and the line height that class
// renders (`Text/sm` = 13.6px on 142.857%). Bind a layer to `Text/*` when its code
// twin is a bare `text-sm`; the curated styles are for prose and headings.
function resolveTextStyles(DTCG) {
  const P = DTCG.Primitives
  const family = (key) => primaryFamily(P.font[key].$value)
  const curated = TEXT_STYLES.map((s) => {
    if (s.size === undefined && !OFF_SCALE.has(s.name)) throw new Error(s.name + ': name a type token in `size`')
    if (s.size !== undefined && !P.type[s.size]) throw new Error(s.name + ': no type token "' + s.size + '"')
    const typed = TYPED_METRICS[s.name] || []
    if ((s.lh !== undefined) !== typed.includes('lh')) throw new Error(s.name + ': name a leading role, or list the typed `lh` in TYPED_METRICS')
    if ((s.ls !== undefined) !== typed.includes('ls')) throw new Error(s.name + ': name a tracking role, or list the typed `ls` in TYPED_METRICS')
    if (s.leading !== undefined && s.leading !== 'paired' && !P.leading[s.leading]) throw new Error(s.name + ': no leading role "' + s.leading + '"')
    if (s.leading === 'paired' && !(P.lineHeight && P.lineHeight[s.size])) throw new Error(s.name + ': size "' + s.size + '" has no paired line height')
    if (s.tracking !== undefined && !P.tracking[s.tracking]) throw new Error(s.name + ': no tracking role "' + s.tracking + '"')
    const lh = s.leading === 'paired' ? Math.round(P.lineHeight[s.size].$value * 100000) / 1000 : s.leading !== undefined ? Math.round(P.leading[s.leading].$value * 100000) / 1000 : s.lh
    const ls = s.tracking !== undefined ? P.tracking[s.tracking].$value : s.ls
    return { name: s.name, family: family(s.font), style: s.style, size: s.size !== undefined ? dimToPx(P.type[s.size].$value) : s.px, lh, ls, textCase: s.textCase }
  })
  const utilities = Object.entries(P.lineHeight).map(([k, t]) => ({
    name: 'Text/' + k, family: family('sans'), style: 'Regular', size: dimToPx(P.type[k].$value), lh: Math.round(t.$value * 100000) / 1000,
  }))
  return [...curated, ...utilities]
}

async function syncTextStyles(DTCG) {
  const styles = resolveTextStyles(DTCG)
  const fonts = [...new Set(styles.map((s) => s.family + '|' + s.style))].map((x) => {
    const [family, style] = x.split('|')
    return { family, style }
  })
  for (const f of fonts) await figma.loadFontAsync(f)
  const byName = Object.fromEntries((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]))
  let created = 0
  let updated = 0
  for (const s of styles) {
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
  return { created, updated, total: styles.length }
}

// ---- Effect styles: elevation drop shadows (light values; Figma effect styles can't hold modes) ----
// Parse a CSS box-shadow composite ("x y blur spread rgba(...), ...") into Figma DROP_SHADOW effects.
function parseShadows(css) {
  const re = /(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?\s+(rgba?\([^)]*\))/g
  const out = []
  let m
  while ((m = re.exec(css))) {
    out.push({
      type: 'DROP_SHADOW',
      color: toFigmaColor(m[5]),
      offset: { x: +m[1], y: +m[2] },
      radius: +m[3],
      spread: +m[4],
      visible: true,
      blendMode: 'NORMAL',
    })
  }
  return out
}

// Per-layer shadow colors → mode-aware COLOR variables, so ONE effect style adapts Light↔Dark.
const SHADOW_COLOR_SCOPES = ['EFFECT_COLOR']
const shadowColors = (css) => css.match(/rgba?\([^)]*\)/g) || []

async function syncShadowColorVars(DTCG) {
  const col = await upsertCollection('Quill Primitives')
  const modes = ensureModes(col, MODES)
  const existing = await varsInCollection(col)
  let created = 0
  let updated = 0
  for (const [k, tok] of Object.entries(DTCG.Primitives.elevation)) {
    const perMode = Object.fromEntries(MODES.map((m) => [m, shadowColors(tok.$extensions['com.figma'].modes[m] ?? tok.$value)]))
    for (let i = 0; i < perMode.Light.length; i++) {
      const name = `shadow/${k}/${i + 1}`
      let v = existing[name]
      if (!v) { v = figma.variables.createVariable(name, col, 'COLOR'); v.scopes = SHADOW_COLOR_SCOPES; created++ } else updated++
      for (const m of MODES) if (perMode[m][i]) v.setValueForMode(modes[m], toFigmaColor(perMode[m][i]))
      existing[name] = v
    }
  }
  return { created, updated }
}

async function syncEffectStyles(DTCG) {
  const shadowVars = await varsInCollection(await upsertCollection('Quill Primitives'))
  const byName = Object.fromEntries((await figma.getLocalEffectStylesAsync()).map((s) => [s.name, s]))
  let created = 0
  let updated = 0
  for (const [k, tok] of Object.entries(DTCG.Primitives.elevation)) {
    const name = 'Elevation/' + k
    let es = byName[name]
    if (!es) { es = figma.createEffectStyle(); created++ } else updated++
    es.name = name
    // Offsets/blur/spread come from the (light) value — identical across modes;
    // each shadow's COLOR is bound to its mode-aware shadow/* variable.
    es.effects = parseShadows(tok.$value).map((eff, i) => {
      const v = shadowVars[`shadow/${k}/${i + 1}`]
      return v ? figma.variables.setBoundVariableForEffect(eff, 'color', v) : eff
    })
    byName[name] = es
  }
  return { created, updated, total: Object.keys(DTCG.Primitives.elevation).length }
}

// ---- tints: the Tailwind opacity modifiers code uses on tokens (`bg-destructive/10`,
// `ring-foreground/10`, `bg-muted/50`, the ToneBadge pigment tints…) as alpha-carrying
// variables. A paint-level opacity on a bound colour is dropped when the component is
// instanced inside another component (proven 2026-09-19: the app-page template drew every
// tinted badge and card ring solid), while a variable whose value carries the alpha survives —
// so every tinted paint binds one of these. Values are derived per mode from the base variable
// (resolved through its aliases), never typed by hand; the list below is the single source.

async function syncTints(DTCG) {
  const prim = await upsertCollection('Quill Primitives')
  const all = await figma.variables.getLocalVariablesAsync()
  const byName = (n) => all.find((v) => v.name === n)
  const colOf = (v) => figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId)
  // Resolve a base variable for one Primitives mode: a Semantic alias is read in its own
  // (single) mode and followed into Primitives, where the requested mode applies.
  async function resolveForMode(v, modeId) {
    let c = await colOf(v)
    let m = c.id === prim.id ? modeId : c.defaultModeId
    let val = v.valuesByMode[m]
    let guard = 0
    while (val && typeof val === 'object' && val.type === 'VARIABLE_ALIAS' && guard++ < 10) {
      const t = await figma.variables.getVariableByIdAsync(val.id)
      const tc = await colOf(t)
      m = tc.id === prim.id ? modeId : tc.defaultModeId
      val = t.valuesByMode[m]
    }
    if (!val || val.r == null) throw new Error(`tint base ${v.name} did not resolve for mode ${modeId}`)
    return val
  }
  let created = 0
  let updated = 0
  // Which tints exist is a token decision (quill.tokens.mjs `tints`); the export carries them.
  for (const { name, base: baseName, alpha, cssVar, text } of DTCG.Tints) {
    const base = byName(baseName)
    if (!base) throw new Error(`tint base ${baseName} missing — run the colour sync first`)
    let v = byName(name)
    if (!v) { v = figma.variables.createVariable(name, prim, 'COLOR'); created++ } else updated++
    for (const mode of prim.modes) {
      const c = await resolveForMode(base, mode.modeId)
      v.setValueForMode(mode.modeId, { r: c.r, g: c.g, b: c.b, a: alpha })
    }
    v.scopes = text ? ['TEXT_FILL', 'SHAPE_FILL', 'FRAME_FILL'] : ['FRAME_FILL', 'SHAPE_FILL', 'STROKE_COLOR']
    v.setVariableCodeSyntax('WEB', `color-mix(in oklab, var(${cssVar}) ${Math.round(alpha * 100)}%, transparent)`)
    v.description = `${baseName} at ${Math.round(alpha * 100)} % — the Tailwind opacity modifier (${cssVar.replace('--', '')}/${Math.round(alpha * 100)}) as a variable, so the tint survives nested instances.`
  }
  return { created, updated, total: DTCG.Tints.length }
}

async function syncFoundations(DTCG) {
  const results = {}
  results.colors = await syncPrimitiveColors(DTCG)
  results.scalars = await syncPrimitiveScalars(DTCG)
  results.semantic = await syncSemanticAliases(DTCG)
  results.shadowColors = await syncShadowColorVars(DTCG)
  results.text = await syncTextStyles(DTCG)
  results.effects = await syncEffectStyles(DTCG)
  results.tints = await syncTints(DTCG)
  results.renamed = renamed
  return results
}
