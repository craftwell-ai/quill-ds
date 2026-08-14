// Scheduled Figma↔code component parity check — Tier 3 of the drift system,
// automated (see scripts/DRIFT-AUDIT.md and figma/README.md § "Component sync").
//
// Reads figma/sync-state.json (the baseline written by every /figma-pull and
// /figma-push), fetches each synced component's live node via the Figma REST
// file API — document reads work on the Pro plan; only the variables-definitions
// endpoints are Enterprise-gated — and reports drift in both directions:
//
//   Figma ≠ baseline  → a designer edited Figma        → run /figma-pull
//   code  ≠ baseline  → code moved without a mirror    → run /figma-push
//
// Detection only: repair always goes through the on-demand commands, because
// Figma has no headless node-write API on any plan and structural pulls need
// judgment. Exits 1 on drift (the workflow emails on failure). Without a
// FIGMA_TOKEN secret the check skips cleanly (claude-repair's off-until-secret
// pattern). Properties the API response doesn't let us verify are reported as
// warnings, never counted as clean OR as drift.

import { readFileSync, writeFileSync, appendFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

export function loadState(path = join(root, 'figma/sync-state.json')) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function rgbToHex(color) {
  if (!color) return null
  const c = (v) => Math.round(v * 255).toString(16).padStart(2, '0')
  return `#${c(color.r)}${c(color.g)}${c(color.b)}`.toUpperCase()
}

// boundVariables entries arrive as {type,id} or, for some plural properties,
// as arrays of them — normalize to a variable name via the committed id map.
export function boundName(entry, varNames) {
  if (!entry) return null
  const id = Array.isArray(entry) ? entry[0]?.id : entry.id
  if (!id) return null
  return varNames[id] ?? `unknown(${id})`
}

function collectTexts(node, out = {}) {
  if (node.type === 'TEXT') out[node.name] = node.characters
  for (const child of node.children ?? []) collectTexts(child, out)
  return out
}

// Pull the snapshot-comparable shape out of one REST nodes-response bundle
// ({ document, styles }). Every entry is { var, raw } with null for whatever
// the response didn't carry — diffComponent treats double-null as unverifiable.
export function extractComponent(bundle, varNames) {
  const doc = bundle.document
  const bv = doc.boundVariables ?? {}
  const fill = (doc.fills ?? []).find((p) => p.visible !== false)
  const stroke = (doc.strokes ?? []).find((p) => p.visible !== false)
  const effectStyleId = doc.styles?.effect
  return {
    fill: { var: boundName(fill?.boundVariables?.color, varNames), raw: rgbToHex(fill?.color) },
    stroke: { var: boundName(stroke?.boundVariables?.color, varNames), raw: rgbToHex(stroke?.color) },
    // Uniform stroke weights bind to `strokeWeight`, but a node with per-side
    // weights binds four separate keys instead. Without the fallback `var` is
    // permanently null for those nodes, so drift on them can only ever be
    // reported by raw number — the fallback lets it be named by variable.
    strokeWeight: {
      var: boundName(bv.strokeWeight ?? bv.strokeTopWeight, varNames),
      raw: doc.strokeWeight ?? doc.strokeTopWeight ?? null,
    },
    cornerRadius: {
      var: boundName(bv.topLeftRadius ?? bv.rectangleCornerRadii, varNames),
      raw: doc.cornerRadius ?? doc.rectangleCornerRadii?.[0] ?? null,
    },
    padding: { var: boundName(bv.paddingLeft, varNames), raw: doc.paddingLeft ?? null },
    itemSpacing: { var: boundName(bv.itemSpacing, varNames), raw: doc.itemSpacing ?? null },
    effectStyle: (effectStyleId && bundle.styles?.[effectStyleId]?.name) || null,
    texts: collectTexts(doc, {}),
    childSignature: (doc.children ?? []).map((c) => `${c.name}:${c.type}`),
  }
}

function sameRaw(a, b) {
  if (typeof a === 'string' && typeof b === 'string') return a.toUpperCase() === b.toUpperCase()
  return a === b
}

// Compare one snapshot entry against the live extraction. A property matches
// when the binding names agree OR the raw values agree — a dropped binding
// with an unchanged value is parity noise for /figma-push, not design drift.
export function diffComponent(snapshot, live) {
  const drift = []
  const unverifiable = []
  for (const key of ['fill', 'stroke', 'strokeWeight', 'cornerRadius', 'padding', 'itemSpacing']) {
    const snap = snapshot[key]
    const cur = live[key]
    if (!snap) continue
    const varsComparable = snap.var != null && cur.var != null
    const rawsComparable = snap.raw != null && cur.raw != null
    if (!varsComparable && !rawsComparable) {
      unverifiable.push(key)
      continue
    }
    const varsMatch = varsComparable && snap.var === cur.var
    const rawsMatch = rawsComparable && sameRaw(snap.raw, cur.raw)
    if (!varsMatch && !rawsMatch) {
      drift.push(`${key}: expected ${snap.var ?? snap.raw}, found ${cur.var ?? cur.raw}`)
    }
  }
  if (snapshot.effectStyle) {
    if (live.effectStyle == null) unverifiable.push('effectStyle')
    else if (live.effectStyle !== snapshot.effectStyle) {
      drift.push(`effectStyle: expected ${snapshot.effectStyle}, found ${live.effectStyle}`)
    }
  }
  for (const [name, chars] of Object.entries(snapshot.texts ?? {})) {
    if (!(name in live.texts)) drift.push(`text '${name}': removed`)
    else if (live.texts[name] !== chars) drift.push(`text '${name}': changed`)
  }
  if (snapshot.childSignature && JSON.stringify(live.childSignature) !== JSON.stringify(snapshot.childSignature)) {
    drift.push(`structure: [${snapshot.childSignature}] → [${live.childSignature}]`)
  }
  return { drift, unverifiable }
}

// Code side of the pair: the baseline container class string must still be
// present in the source file, else code moved without a /figma-push.
export function checkCode(component, source) {
  return source.includes(component.code.classes)
}

// ---- auto-repair: value-level drift → deterministic class rewrites ----
//
// Only drift with a provably correct answer is repaired (the self-heal bar):
// a re-bound token or changed text maps 1:1 to a class or string edit.
// Anything needing judgment — structural changes, stroke changes (the border
// color/width classes interact), unknown variables, ambiguous matches — is
// left for an interactive /figma-pull.

const RADIUS_CLASS = { xs: 'rounded-xs', sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl', '2xl': 'rounded-2xl', '3xl': 'rounded-3xl', '4xl': 'rounded-4xl' }
const ELEVATION_CLASS = { 'Elevation/xs': 'shadow-xs', 'Elevation/sm': 'shadow-sm', 'Elevation/base': 'shadow-md', 'Elevation/lg': 'shadow-lg', 'Elevation/pop': 'shadow-xl' }

export function classFor(key, name) {
  if (name == null) return undefined
  if (key === 'fill') {
    const m = name.match(/^shadcn\/([a-z0-9-]+)$/)
    return m ? `bg-${m[1]}` : undefined
  }
  if (key === 'cornerRadius') {
    const m = name.match(/^corner-radius\/(.+)$/)
    return m ? RADIUS_CLASS[m[1]] : undefined
  }
  if (key === 'padding' || key === 'itemSpacing') {
    const m = name.match(/^spacing\/(.+)$/)
    if (!m) return undefined
    return `${key === 'padding' ? 'p' : 'gap'}-${m[1].replace('_', '.')}`
  }
  if (key === 'effectStyle') return ELEVATION_CLASS[name]
  return undefined
}

const REPAIRABLE_KEYS = ['fill', 'cornerRadius', 'padding', 'itemSpacing', 'effectStyle']

const countOccurrences = (haystack, needle) => haystack.split(needle).length - 1

// Decide whether ALL of a component's drift reduces to deterministic edits.
// Returns { repairable, reasons, classEdits, textEdits } — all-or-nothing per
// component, so a half-repaired twin can never masquerade as synced.
export function planRepair(component, live, source) {
  const snapshot = component.figma
  const reasons = []
  const classEdits = []
  const textEdits = []

  if (snapshot.childSignature && JSON.stringify(live.childSignature) !== JSON.stringify(snapshot.childSignature)) {
    reasons.push('structure changed — needs an interactive /figma-pull')
  }
  for (const key of ['stroke', 'strokeWeight']) {
    const snap = snapshot[key]
    if (!snap) continue
    const cur = live[key]
    const varsMatch = snap.var != null && cur.var != null && snap.var === cur.var
    const rawsMatch = snap.raw != null && cur.raw != null && String(snap.raw).toUpperCase() === String(cur.raw).toUpperCase()
    if (!varsMatch && !rawsMatch) reasons.push(`${key} changed — border edits need an interactive /figma-pull`)
  }
  for (const key of REPAIRABLE_KEYS) {
    const snap = key === 'effectStyle' ? { var: snapshot.effectStyle } : snapshot[key]
    const cur = key === 'effectStyle' ? { var: live.effectStyle } : live[key]
    if (!snap?.var) continue
    if (cur.var == null || cur.var === snap.var) continue
    if (key !== 'effectStyle' && snap.raw != null && cur.raw != null && snap.raw === cur.raw) continue
    const from = classFor(key, snap.var)
    const to = classFor(key, cur.var)
    if (!from || !to) reasons.push(`${key}: no class mapping for '${cur.var ?? snap.var}'`)
    else if (!component.code.classes.split(' ').includes(from)) reasons.push(`${key}: baseline class '${from}' not in code.classes`)
    else classEdits.push({ key, from, to, newVar: cur.var, newRaw: cur.raw })
  }
  for (const [name, chars] of Object.entries(snapshot.texts ?? {})) {
    if (!(name in live.texts)) reasons.push(`text '${name}' removed — needs an interactive /figma-pull`)
    else if (live.texts[name] !== chars) {
      if (countOccurrences(source, chars) === 1) textEdits.push({ name, from: chars, to: live.texts[name] })
      else reasons.push(`text '${name}': old value not found exactly once in source`)
    }
  }
  return { repairable: reasons.length === 0 && (classEdits.length > 0 || textEdits.length > 0), reasons, classEdits, textEdits }
}

// Apply a plan: returns { source, component } with the source file content and
// the baseline entry both rewritten to the new agreed state.
export function applyRepair(component, plan, source, today) {
  const oldClasses = component.code.classes
  if (countOccurrences(source, oldClasses) !== 1) {
    throw new Error(`baseline classes for '${component.name}' not found exactly once in ${component.codeFile}`)
  }
  let newClasses = oldClasses
  for (const edit of plan.classEdits) {
    newClasses = newClasses.split(' ').map((token) => (token === edit.from ? edit.to : token)).join(' ')
  }
  let newSource = source.replace(oldClasses, newClasses)
  for (const edit of plan.textEdits) {
    newSource = newSource.replace(edit.from, edit.to)
  }
  const next = structuredClone(component)
  next.code.classes = newClasses
  for (const edit of plan.classEdits) {
    if (edit.key === 'effectStyle') next.figma.effectStyle = edit.newVar
    else next.figma[edit.key] = { var: edit.newVar, raw: edit.newRaw ?? next.figma[edit.key].raw }
  }
  for (const edit of plan.textEdits) next.figma.texts[edit.name] = edit.to
  next.lastSynced = today
  return { source: newSource, component: next }
}

export async function fetchNodes(fileKey, ids, token) {
  const url = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(ids.join(','))}`
  const res = await fetch(url, { headers: { 'X-Figma-Token': token } })
  if (!res.ok) throw new Error(`Figma API ${res.status}: ${await res.text()}`)
  return res.json()
}

function report(line) {
  console.log(line)
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, line + '\n')
}

// Detect mode: exit 1 on any drift (the audit job emails).
// Repair mode (--repair): value-level drift is fixed in place (source file +
// baseline rewritten; the workflow commits and opens the PR); exit 2 only when
// unrepairable drift remains and a human needs /figma-pull or /figma-push.
export async function main({ repair = false } = {}) {
  const token = process.env.FIGMA_TOKEN
  if (!token) {
    report('figma-drift: no FIGMA_TOKEN secret — component parity check skipped (add a Figma personal access token with file read scope to enable).')
    return
  }
  const statePath = join(root, 'figma/sync-state.json')
  const state = loadState(statePath)
  const data = await fetchNodes(state.fileKey, state.components.map((c) => c.nodeId), token)
  const today = new Date().toISOString().slice(0, 10)
  let unrepaired = false
  let repaired = false
  for (const [index, component] of state.components.entries()) {
    const bundle = data.nodes[component.nodeId]
    if (!bundle?.document) {
      report(`✖ ${component.name}: node ${component.nodeId} not found in file — was the ❖ page deleted?`)
      unrepaired = true
      continue
    }
    const live = extractComponent(bundle, state.variables)
    const { drift, unverifiable } = diffComponent(component.figma, live)
    const sourcePath = join(root, component.codeFile)
    const source = readFileSync(sourcePath, 'utf8')
    const codeInSync = checkCode(component, source)
    if (!codeInSync) {
      // The push direction can never run headless (no node-write API) — always a human step.
      report(`✖ ${component.name}: code moved (baseline classes missing from ${component.codeFile}) — run /figma-push ${component.name}`)
      unrepaired = true
    }
    if (drift.length && repair && codeInSync) {
      const plan = planRepair(component, live, source)
      if (plan.repairable) {
        const result = applyRepair(component, plan, source, today)
        writeFileSync(sourcePath, result.source)
        state.components[index] = result.component
        repaired = true
        report(`✔ ${component.name}: auto-repaired ${plan.classEdits.length + plan.textEdits.length} value-level edit(s) from Figma`)
        for (const e of plan.classEdits) report(`    ${e.key}: ${e.from} → ${e.to}`)
        for (const e of plan.textEdits) report(`    text '${e.name}' updated`)
      } else {
        unrepaired = true
        report(`✖ ${component.name}: Figma moved but not auto-repairable — run /figma-pull ${component.name}`)
        for (const r of plan.reasons) report(`    ${r}`)
      }
    } else if (drift.length) {
      unrepaired = true
      report(`✖ ${component.name}: Figma moved — run /figma-pull ${component.name}`)
      for (const d of drift) report(`    ${d}`)
    }
    for (const u of unverifiable) report(`  ⚠ ${component.name}: '${u}' not verifiable from the REST response — needs a live /figma-pull audit`)
    if (!drift.length && codeInSync) report(`✔ ${component.name}: in sync (last synced ${component.lastSynced})`)
  }
  if (repaired) writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n')
  if (unrepaired) process.exitCode = repair ? 2 : 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main({ repair: process.argv.includes('--repair') })
}
