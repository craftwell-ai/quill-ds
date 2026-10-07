/**
 * The one Paper file the sync is allowed to touch, and the record of what is in it.
 *
 * Every write goes through `openQuillFile`, which finds the file by its exact name and
 * then checks, on each answer, that Paper really acted on that file: the team holds other
 * design work and a script must never land in it.
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PaperError } from './client.mjs'

export const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
export const FILE_NAME = 'Quill Design System'
export const STATE_PATH = join(root, 'paper/sync-state.json')
export const FOUNDATIONS = 'Foundations'

const COMMENT = 'The record of what scripts/paper/* has written into the Paper file "Quill Design System", and from which code. Written by `npm run paper:sync`; never edit by hand. The shape is documented in paper/README.md.'

export const today = () => new Date().toISOString().slice(0, 10)
export const digest = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16)

export function readState(path = STATE_PATH) {
  if (!existsSync(path)) return { $comment: COMMENT, file: null, pages: {}, tokens: null, foundations: null, pieces: [] }
  const state = JSON.parse(readFileSync(path, 'utf8'))
  // entries written before `status` existed were all drawn pages
  return { ...state, pieces: (state.pieces ?? []).map((piece) => ({ ...piece, status: piece.status ?? (piece.artboardId ? 'synced' : 'pending') })) }
}

const KIND_RANK = ['component', 'block', 'template']
const TOP_KEYS = ['$comment', 'file', 'tokens', 'foundations', 'pages', 'pieces']
export const PIECE_KEYS = ['slug', 'name', 'kind', 'status', 'reason', 'error', 'page', 'pageId', 'artboardId', 'sources', 'sourceHash', 'syncedAt', 'counts', 'notes', 'lost', 'stories']

/** Keys in a fixed order, pieces in page order: the same content always writes the same bytes, so a diff shows only what changed. */
export function orderState(state) {
  const pick = (object, keys) => Object.fromEntries([...keys.filter((key) => object[key] !== undefined && object[key] !== null).map((key) => [key, object[key]]), ...Object.keys(object).filter((key) => !keys.includes(key)).sort().map((key) => [key, object[key]])])
  const pieces = [...(state.pieces ?? [])].sort((a, b) => KIND_RANK.indexOf(a.kind) - KIND_RANK.indexOf(b.kind) || a.name.localeCompare(b.name)).map((piece) => pick(piece, PIECE_KEYS))
  return pick({ ...state, $comment: COMMENT, pieces }, TOP_KEYS)
}

export function writeState(state, path = STATE_PATH) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(orderState(state), null, 2) + '\n')
}

/** Replace the entry with the same slug, or add it: a re-run updates a piece in place. */
export function upsertPiece(state, entry) {
  return { ...state, pieces: [...state.pieces.filter((piece) => piece.slug !== entry.slug), entry] }
}

/**
 * Find (or, with `create`, make) the Quill file and return a handle bound to it.
 * `file.call(tool, args)` adds the file id and refuses an answer from any other file.
 */
export async function openQuillFile(paper, { create = false, state = readState() } = {}) {
  const listing = await paper.call('list_resources', { limit: 200 })
  const matches = listing.resources.filter((resource) => resource.type === 'file' && resource.name === FILE_NAME)
  if (matches.length > 1) throw new PaperError(`${matches.length} Paper files are named "${FILE_NAME}": remove the duplicates by hand, the sync will not guess`)
  let fileId = matches[0]?.id
  if (state.file?.id && fileId && state.file.id !== fileId) throw new PaperError(`paper/sync-state.json points at file ${state.file.id} but "${FILE_NAME}" is ${fileId}: fix the record before syncing`)
  if (!fileId) {
    if (!create) throw new PaperError(`no Paper file named "${FILE_NAME}" in team "${listing.teamName}": run sync-tokens.mjs with --create-file`)
    fileId = (await paper.call('create_file', { name: FILE_NAME })).fileId
  }
  // A file must be open as a tab before its nodes can be written. Opening does not bring it to the front.
  const opened = await paper.call('open_file', { fileId })
  if (opened.fileName !== FILE_NAME) throw new PaperError(`opened "${opened.fileName}", expected "${FILE_NAME}"`)

  const call = async (tool, args = {}) => {
    const result = await paper.callFull(tool, { ...args, fileId })
    if (result.header && result.header.file.id !== fileId) throw new PaperError(`${tool} answered for file ${result.header.file.id}, not ${fileId}`, { tool })
    return result
  }
  return { fileId, name: FILE_NAME, url: `https://app.paper.design/file/${fileId}`, call, data: async (tool, args) => (await call(tool, args)).data }
}

export const UNUSED = /^\(unused( \d+)?\)$/

/**
 * Work out how to get the file's pages into the wanted order. Paper cannot move or delete
 * a page, so the order is fixed by position: the page in slot i is renamed to the i-th
 * wanted name, and an artboard that lives on another page is moved to the page that now
 * carries its name. Pure: `current` is Paper's page list in order, `owners` maps a page
 * name to the artboard ids that belong under it.
 */
