/**
 * Read the Paper file back and compare it with the code it was written from.
 *
 * For every story recorded in paper/sync-state.json:
 *   text     the text layers Paper holds, in order, equal the story's visible text
 *   values   a few key layers (first text, first button, first filled surface) carry the
 *            colours, sizes and type the browser computed, with Paper's tokens resolved
 *   picture  Paper's 2x export of the layer against a 2x screenshot of the story, with
 *            the pixel method the Figma visual diff uses; a strip (Paper | Storybook | diff)
 *            is saved per story
 *   stale    the piece's code has changed since it was written into Paper
 *
 *   node scripts/paper/check.mjs [slug …] [--out <dir>] [--base http://localhost:6150]
 *   node scripts/paper/check.mjs --stale        # reads files only: no Paper, no Storybook; exit 1 when stale
 *
 * The full check needs the Paper desktop app open and a Storybook to read.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { PNG } from 'pngjs'
import { comparePngs, flatten, padTo, strip } from '../figma-visual-diff.mjs'
import { connect } from './client.mjs'
import { parseColor, sameColor } from './color.mjs'
import { captureStory, launch, normalizeText, STORYBOOK, visibleTexts } from './convert.mjs'
import { openQuillFile, readState, root } from './file.mjs'
import { PIECES, stalePieces } from './pieces.mjs'
import { firstFamily, resolveTokens } from './tokens.mjs'

export const DEFAULT_OUT = '.superpowers/sdd/2026-10-07-paper'
const SCALE = 2
const SIZE_TOLERANCE = 0.5 // CSS px

// ------------------------------------------------------------------ reading Paper's tree (pure)

/**
 * `get_tree_summary` text → `[{ depth, type, name, id }]` in document order, plus the ids
 * whose children the summary cut off (`... 3 children`), to be asked for again.
 */
export function parseTreeSummary(summary) {
  const nodes = []
  const cut = []
  for (const line of summary.split('\n')) {
    const depth = line.match(/^ */)[0].length / 2
    const node = line.match(/^\s*(\w+) "(.*?)" \(([0-9A-Za-z]+-[0-9A-Za-z]+)\)/)
    if (node) nodes.push({ depth, type: node[1], name: node[2], id: node[3] })
    else if (/^\s*\.\.\. \d+ children/.test(line)) cut.push(nodes.findLast((candidate) => candidate.depth === depth - 1)?.id)
  }
  return { nodes, cut: cut.filter(Boolean) }
}

async function paperTree(file, nodeId) {
  const { nodes, cut } = parseTreeSummary((await file.data('get_tree_summary', { nodeId, depth: 10 })).summary)
  for (const id of cut) {
    const at = nodes.findIndex((node) => node.id === id)
    const deeper = (await paperTree(file, id)).slice(1).map((node) => ({ ...node, depth: node.depth + nodes[at].depth }))
    nodes.splice(at + 1, 0, ...deeper)
  }
  return nodes
}

// ------------------------------------------------------------------ resolving Paper's values (pure)

/** `var(--x)`, `color-mix(in oklab, var(--x) 12%, transparent)` or a literal → `{ r, g, b, a }`. */
export function resolveColor(value, table) {
  if (value === undefined || value === null) return null
  const text = String(value).trim()
  const token = (name) => table.find((entry) => entry.name === name)?.color ?? null
  const alias = text.match(/^var\((--[\w-]+)\)$/)
  if (alias) return token(alias[1])
  const mix = text.match(/^color-mix\((?:in [\w-]+,\s*)?var\((--[\w-]+)\)(?:\s+([\d.]+)%)?,\s*transparent\)$/)
  if (mix) { const base = token(mix[1]); return base ? { ...base, a: base.a * (mix[2] ? Number(mix[2]) / 100 : 0.5) } : null }
  return parseColor(text)
}

