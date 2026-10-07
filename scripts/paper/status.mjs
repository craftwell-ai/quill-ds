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
 * Always exits 0: a stale piece is a to-do for whoever has Paper open, not a failure.
 */
import { pathToFileURL } from 'node:url'
import { tokensHash } from '../figma-stamp.mjs'
import { readState } from './file.mjs'
import { inventory, statusOf } from './pieces.mjs'

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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) console.log(renderStatus(status()))
