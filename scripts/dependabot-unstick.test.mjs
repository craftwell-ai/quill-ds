import { test } from 'node:test'
import assert from 'node:assert/strict'

import { decide, COMMAND, SETTLE_MS } from './dependabot-unstick.mjs'

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
