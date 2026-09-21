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

import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs'
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
    const m = name.match(/^semantic\/([a-z0-9-]+)$/)
    return m ? `bg-${m[1]}` : undefined
  }
  if (key === 'cornerRadius') {
    const m = name.match(/^radius\/(.+)$/)
    return m ? RADIUS_CLASS[m[1]] : undefined
  }
  if (key === 'padding' || key === 'itemSpacing') {
    const m = name.match(/^space\/(.+)$/)
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
    const fromBase = classFor(key, snap.var)
    const toBase = classFor(key, cur.var)
    const tokens = component.code.classes.split(' ')
    // The baseline may carry the px- form of a padding class; rewrite in kind.
    const from = acceptableForms(fromBase).find((form) => tokens.includes(form))
    const to = from?.startsWith('px-') && toBase ? toBase.replace(/^p-/, 'px-') : toBase
    if (!fromBase || !toBase) reasons.push(`${key}: no class mapping for '${cur.var ?? snap.var}'`)
    else if (!from) reasons.push(`${key}: baseline class '${fromBase}' not in code.classes`)
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

// ---- adoption: bring an existing Figma twin under the parity check ----
//
// Candidates (`candidates` in figma/sync-state.json — Wave A, from
// figma/components/README.md's component-set map) become baseline entries only
// when Figma and code already agree: the classes the node's bindings translate
// to must all sit in one class string of the code file. A candidate that
// disagrees is reported, not adopted — that disagreement is real drift for a
// human to settle with /figma-pull or /figma-push, and adopting it blind would
// turn the daily run red for good.

// A variant set is tracked through one variant, the default one: the child
// whose properties are all `default` or `off` (Button's "Variant=default,
// Size=default", Checkbox's "Checked=off"). Ties and single components fall
// back to the first child.
export function pickVariant(set) {
  const children = (set.children ?? []).filter((c) => c.type === 'COMPONENT')
  if (!children.length) return null
  const score = (c) => c.name.split(',').filter((seg) => /=\s*(default|off)\s*$/i.test(seg)).length
  return children.reduce((best, c) => (score(c) > score(best) ? c : best), children[0])
}

// The classes a snapshot's repairable bindings translate to — the part of the
// code twin the check can name.
export function derivedClasses(snapshot) {
  return REPAIRABLE_KEYS.map((key) => {
    const name = key === 'effectStyle' ? snapshot.effectStyle : snapshot[key]?.var
    return name ? classFor(key, name) : null
  }).filter(Boolean)
}

// The forms code writes a derived class in: the padding snapshot comes from
// paddingLeft, which shadcn writes as `px-N` far more often than `p-N`.
export const acceptableForms = (cls) => {
  if (!cls) return []
  if (cls.startsWith('p-')) return [cls, `px-${cls.slice(2)}`, `pl-${cls.slice(2)}`] // paddingLeft is what the twin reads
  if (cls.startsWith('gap-')) return [cls, `gap-x-${cls.slice(4)}`, `gap-y-${cls.slice(4)}`]
  if (cls === 'rounded-4xl') return [cls, 'rounded-full'] // both draw a full pill on a control
  return [cls]
}
// `data-unchecked:bg-input` or `group-data-[size=default]/switch:h-4` carries
// the class after its last top-level colon.
const baseToken = (tok) => {
  let depth = 0
  let cut = -1
  for (let i = 0; i < tok.length; i++) {
    const ch = tok[i]
    if (ch === '[' || ch === '(') depth++
    else if (ch === ']' || ch === ')') depth--
    else if (ch === ':' && depth === 0) cut = i
  }
  return cut === -1 ? tok : tok.slice(cut + 1)
}
const hasToken = (tokens, cls) => acceptableForms(cls).some((form) => tokens.some((t) => t === form || baseToken(t) === form))
// `[--card-spacing:--spacing(4)]` in a file makes `gap-(--card-spacing)` read as `gap-4`.
// Only the unprefixed definition counts: `data-[size=sm]:[--card-spacing:--spacing(3)]` is a variant.
const spacingVarsOf = (source) => {
  const out = {}
  for (const m of source.matchAll(/(?<![:\w])\[--([a-z0-9-]+):--spacing\(([\d.]+)\)\]/g)) if (!(m[1] in out)) out[m[1]] = m[2]
  return out
}
const tokensIn = (lit, spacingVars) => lit.split(/\s+/).flatMap((t) => {
  const m = baseToken(t).match(/^(p|px|py|pl|pr|pt|pb|gap|gap-x|gap-y)-\(--([a-z0-9-]+)\)$/)
  return m && spacingVars[m[2]] ? [t, `${m[1]}-${spacingVars[m[2]]}`] : [t]
})
const allLiterals = (source) => [...source.matchAll(/(["'])((?:(?!\1)[^\\\n])+)\1/g)].map((m) => m[2]).filter((lit) => lit.includes(' '))

// Class-string literals that occur exactly once in the file — the only ones
// applyRepair can later rewrite without ambiguity.
export function uniqueLiterals(source) {
  return [...source.matchAll(/(["'])((?:(?!\1)[^\\\n])+)\1/g)]
    .map((m) => m[2])
    .filter((lit) => lit.includes(' ') && countOccurrences(source, lit) === 1)
}

// Match the derived classes against the code file. `classes` becomes the
// literal carrying the most of them (code.classes); the rest may sit in another
// unique literal — cva keeps variant classes apart from the base string. Any
// class found nowhere is `missing`: Figma and code disagree. With nothing to
// derive, the component's first real class string anchors a detection-only
// entry, so Figma-side edits are still caught.
export function matchCode(source, classes, alsoIn = []) {
  const literals = uniqueLiterals(source)
  const spacingVars = spacingVarsOf(source)
  const tokensOf = (lit) => tokensIn(lit, spacingVars)
  // a real class string: two or more tokens, at least one shaped like a utility — 'use client' is two words, not classes
  const classString = (lit) => { const t = tokensOf(lit); return t.length >= 2 && t.some((x) => /[-/[:]/.test(x)) }
  // classes the twin inherits from a base component live in that file
  const elsewhere = alsoIn.flatMap((src) => { const sv = spacingVarsOf(src); return allLiterals(src).map((lit) => tokensIn(lit, sv)) })
  if (!classes.length) {
    const anchor = literals.find(classString)
    return anchor ? { classes: anchor, missing: [], detectionOnly: true } : null
  }
  // a one-class cva variant value (`default: "bg-muted"`) is a class string too
  const singles = [...source.matchAll(/(["'])([a-z][\w./[\]()%:-]*-[\w./[\]()%:-]*)\1/g)].map((m) => m[2])
  let main = null
  let best = 0
  for (const lit of literals) {
    const n = classes.filter((c) => hasToken(tokensOf(lit), c)).length
    if (n > best) {
      best = n
      main = lit
    }
  }
  // every class may live in the base component's file or in one-class values (Tabs: only `bg-muted`
  // is derived, and it sits alone in the variants map): anchor on the first real class string here
  if (!main && (elsewhere.length || singles.some((s) => classes.some((c) => hasToken([s], c))))) main = literals.find(classString) ?? null
  if (!main) return { classes: null, missing: [...classes], detectionOnly: false }
  const missing = classes.filter((c) => !literals.some((lit) => hasToken(tokensOf(lit), c)) && !singles.some((s) => hasToken([s], c)) && !elsewhere.some((tokens) => hasToken(tokens, c)))
  return { classes: main, missing, detectionOnly: false }
}

// Keys the REST response could not fill (binding and raw both null) carry no
// information and would warn on every daily run as "not verifiable"; a null
// effect style likewise. Drop them from an adopted snapshot — diffComponent
// skips absent keys, and a property that later gains a binding shows up as
// drift by raw value the next time the entry is rewritten.
export function pruneSnapshot(figma) {
  const out = {}
  for (const [key, value] of Object.entries(figma)) {
    const pair = value && typeof value === 'object' && !Array.isArray(value) && 'var' in value && 'raw' in value
    if (pair && value.var == null && value.raw == null) continue
    if (key === 'effectStyle' && value == null) continue
    out[key] = value
  }
  return out
}

// One candidate → either a baseline entry or a reason. Pure; the caller does I/O.
export function adoptCandidate(candidate, bundle, varNames, source, today, alsoIn = []) {
  if (!bundle?.document) return { adopted: null, why: `node ${candidate.nodeId} not found in file` }
  let node = bundle.document
  let variant = null
  if (node.type === 'COMPONENT_SET') {
    node = pickVariant(node)
    if (!node) return { adopted: null, why: 'component set has no variants' }
    variant = node.name
  }
  const figma = extractComponent({ document: node, styles: bundle.styles }, varNames)
  const unnamed = Object.entries(figma)
    .filter(([, v]) => typeof v?.var === 'string' && v.var.startsWith('unknown('))
    .map(([k, v]) => `${k}=${v.var}`)
  const classes = derivedClasses(figma)
  let match
  if (candidate.detectionOnly) {
    // styled by CSS variables (sonner) — nothing to derive; anchor on a string the file carries once
    if (!candidate.anchor || countOccurrences(source, candidate.anchor) !== 1) return { adopted: null, why: 'a detection-only candidate needs an `anchor` string that occurs exactly once in its code file' }
    match = { classes: candidate.anchor, missing: [], detectionOnly: true }
  } else {
    match = matchCode(source, classes, alsoIn)
  }
  if (!match) return { adopted: null, why: 'no class string in the code file to anchor on' }
  if (match.missing.length) {
    return { adopted: null, why: `code does not carry [${match.missing.join(' ')}] — Figma and code disagree; settle with /figma-pull or /figma-push ${candidate.name}` }
  }
  const adopted = {
    name: candidate.name,
    nodeId: node.id,
    ...(variant ? { variantOf: candidate.nodeId, variant } : {}),
    codeFile: candidate.codeFile,
    lastSynced: today,
    figma: pruneSnapshot(figma),
    code: { classes: match.classes },
  }
  const notes = []
  if (candidate.detectionOnly) notes.push(`detection-only by declaration, anchored on '${candidate.anchor}' — catches Figma-side edits only`)
  else if (match.detectionOnly) notes.push('no binding maps to a class, so this entry catches Figma-side edits only')
  if (unnamed.length) notes.push(`variables not in the id map are tracked by id: ${unnamed.join(', ')}`)
  return { adopted, why: notes.length ? notes.join('; ') : 'Figma and code agree' }
}

export async function fetchNodes(fileKey, ids, token, { depth } = {}) {
  const url = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(ids.join(','))}${depth ? `&depth=${depth}` : ''}`
  const res = await fetch(url, { headers: { 'X-Figma-Token': token } })
  if (!res.ok) throw new Error(`Figma API ${res.status}: ${await res.text()}`)
  return res.json()
}

// Pattern pages (one ❖ page per block, the pattern frame inside it) are checked
// for presence only: the page is still there under its name and still holds
// the frame. `nodes` is a REST nodes response fetched at depth 1. Blocks marked
// missing or declined are counted, never fetched — the offline test
// (figma-pattern-coverage.test.mjs) already made sure each one says why.
export function checkPatterns(patterns, nodes) {
  const inSync = []
  const problems = []
  const skipped = { missing: 0, declined: 0 }
  for (const p of patterns) {
    if (p.status !== 'mirrored') {
      if (p.status in skipped) skipped[p.status]++
      continue
    }
    const doc = nodes?.[p.pageId]?.document
    if (!doc) {
      problems.push(`pattern ${p.block}: page ${p.page} (${p.pageId}) not found in file — was it deleted? Fix the entry in figma/sync-state.json → patterns`)
      continue
    }
    if (doc.name !== p.page) {
      problems.push(`pattern ${p.block}: page ${p.pageId} was renamed ${p.page} → ${doc.name} — update figma/sync-state.json → patterns`)
      continue
    }
    if (!(doc.children ?? []).some((c) => c.id === p.frameId)) {
      problems.push(`pattern ${p.block}: frame ${p.frameId} is no longer on page ${p.page} — rebuild it or update figma/sync-state.json → patterns`)
      continue
    }
    inSync.push(p.block)
  }
  return { inSync, problems, skipped }
}

// Pattern pages, content level: what a designer sees on the frame — visible
// text strings in document order (inside instances too: button labels, input
// placeholders), the icon components used, and the top-level component
// instances — from a REST nodes bundle fetched at full depth. Same shape as
// figma/pattern-baseline.json, first written by a Plugin API read on
// 2026-09-18 and rewritten by `--snapshot-patterns` from REST. Variables are
// left out: the id map is partial, and the atoms above already diff bindings.
const cleanText = (s) => String(s ?? '').replace(/\s+/g, ' ').trim()
export function snapshotPattern(bundle) {
  const comps = bundle.components ?? {}
  const sets = bundle.componentSets ?? {}
  const texts = []
  const icons = []
  const instances = []
  const nameOf = (node) => { const c = comps[node.componentId]; if (!c) return '?'; const s = c.componentSetId && sets[c.componentSetId]; return s ? s.name : c.name }
  const walk = (n, inside) => {
    if (n.visible === false) return
    if (n.type === 'TEXT') { const t = cleanText(n.characters); if (t) texts.push(t) }
    if (n.type === 'INSTANCE') {
      const name = nameOf(n)
      if (name.startsWith('icon/')) icons.push(name.slice(5))
      else if (!inside) instances.push(name)
      inside = true
    }
    for (const c of n.children ?? []) walk(c, inside)
  }
  walk(bundle.document, false)
  return { texts, icons: icons.sort(), instances }
}
export function diffPattern(base, live) {
  const drift = []
  const count = (a) => a.reduce((m, s) => m.set(s, (m.get(s) || 0) + 1), new Map())
  const minus = (a, b) => { const ca = count(a), cb = count(b); return [...ca].filter(([s, n]) => (cb.get(s) || 0) < n).map(([s]) => s) }
  const gone = minus(base.texts, live.texts)
  const added = minus(live.texts, base.texts)
  if (gone.length) drift.push(`text gone: ${gone.map((s) => "'" + s + "'").join(', ')}`)
  if (added.length) drift.push(`text added: ${added.map((s) => "'" + s + "'").join(', ')}`)
  const iconsGone = minus(base.icons, live.icons)
  const iconsAdded = minus(live.icons, base.icons)
  if (iconsGone.length) drift.push(`icon gone: ${iconsGone.join(', ')}`)
  if (iconsAdded.length) drift.push(`icon added: ${iconsAdded.join(', ')}`)
  if (JSON.stringify(base.instances) !== JSON.stringify(live.instances)) drift.push(`instances: [${base.instances}] → [${live.instances}]`)
  return drift
}

function report(line) {
  console.log(line)
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, line + '\n')
}

// Detect mode: exit 1 on any drift (the audit job emails).
// Repair mode (--repair): value-level drift is fixed in place (source file +
// baseline rewritten; the workflow commits and opens the PR); exit 2 only when
// unrepairable drift remains and a human needs /figma-pull or /figma-push.
export async function main({ repair = false, adopt = false, snapshotPatterns = false } = {}) {
  const token = process.env.FIGMA_TOKEN
  if (!token) {
    report('figma-drift: no FIGMA_TOKEN secret — component parity check skipped (add a Figma personal access token with file read scope to enable).')
    return
  }
  const statePath = join(root, 'figma/sync-state.json')
  const state = loadState(statePath)
  const tracked = new Set(state.components.map((c) => c.name))
  const candidates = adopt ? (state.candidates ?? []).filter((c) => !tracked.has(c.name)) : []
  const data = await fetchNodes(state.fileKey, [...state.components.map((c) => c.nodeId), ...candidates.map((c) => c.nodeId)], token)
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
  let adoptedAny = false
  for (const candidate of candidates) {
    const source = readFileSync(join(root, candidate.codeFile), 'utf8')
    const alsoIn = (candidate.alsoIn ?? []).map((f) => readFileSync(join(root, f), 'utf8'))
    const { adopted, why } = adoptCandidate(candidate, data.nodes[candidate.nodeId], state.variables, source, today, alsoIn)
    if (adopted) {
      state.components.push(adopted)
      state.candidates = state.candidates.filter((c) => c.name !== candidate.name)
      adoptedAny = true
      report(`✔ ${candidate.name}: adopted into the parity baseline — ${why}`)
    } else {
      // Staged on purpose: a candidate that disagrees stays listed, never red.
      report(`○ ${candidate.name}: not adopted — ${why}`)
    }
  }
  // Template pages (registry/examples, `templates` in sync-state) are checked exactly like pattern pages.
  const pages_ = [...(state.patterns ?? []), ...(state.templates ?? [])]
  const mirrored = pages_.filter((p) => p.status === 'mirrored')
  if (mirrored.length) {
    const pages = await fetchNodes(state.fileKey, mirrored.map((p) => p.pageId), token, { depth: 1 })
    const { inSync, problems, skipped } = checkPatterns(pages_, pages.nodes)
    for (const problem of problems) report(`✖ ${problem}`)
    if (problems.length) unrepaired = true
    report(`${problems.length ? '✖' : '✔'} patterns: ${inSync.length} of ${mirrored.length} mirrored pages in place · ${skipped.missing} not built yet · ${skipped.declined} declined (figma/sync-state.json → patterns)`)
    // content: every mirrored frame at full depth vs figma/pattern-baseline.json
    const baselinePath = join(root, 'figma/pattern-baseline.json')
    const frames = {}
    for (let i = 0; i < mirrored.length; i += 16) {
      const chunk = mirrored.slice(i, i + 16)
      Object.assign(frames, (await fetchNodes(state.fileKey, chunk.map((p) => p.frameId), token)).nodes)
    }
    if (snapshotPatterns) {
      const out = { $comment: 'Figma-side baseline of every mirrored pattern frame (texts in document order, icon components used, top-level component instances). Rewritten by `node scripts/figma-drift.mjs --snapshot-patterns` from the REST file API; compared against the code-side expectation by scripts/figma-pattern-parity.test.mjs.', syncedAt: today, frames: {} }
      for (const p of mirrored) { const b = frames[p.frameId]; if (b?.document) out.frames[p.block] = { frameId: p.frameId, ...snapshotPattern(b) } }
      writeFileSync(baselinePath, JSON.stringify(out, null, 2) + '\n')
      report(`✔ patterns: baseline rewritten for ${Object.keys(out.frames).length} frames (figma/pattern-baseline.json)`)
    } else if (existsSync(baselinePath)) {
      const baseline = JSON.parse(readFileSync(baselinePath, 'utf8')).frames
      let moved = 0
      for (const p of mirrored) {
        const b = frames[p.frameId]
        if (!b?.document) continue
        const base = baseline[p.block]
        if (!base) { report(`○ pattern ${p.block}: not in figma/pattern-baseline.json yet — run --snapshot-patterns`); continue }
        const drift = diffPattern(base, snapshotPattern(b))
        if (!drift.length) continue
        moved++
        unrepaired = true
        report(`✖ pattern ${p.block}: Figma moved — run /figma-pull ${p.block} (or --snapshot-patterns if the page is right)`)
        for (const d of drift) report(`    ${d}`)
      }
      report(`${moved ? '✖' : '✔'} pattern content: ${mirrored.length - moved} of ${mirrored.length} frames match the baseline`)
    }
  }
  if (repaired || adoptedAny) writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n')
  if (unrepaired) process.exitCode = repair ? 2 : 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main({ repair: process.argv.includes('--repair'), adopt: process.argv.includes('--adopt'), snapshotPatterns: process.argv.includes('--snapshot-patterns') })
}
