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

const COMMENT = 'What scripts/paper/* has written into the Paper file "Quill Design System", and from which code. `tokens` is the last token push (payloadHash = the values sent, sourceHash = src/tokens/quill.tokens.mjs at that moment). `pieces` has one entry per artboard: the story it was converted from, where it lives in Paper, sourceHash (the code behind it, comments and whitespace ignored: scripts/paper/check.mjs --stale reports a piece whose code has moved since) and htmlHash (the HTML written). Paper has no components, so every piece is plain frames: nothing here is an instance of anything.'

export const today = () => new Date().toISOString().slice(0, 10)
export const digest = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16)

export function readState(path = STATE_PATH) {
  if (!existsSync(path)) return { $comment: COMMENT, file: null, pages: {}, tokens: null, pieces: [] }
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function writeState(state, path = STATE_PATH) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify({ ...state, $comment: COMMENT }, null, 2) + '\n')
}

/** Replace the entry with the same name, or append: a re-run updates a piece in place. */
export function upsertPiece(state, entry) {
  const pieces = state.pieces.filter((piece) => piece.name !== entry.name)
  const at = state.pieces.findIndex((piece) => piece.name === entry.name)
  pieces.splice(at < 0 ? pieces.length : at, 0, entry)
  return { ...state, pieces }
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

/**
 * Make sure the named pages exist; returns `{ pages: { name: id }, order: [names as Paper lists them] }`.
 *
 * Paper has no "move page" tool and puts a new page directly after the page being viewed
 * in that file (verified; normally the first page, Foundations). So missing pages are
 * created last-to-first, which leaves them in the wanted order. The file's untouched first
 * page (`Page 1`) becomes Foundations rather than being left behind: nothing can delete it.
 */
export async function ensurePages(file, wanted) {
  let info = await file.data('get_basic_info')
  const names = () => new Map(info.pages.map((page) => [page.name, page.id]))
  const blank = info.pages.find((page) => /^Page \d+$/.test(page.name))
  if (wanted.includes(FOUNDATIONS) && !names().has(FOUNDATIONS) && blank) {
    await file.call('rename_pages', { updates: [{ pageId: blank.id, name: FOUNDATIONS }] })
    info = await file.data('get_basic_info')
  }
  const missing = wanted.filter((name) => !names().has(name))
  for (const name of [...missing].reverse()) await file.call('create_page', { name })
  if (missing.length) info = await file.data('get_basic_info')
  const pages = names()
  return { pages: Object.fromEntries(wanted.map((name) => [name, pages.get(name)])), order: info.pages.map((page) => page.name), created: missing }
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
 * `split` forces the child-at-a-time form at the top. Returns the new top node's id and the
 * number of calls made.
 */
export async function writeTree(file, serialize, node, parentId, { split = false, placeholders = [] } = {}) {
  const html = serialize(node)
  const whole = !node.children?.length || node.raw || (!split && html.length <= WHOLE)
  const shell = whole ? html : serialize(node, { children: false }).replace(/<\/(\w+)>$/, `${PLACEHOLDER}</$1>`)
  const written = await file.data('write_html', { targetNodeId: parentId, mode: 'insert-children', html: shell })
  const id = written.createdNodes?.[0]?.id
  if (!id) throw new PaperError(`write_html created nothing for ${html.slice(0, 80)}…`)
  let calls = 1
  if (!whole) {
    placeholders.push(written.createdNodes[1].id)
    // a wrapper with a single child would otherwise hand the whole piece on in one call
    for (const child of node.children) calls += (await writeTree(file, serialize, child, id, { split: node.children.length === 1, placeholders })).calls
  }
  return { id, calls }
}