/** A length or a token holding one → px. `context.fontSize` turns a line-height ratio into px. */
export function resolveLength(value, table, { fontSize = null } = {}) {
  if (value === undefined || value === null) return null
  const text = String(value).trim()
  const alias = text.match(/^var\((--[\w-]+)\)$/)
  if (alias) {
    const entry = table.find((candidate) => candidate.name === alias[1])
    if (!entry) return null
    if (entry.type === 'lineHeight') return fontSize === null ? null : entry.ratio * fontSize
    if (entry.type === 'letterSpacing') return fontSize === null ? null : entry.em * fontSize
    if (entry.type === 'fontWeight') return entry.weight
    return entry.px
  }
  if (text.endsWith('em') && !text.endsWith('rem')) return fontSize === null ? null : parseFloat(text) * fontSize
  if (text.endsWith('%')) return fontSize === null ? null : (parseFloat(text) / 100) * fontSize
  if (/calc\(infinity/.test(text)) return 9999
  return parseFloat(text)
}

const fourSides = (value, table) => {
  const parts = String(value ?? '0px').split(/\s+/).map((part) => resolveLength(part, table) ?? 0)
  const [top, right = top, bottom = top, left = right] = parts
  return [top, right, bottom, left]
}

/** Compare one Paper layer's styles with the browser's values for the same element. Returns `[{ property, paper, browser, ok }]`. */
export function compareValues(kind, paperStyles, used, table) {
  const rows = []
  const length = (property, paperValue, browserValue, options) => {
    const resolved = resolveLength(paperValue, table, options)
    const wanted = parseFloat(browserValue)
    rows.push({ property, paper: String(paperValue), browser: String(browserValue), ok: resolved !== null && Math.abs(resolved - wanted) <= SIZE_TOLERANCE })
  }
  const color = (property, paperValue, browserValue) => {
    const [paper, browser] = [resolveColor(paperValue, table), parseColor(browserValue)]
    rows.push({ property, paper: String(paperValue), browser: String(browserValue), ok: sameColor(paper, browser, 1.6) || (!paper && browser?.a === 0) })
  }
  if (kind === 'text') {
    const fontSize = parseFloat(used.fontSize)
    color('color', paperStyles.color, used.color)
    length('font-size', paperStyles.fontSize, used.fontSize)
    if (used.lineHeight !== 'normal') length('line-height', paperStyles.lineHeight, used.lineHeight, { fontSize })
    length('font-weight', paperStyles.fontWeight ?? 400, used.fontWeight)
    const family = String(paperStyles.fontFamily ?? '')
    const paperFamily = family.startsWith('var(') ? table.find((entry) => entry.name === family.slice(4, -1))?.family : firstFamily(family)
    rows.push({ property: 'font-family', paper: family, browser: used.fontFamily, ok: paperFamily === firstFamily(used.fontFamily) })
  } else {
    color('background-color', paperStyles.backgroundColor, used.backgroundColor)
    const radius = Math.min(parseFloat(used.borderTopLeftRadius), 9999)
    if (radius > 0 || paperStyles.borderRadius) {
      const paperRadius = resolveLength(String(paperStyles.borderRadius ?? '0px').split(/\s+/)[0], table)
      // a pill is a pill at any radius past half the box
      rows.push({ property: 'border-radius', paper: String(paperStyles.borderRadius), browser: used.borderTopLeftRadius, ok: Math.abs(paperRadius - radius) <= SIZE_TOLERANCE || (paperRadius >= 9999 && radius >= 9999) })
    }
    // Paper reports padding however it stored it: `padding`, the logical pair, or single sides
    const padding = fourSides(paperStyles.padding, table)
    const pair = (value) => { const parts = String(value).split(/\s+/).map((part) => resolveLength(part, table) ?? 0); return [parts[0], parts[1] ?? parts[0]] }
    if (paperStyles.paddingBlock !== undefined) [padding[0], padding[2]] = pair(paperStyles.paddingBlock)
    if (paperStyles.paddingInline !== undefined) [padding[3], padding[1]] = pair(paperStyles.paddingInline)
    ;['Top', 'Right', 'Bottom', 'Left'].forEach((side, index) => {
      const explicit = paperStyles[`padding${side}`]
      const paperSide = explicit !== undefined ? resolveLength(explicit, table) : padding[index]
      const wanted = parseFloat(used[`padding${side}`])
      rows.push({ property: `padding-${side.toLowerCase()}`, paper: `${paperSide}px`, browser: used[`padding${side}`], ok: Math.abs(paperSide - wanted) <= SIZE_TOLERANCE })
    })
    if (parseFloat(used.borderTopWidth) > 0 && used.borderTopStyle !== 'none') {
      length('border-width', paperStyles.borderWidth ?? paperStyles.borderTopWidth ?? 0, used.borderTopWidth)
      color('border-color', paperStyles.borderColor ?? paperStyles.borderTopColor, used.borderTopColor)
    }
  }
  return rows
}

/** The browser-side elements that stand for a piece: its first text, its first button, its first filled surface. */
export function keyNodes(tree) {
  const found = {}
  const walk = (node, parent) => {
    if (typeof node.text === 'string') {
      if (!found.text && normalizeText(node.text, parent.used.whiteSpace).trim()) found.text = parent
      return
    }
    if (!found.button && node.slot === 'button') found.button = node
    if (!found.surface && (parseColor(node.used.backgroundColor)?.a ?? 0) > 0) found.surface = node
    for (const child of node.children ?? []) walk(child, node)
  }
  walk(tree, tree)
  return found
}

// ------------------------------------------------------------------ one story

async function checkSection(file, page, piece, entry, { table, out, base }) {
  const row = { piece: piece.slug, story: entry.story, title: entry.title }
  const { tree, png } = await captureStory(page, entry.story, { base, screenshot: true })
  const nodes = await paperTree(file, entry.nodeId)

  // text: every Text layer's full content (the summary truncates long strings)
  const paperTexts = []
  for (const node of nodes.filter((candidate) => candidate.type === 'Text')) {
    const info = await file.data('get_node_info', { nodeId: node.id })
    paperTexts.push({ id: node.id, text: String(info.textContent ?? '').replace(/\s+/g, ' ').trim() })
  }
  const storyTexts = visibleTexts(tree)
  const mismatch = storyTexts.findIndex((text, index) => text.replace(/\s+/g, ' ') !== paperTexts[index]?.text)
  row.text = {
    ok: mismatch < 0 && storyTexts.length === paperTexts.length,
    story: storyTexts.length,
    paper: paperTexts.length,
    ...(mismatch >= 0 ? { firstDifference: { at: mismatch, story: storyTexts[mismatch], paper: paperTexts[mismatch]?.text ?? null } } : {}),
  }

  // values: pair each key element with the Paper layer in the same position
  const keys = keyNodes(tree)
  const paperIds = {
    text: paperTexts[0]?.id,
    // when the story IS a button, the layer carries the story's name, not `button`
    button: keys.button === tree ? entry.nodeId : nodes.find((node) => node.type === 'Frame' && node.name === 'button')?.id,
  }
  const frames = nodes.filter((node) => node.type === 'Frame').map((node) => node.id)
  const styles = frames.length || paperIds.text ? (await file.data('get_computed_styles', { nodeIds: [...new Set([...frames, paperIds.text].filter(Boolean))] })).styles : {}
  paperIds.surface = frames.find((id) => styles[id]?.backgroundColor)
  row.values = []
  for (const kind of ['text', 'button', 'surface']) {
    if (!keys[kind]) continue
    if (!paperIds[kind]) { row.values.push({ node: kind, property: '(layer)', paper: 'missing', browser: 'present', ok: false }); continue }
    for (const result of compareValues(kind === 'text' ? 'text' : 'frame', styles[paperIds[kind]] ?? {}, keys[kind].used, table)) row.values.push({ node: kind, ...result })
  }
  row.valuesOk = row.values.filter((value) => value.ok).length

  // picture: Paper writes the export into the user's Downloads folder and answers with the path
  const exported = await file.data('export', { pageId: piece.pageId, nodes: { [entry.nodeId]: [{ format: 'png', scale: `${SCALE}x` }] } })
  const exportPath = exported.exports?.[0]?.filePath
  if (!exportPath || !existsSync(exportPath)) throw new Error(`export of ${entry.story} produced no file (${JSON.stringify(exported)})`)
  const paperPng = flatten(PNG.sync.read(readFileSync(exportPath)))
  rmSync(exportPath) // ours: the layer is named after the story, so the file name is unique to this check
  const storybookPng = PNG.sync.read(png)
  const result = comparePngs(paperPng, storybookPng)
  const name = entry.story.replace(/^.*?-(?=[^-]+--)/, '').replace(/[^a-z0-9-]/g, '-')
  const stripPath = join(out, 'strips', `${piece.slug}--${name.split('--')[1]}.png`)
  mkdirSync(join(out, 'strips'), { recursive: true })
  writeFileSync(stripPath, PNG.sync.write(strip(padTo(paperPng, result.diff.width, result.diff.height), padTo(storybookPng, result.diff.width, result.diff.height), result.diff)))
  row.picture = { diffPct: result.diffPct, paper: [paperPng.width / SCALE, paperPng.height / SCALE], storybook: [storybookPng.width / SCALE, storybookPng.height / SCALE], sizeDelta: result.sizeDelta, strip: stripPath.replace(`${root}/`, '') }
  return row
}

// ------------------------------------------------------------------ report

export function renderTable(rows, stale) {
  const lines = ['| piece | story | text | values | picture diff | size Paper → Storybook (CSS px) | code |', '|---|---|---|---|---:|---|---|']
  for (const row of rows) {
    const status = stale.find((entry) => entry.slug === row.piece)?.status ?? '—'
    if (row.error) { lines.push(`| ${row.piece} | ${row.title} | — | — | — | error: ${row.error} | ${status} |`); continue }
    const text = row.text.ok ? `${row.text.paper}/${row.text.story} ✓` : `${row.text.paper}/${row.text.story} ✗`
    lines.push(`| ${row.piece} | ${row.title} | ${text} | ${row.valuesOk}/${row.values.length} | ${row.picture.diffPct.toFixed(2)}% | ${row.picture.paper.join('×')} → ${row.picture.storybook.join('×')} | ${status} |`)
  }
  return lines.join('\n')
}

export async function check({ slugs = [], out = DEFAULT_OUT, base = STORYBOOK, log = console.log } = {}) {
  const state = readState()
  const stale = stalePieces(state)
  const outDir = resolve(root, out)
  const paper = await connect()
  const file = await openQuillFile(paper, { state })
  const table = resolveTokens((await file.data('get_tokens')).tokens)
  const { browser, page } = await launch()
  const rows = []
  try {
    for (const piece of state.pieces.filter((entry) => !slugs.length || slugs.includes(entry.slug))) {
      for (const entry of piece.sections) {
        try {
          rows.push(await checkSection(file, page, piece, entry, { table, out: outDir, base }))
        } catch (error) {
          rows.push({ piece: piece.slug, story: entry.story, title: entry.title, error: error.message })
        }
      }
    }
  } finally {
    await browser.close()
  }
  const report = { at: new Date().toISOString(), file: state.file, platform: process.platform, stale, rows }
  writeFileSync(join(root, 'paper/check-report.json'), JSON.stringify(report, null, 1) + '\n')
  log(renderTable(rows, stale))
  for (const row of rows) for (const value of row.values?.filter((entry) => !entry.ok) ?? []) log(`  ✗ ${row.piece} / ${row.title} · ${value.node} ${value.property}: Paper ${value.paper} · browser ${value.browser}`)
  for (const row of rows) if (row.text && !row.text.ok) log(`  ✗ ${row.piece} / ${row.title} · text ${JSON.stringify(row.text.firstDifference ?? { story: row.text.story, paper: row.text.paper })}`)
  return report
}

export function reportStale(log = console.log) {
  const stale = stalePieces(readState())
  for (const entry of stale) log(`${entry.status.padEnd(12)} ${entry.slug}${entry.status === 'stale' ? `  (code ${entry.now}, Paper has ${entry.recorded} from ${entry.syncedAt}): node scripts/paper/sync-pieces.mjs ${entry.slug}` : ''}`)
  return stale
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2)
  const option = (flag, fallback) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : fallback)
  if (args.includes('--stale')) process.exit(reportStale().some((entry) => entry.status !== 'in step') ? 1 : 0)
  const [out, base] = [option('--out', DEFAULT_OUT), option('--base', STORYBOOK)]
  const slugs = args.filter((arg) => !arg.startsWith('--') && arg !== out && arg !== base)
  const unknown = slugs.filter((slug) => !PIECES.some((piece) => piece.slug === slug))
  if (unknown.length) { console.error(`not in scripts/paper/pieces.mjs: ${unknown.join(', ')}`); process.exit(1) }
  try {
    await check({ slugs, out, base })
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