export function planPages(current, wanted, owners = {}) {
  const create = Math.max(0, wanted.length - current.length)
  const slots = [...current.map((page) => ({ ...page })), ...Array.from({ length: create }, (_, index) => ({ id: null, name: null, fresh: index }))]
  const renames = []
  const assigned = {}
  slots.forEach((slot, index) => {
    const name = index < wanted.length ? wanted[index] : slot.name && UNUSED.test(slot.name) ? slot.name : `(unused ${index - wanted.length + 1})`
    assigned[name] = slot
    if (slot.name !== name) renames.push({ slot: index, pageId: slot.id, from: slot.name, to: name })
  })
  const byName = new Map(current.map((page) => [page.name, page.id]))
  const moves = []
  for (const [name, artboards] of Object.entries(owners)) {
    const from = byName.get(name)
    const to = assigned[name]
    if (!to || !from || to.id === from) continue
    for (const artboardId of artboards) moves.push({ artboardId, name, from, toSlot: slots.indexOf(to) })
  }
  return { create, renames, moves, inOrder: !create && !renames.length }
}

/**
 * Put the file's pages in the wanted order; returns `{ pages: { name: id }, order, changed }`.
 * Works wherever Paper happened to insert new pages (it puts one after whichever page the
 * owner is looking at), and reads the list back at the end rather than trusting itself.
 */
export async function arrangePages(file, wanted, owners = {}, log = () => {}) {
  let info = await file.data('get_basic_info')
  const plan = planPages(info.pages, wanted, owners)
  if (!plan.inOrder) {
    for (let index = 0; index < plan.create; index++) await file.call('create_page', { name: `(new ${index + 1})` })
    if (plan.create) info = await file.data('get_basic_info')
    const slotId = (slot) => info.pages[slot].id
    if (plan.moves.length) {
      // an artboard moved to another page keeps its id, so the record stays true
      await file.call('move_nodes', { moves: plan.moves.map((move) => ({ nodeId: move.artboardId, parentId: `root_node_${slotId(move.toSlot)}` })) })
      await file.call('update_styles', { updates: [{ nodeIds: plan.moves.map((move) => move.artboardId), styles: { left: '0px', top: '0px' } }] })
    }
    const updates = plan.renames.map((rename) => ({ pageId: slotId(rename.slot), name: rename.to }))
    for (let start = 0; start < updates.length; start += 50) await file.call('rename_pages', { updates: updates.slice(start, start + 50) })
    log(`pages: ${plan.create} created · ${plan.renames.length} renamed · ${plan.moves.length} artboards moved to their page`)
    info = await file.data('get_basic_info')
  }
  const order = info.pages.map((page) => page.name)
  const pages = Object.fromEntries(info.pages.filter((page) => wanted.includes(page.name)).map((page) => [page.name, page.id]))
  return { pages, order, inOrder: wanted.every((name, index) => order[index] === name), changed: !plan.inOrder, unused: order.filter((name) => UNUSED.test(name)) }
}

/**
 * The page's one artboard, by name: reused when it exists (so its id, and any link a
 * designer made to it, survives a re-sync), emptied, and handed back ready to fill.
 */
export async function ensureArtboard(file, { pageId, name, styles, knownId = null }) {
  const info = await file.data('get_basic_info', { pageId })
  const existing = info.artboards.find((artboard) => artboard.id === knownId) ?? info.artboards.find((artboard) => artboard.name === name)
  if (!existing) return { id: (await file.data('create_artboard', { pageId, name, styles })).id, created: true }
  const children = (await file.data('get_children', { nodeId: existing.id })).children ?? []
  if (children.length) await file.call('delete_nodes', { nodeIds: children.map((child) => child.id) })
  await file.call('update_styles', { updates: [{ nodeIds: [existing.id], styles }] })
  if (existing.name !== name) await file.call('rename_nodes', { updates: [{ nodeId: existing.id, name }] })
  return { id: existing.id, created: false }
}

const WHOLE = 4000 // characters of HTML sent in one call before a subtree is written a child at a time
const PLACEHOLDER = '<span layer-name="…">…</span>'

/**
 * Write a node tree under `parentId`. Paper asks for small, incremental writes: a subtree
 * goes in one call when it is small, otherwise its frame is written first and its children
 * follow one call each. A frame cannot go in empty (Paper turns a childless div into a
 * Rectangle, which refuses children), so it is written holding a one-character placeholder;
 * the ids of those are collected in `placeholders` for the caller to delete in one batch.
 * `split` forces the child-at-a-time form at the top (`splitChildren` one level further).
 * Returns the new top node's id (null when Paper drew nothing for it), its children's ids when it
 * was split, and the number of calls.
 */
export async function writeTree(file, serialize, node, parentId, { split = false, splitChildren = false, placeholders = [] } = {}) {
  const html = serialize(node)
  const whole = !node.children?.length || node.raw || (!split && html.length <= WHOLE)
  const shell = whole ? html : serialize(node, { children: false }).replace(/<\/(\w+)>$/, `${PLACEHOLDER}</$1>`)
  const written = await file.data('write_html', { targetNodeId: parentId, mode: 'insert-children', html: shell })
  const id = written.createdNodes?.[0]?.id
  // Paper makes no layer for a box that draws nothing (an empty, transparent hit area): nothing to write, nothing
  // lost. The caller decides whether a missing layer matters (it does for a whole story).
  if (!id) return { id: null, calls: 1, childIds: [] }
  let calls = 1
  const childIds = []
  if (!whole) {
    placeholders.push(written.createdNodes[1].id)
    for (const child of node.children) {
      // a wrapper with a single child would otherwise hand the whole piece on in one call
      const result = await writeTree(file, serialize, child, id, { split: node.children.length === 1 || splitChildren, placeholders })
      calls += result.calls
      childIds.push(result.id)
    }
  }
  return { id, calls, childIds }
}
