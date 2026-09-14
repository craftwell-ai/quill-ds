import { test } from 'node:test'
import assert from 'node:assert/strict'

import { decide, settledList, COMMAND, SETTLE_MS } from './dependabot-unstick.mjs'

const NOW = Date.parse('2026-09-14T12:00:00Z')
const ago = (ms) => new Date(NOW - ms).toISOString()
const dependabot = { authors: [{ login: 'dependabot[bot]' }] }
const actions = { authors: [{ login: 'github-actions[bot]' }] }
const pr = (overrides) => ({
  number: 1,
  mergeStateStatus: 'BEHIND',
  commits: [{ ...dependabot, committedDate: ago(2 * SETTLE_MS) }, { ...actions, committedDate: ago(2 * SETTLE_MS) }],
  comments: [],
  ...overrides,
})

test('a BEHIND branch with a non-Dependabot commit on it gets a recreate request', () => {
  // The exact #135 shape: dependabot-regenerate pushed, main moved, nobody rebases.
  const d = decide(pr(), NOW)
  assert.equal(d.action, 'recreate')
  assert.match(d.why, /BEHIND after a non-Dependabot push/)
})

test('a DIRTY branch gets a recreate request even when every commit is Dependabot\'s', () => {
  // The #162 shape: recreated once, then conflicting again after a release day.
  const d = decide(pr({ mergeStateStatus: 'DIRTY', commits: [{ ...dependabot, committedDate: ago(SETTLE_MS * 3) }] }), NOW)
  assert.equal(d.action, 'recreate')
  assert.equal(d.why, 'DIRTY')
})

test('a clean, blocked or unknown branch is left alone', () => {
  for (const s of ['CLEAN', 'BLOCKED', 'UNSTABLE', 'UNKNOWN', undefined]) {
    assert.equal(decide(pr({ mergeStateStatus: s }), NOW).action, 'skip', `state ${s}`)
  }
})

test('a head commit still inside the settle window is left alone', () => {
  const d = decide(pr({ commits: [{ ...actions, committedDate: ago(SETTLE_MS / 2) }] }), NOW)
  assert.equal(d.action, 'skip')
  assert.match(d.why, /settling/)
})

test('a recreate already requested since the last commit is not repeated', () => {
  const asked = pr({ comments: [{ body: `${COMMAND}\n\nasked earlier`, createdAt: ago(SETTLE_MS) }] })
  assert.equal(decide(asked, NOW).action, 'skip')
  // …but a request older than the head commit is stale: Dependabot acted, and it stuck again.
  const stale = pr({ comments: [{ body: COMMAND, createdAt: ago(5 * SETTLE_MS) }] })
  assert.equal(decide(stale, NOW).action, 'recreate')
})

test('the listing is polled while GitHub still reports UNKNOWN, then acted on', async () => {
  // The first live run fired seconds after a push to main and saw every PR as
  // UNKNOWN — mergeability is recomputed lazily, so the first answer is no answer.
  const answers = [[pr({ mergeStateStatus: 'UNKNOWN' })], [pr({ mergeStateStatus: 'UNKNOWN' })], [pr({ mergeStateStatus: 'DIRTY' })]]
  const naps = []
  const prs = await settledList(() => answers.shift(), { retries: 8, waitMs: 15, sleep: async (ms) => naps.push(ms) })
  assert.deepEqual(prs.map((p) => p.mergeStateStatus), ['DIRTY'])
  assert.deepEqual(naps, [15, 15])
})

test('polling stops at its budget and leaves a still-UNKNOWN PR to the next run', async () => {
  let listings = 0
  const naps = []
  const prs = await settledList(() => (listings++, [pr({ mergeStateStatus: 'UNKNOWN' })]), { retries: 3, waitMs: 1, sleep: async (ms) => naps.push(ms) })
  assert.equal(listings, 4)
  assert.equal(naps.length, 3)
  assert.equal(decide(prs[0], NOW).action, 'skip')
})

test('a listing with every state known is not polled at all', async () => {
  const naps = []
  await settledList(() => [pr(), pr({ mergeStateStatus: 'CLEAN' })], { sleep: async (ms) => naps.push(ms) })
  assert.equal(naps.length, 0)
})
