/**
 * Write Quill pieces into the Paper file "Quill Design System": one page per piece, one
 * artboard per page, a header and one section per story (see ./pieces.mjs and ./page.mjs).
 *
 * Each story is rendered in Storybook, converted to Paper-safe HTML (./convert.mjs) and
 * written a group at a time. Running it again rewrites the artboard's contents in place:
 * the page and the artboard keep their ids, nothing is duplicated.
 *
 *   node scripts/paper/sync-pieces.mjs [slug …] [--base http://localhost:6150]
 *
 * Needs the Paper desktop app open and a Storybook to read (npx storybook dev -p 6150 --ci).
 */
import { pathToFileURL } from 'node:url'
import { connect } from './client.mjs'
import { convertStory, launch, quillTokenTable, serialize, STORYBOOK } from './convert.mjs'
import { digest, ensureArtboard, ensurePages, FOUNDATIONS, openQuillFile, readState, today, upsertPiece, writeState, writeTree } from './file.mjs'
import { artboardStyles, header, section } from './page.mjs'
import { KINDS, pageName, pageOrder, pieceLayerName, PIECES, sourceHash, storyTitle, summaryOf } from './pieces.mjs'

async function storyNames(base) {
  try {
    const index = await (await fetch(`${base}/index.json`)).json()
    return (storyId) => index.entries?.[storyId]?.name ?? storyTitle(storyId)
  } catch {
    throw new Error(`no Storybook at ${base}: start one with  npx storybook dev -p 6150 --ci --quiet`)
  }
}

export async function syncPieces({ slugs = [], base = STORYBOOK, log = console.log } = {}) {
  const pieces = slugs.length ? PIECES.filter((piece) => slugs.includes(piece.slug)) : PIECES
  const unknown = slugs.filter((slug) => !PIECES.some((piece) => piece.slug === slug))
  if (unknown.length) throw new Error(`not in scripts/paper/pieces.mjs: ${unknown.join(', ')}`)
  const titleOf = await storyNames(base)
  const paper = await connect()
  let state = readState()
  const file = await openQuillFile(paper, { state })
  // every piece's page, not just the ones being written: page order is fixed at creation
  const wanted = [FOUNDATIONS, ...pageOrder()]
  const { pages, order } = await ensurePages(file, wanted)
  if (order.join('|') !== wanted.join('|')) log(`note: Paper lists the pages as ${order.join(', ')} (wanted ${wanted.join(', ')}); pages cannot be reordered by script`)
  state = { ...state, pages }

  const tokenTable = quillTokenTable()
  const { browser, page } = await launch()
  const results = []
  try {
    for (const piece of pieces) {
      const started = Date.now()
      const pageId = pages[pageName(piece)]
      const previous = state.pieces.find((entry) => entry.slug === piece.slug)

      // Convert first: if a story fails to render, the page in Paper is left as it was.
      const converted = []
      for (const storyId of piece.stories) converted.push({ storyId, title: titleOf(storyId), ...await convertStory(page, storyId, { base, tokenTable }) })

      const artboard = await ensureArtboard(file, { pageId, name: piece.name, styles: artboardStyles(), knownId: previous?.artboardId })
      const placeholders = []
      let calls = (await writeTree(file, serialize, header(KINDS[piece.kind].eyebrow, piece.name, await summaryOf(piece)), artboard.id)).calls
      const sections = []
      for (const story of converted) {
        const shell = await writeTree(file, serialize, section(story.title), artboard.id)
        // a unique layer name per story: a designer can find it, and an export of it gets a file name of its own
        const written = await writeTree(file, serialize, { ...story.root, name: pieceLayerName(piece, story.storyId) }, shell.id, { split: true, placeholders })
        calls += shell.calls + written.calls
        sections.push({
          story: story.storyId,
          title: story.title,
          nodeId: written.id,
          size: [story.size.width, story.size.height],
          htmlHash: digest(story.html),
          nodes: story.stats.nodes,
          approximated: story.stats.approximated,
          bound: story.stats.bound,
          bindable: story.stats.bindable,
          bindingRate: story.stats.bindingRate,
        })
        results.push({ piece: piece.slug, ...story })
      }
      if (placeholders.length) { await file.call('delete_nodes', { nodeIds: placeholders }); calls++ }
      await file.call('finish_working_on_nodes', { nodeIds: [artboard.id] })

      const seconds = Math.round((Date.now() - started) / 100) / 10
      state = upsertPiece(state, {
        slug: piece.slug,
        name: piece.name,
        kind: piece.kind,
        page: pageName(piece),
        pageId,
        artboardId: artboard.id,
        sources: piece.sources,
        sourceHash: sourceHash(piece),
        syncedAt: today(),
        sections,
      })
      writeState(state)
      const total = (key) => sections.reduce((sum, entry) => sum + entry[key], 0)
      log(`${pageName(piece).padEnd(24)} ${String(sections.length).padStart(2)} stories · ${String(total('nodes')).padStart(4)} nodes · ${String(total('approximated')).padStart(2)} approximated · ${Math.round((total('bound') / Math.max(1, total('bindable'))) * 100)}% bound · ${calls} writes · ${seconds}s${artboard.created ? ' · new artboard' : ''}`)
    }
  } finally {
    await browser.close()
    // never leave Paper's "an agent is working here" marker on, even after a failure
    await file.call('finish_working_on_nodes').catch(() => {})
  }
  return { state, results }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2)
  const base = args.includes('--base') ? args[args.indexOf('--base') + 1] : STORYBOOK
  try {
    await syncPieces({ slugs: args.filter((arg) => !arg.startsWith('--') && arg !== base), base })
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
