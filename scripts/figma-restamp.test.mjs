import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { loadState } from './figma-drift.mjs'
import { blockHash, tokensHash, STAMP_COMMAND } from './figma-stamp.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// Does the code still match what Figma was last synced against?
//
// Pushing to Figma can never be automated (no headless node-write API on any
// plan), so the only way drift stays at zero is to make the Figma update part
// of the PR. Each mirrored pattern records the hash of its block source at the
// last sync; the token source records its hash at the last foundations sync.
// Change either without re-syncing and this fails, naming what to do — the
// same shape as the version + CHANGELOG invariant. A page not yet rebuilt to
// the current recipe says so with `stale`, which is reported, never silent.

const state = loadState()
const mirrored = state.patterns.filter((p) => p.status === 'mirrored')

test('every mirrored pattern is either stamped or declared stale, never both, never neither', () => {
  for (const p of mirrored) {
    const stamped = typeof p.codeHash === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.syncedAt ?? '')
    const stale = typeof p.stale === 'string' && p.stale.trim().length > 0
    assert.ok(stamped !== stale, `${p.block}: needs codeHash + syncedAt (synced) or stale: <reason> (not yet rebuilt) — has ${stamped ? 'both' : 'neither'}`)
  }
})

test('a stamped block has not changed since its Figma page was synced', () => {
  const failures = []
  for (const p of mirrored) {
    if (!p.codeHash) continue
    const now = blockHash(readFileSync(join(root, 'registry/blocks', `${p.block}.tsx`), 'utf8'))
    if (now !== p.codeHash) failures.push(`${p.block} changed since ${p.page} was synced on ${p.syncedAt}`)
  }
  assert.deepEqual(failures, [], `Blocks moved without their Figma page:\n  ${failures.join('\n  ')}\nUpdate the page (/figma-push <block>), then re-stamp: ${STAMP_COMMAND} --block <name>`)
})

test('the token source has not changed since the Figma variables were synced', () => {
  assert.ok(state.foundations?.tokensHash, 'figma/sync-state.json needs foundations.tokensHash — run the foundations sync, then ' + STAMP_COMMAND + ' --tokens')
  assert.equal(
    tokensHash(),
    state.foundations.tokensHash,
    `src/tokens/quill.tokens.mjs changed since the Figma variables were synced on ${state.foundations.syncedAt}. Re-run the foundations sync (figma/README.md), then ${STAMP_COMMAND} --tokens`,
  )
})

test('the block hash ignores comments and whitespace, so a JSDoc-only change does not trip the guard', () => {
  const a = 'import x from "y"\n/** Doc one. */\nexport function A() {\n  return <div className="p-4">Hi</div>\n}\n'
  const b = 'import x from "y"\n/** Doc two — reworded. */\nexport function A() {\n  return <div className="p-4">Hi</div>   // trailing note\n}\n\n'
  const c = a.replace('p-4', 'p-6')
  assert.equal(blockHash(a), blockHash(b))
  assert.notEqual(blockHash(a), blockHash(c))
})

test('the stale list only names pages that are still mirrored, and reads as a shrinking list', () => {
  const stale = mirrored.filter((p) => p.stale)
  for (const p of stale) assert.ok(p.page && p.pageId, `${p.block}: stale entries stay mirrored (page + ids) until rebuilt`)
  assert.ok(stale.length <= 22, `stale list grew to ${stale.length} — rebuild pages, do not add to it`)
})
