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

import { readFileSync, appendFileSync } from 'node:fs'
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
    strokeWeight: { var: boundName(bv.strokeWeight, varNames), raw: doc.strokeWeight ?? null },
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

export async function main() {
  const token = process.env.FIGMA_TOKEN
  if (!token) {
    report('figma-drift: no FIGMA_TOKEN secret — component parity check skipped (add a Figma personal access token with file read scope to enable).')
    return
  }
  const state = loadState()
  const data = await fetchNodes(state.fileKey, state.components.map((c) => c.nodeId), token)
  let dirty = false
  for (const component of state.components) {
    const bundle = data.nodes[component.nodeId]
    if (!bundle?.document) {
      report(`✖ ${component.name}: node ${component.nodeId} not found in file — was the ❖ page deleted?`)
      dirty = true
      continue
    }
    const live = extractComponent(bundle, state.variables)
    const { drift, unverifiable } = diffComponent(component.figma, live)
    const codeInSync = checkCode(component, readFileSync(join(root, component.codeFile), 'utf8'))
    if (drift.length) {
      dirty = true
      report(`✖ ${component.name}: Figma moved — run /figma-pull ${component.name}`)
      for (const d of drift) report(`    ${d}`)
    }
    if (!codeInSync) {
      dirty = true
      report(`✖ ${component.name}: code moved (baseline classes missing from ${component.codeFile}) — run /figma-push ${component.name}`)
    }
    for (const u of unverifiable) report(`  ⚠ ${component.name}: '${u}' not verifiable from the REST response — needs a live /figma-pull audit`)
    if (!drift.length && codeInSync) report(`✔ ${component.name}: in sync (last synced ${component.lastSynced})`)
  }
  if (dirty) process.exitCode = 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
