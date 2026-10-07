/**
 * `npm run paper:status`: where every piece stands, from files alone. No Paper, no
 * Storybook, no network: it compares paper/sync-state.json with the code on disk.
 *
 *   in step    drawn in Paper from the code as it is now
 *   stale      drawn, but its code has changed since     → npm run paper:sync
 *   pending    never drawn                               → npm run paper:sync
 *   error      the last sync failed for it               → read the message, fix, sync again
 *   declined   has no page, with the reason
 *
 *   npm run paper:status -- --record-pending   # add a `pending` entry for each new piece (no Paper needed)
 *
 * Always exits 0: a stale piece is a to-do for whoever has Paper open, not a failure.
 */
import { pathToFileURL } from 'node:url'
import { tokensHash } from '../figma-stamp.mjs'
import { readState, writeState } from './file.mjs'
import { inventory, pageName, statusOf } from './pieces.mjs'

export function status(state = readState(), pieces = inventory()) {
  const rows = statusOf(state, pieces)
  const by = (name) => rows.filter((row) => row.status === name)
  const tokens = !state.tokens ? 'pending' : state.tokens.sourceHash === tokensHash() ? 'in step' : 'stale'
  return { rows, tokens, counts: Object.fromEntries(['in step', 'stale', 'pending', 'error', 'declined'].map((name) => [name, by(name).length])) }
}

export function renderStatus({ rows, tokens, counts }) {
  const lines = [`Paper file: ${rows.length} pieces · ${Object.entries(counts).map(([name, count]) => `${count} ${name}`).join(' · ')} · tokens ${tokens}`]
  const list = (name, describe) => { const found = rows.filter((row) => row.status === name); if (found.length) lines.push('', `${name} (${found.length})`, ...found.map((row) => `  ${row.page.padEnd(28)} ${describe(row)}`)) }
  list('stale', (row) => `code changed since ${row.syncedAt}`)
  list('pending', () => 'not drawn yet')
  list('error', (row) => row.reason ?? '')
  list('declined', (row) => row.reason)
  const todo = counts.stale + counts.pending + counts.error + (tokens === 'in step' ? 0 : 1)
  lines.push('', todo ? 'To bring Paper in step: open Paper, then  npm run paper:sync' : 'Everything drawn in Paper matches the code.')
  return lines.join('\n')
}

/**
 * `-- --record-pending`: give every piece that has no entry a `pending` one (and drop entries whose code is
 * gone), without Paper. For when a piece is added on a machine that cannot draw it; the CI check asks for this.
 */
export function recordPending(state = readState(), pieces = inventory()) {
  const known = new Set(state.pieces.map((entry) => entry.slug))
  const added = pieces.filter((piece) => !known.has(piece.slug))
  const kept = state.pieces.filter((entry) => pieces.some((piece) => piece.slug === entry.slug))
  return { state: { ...state, pieces: [...kept, ...added.map((piece) => (piece.config.declined ? { slug: piece.slug, name: piece.name, kind: piece.kind, status: 'declined', reason: piece.config.declined } : { slug: piece.slug, name: piece.name, kind: piece.kind, status: 'pending', page: pageName(piece) }))] }, added: added.map((piece) => piece.slug), removed: state.pieces.length - kept.length }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--record-pending')) {
    const result = recordPending()
    writeState(result.state)
    console.log(`recorded as pending: ${result.added.join(', ') || 'nothing new'}${result.removed ? ` · removed ${result.removed} entr${result.removed === 1 ? 'y' : 'ies'} whose code is gone` : ''}\n`)
  }
  console.log(renderStatus(status()))
}
