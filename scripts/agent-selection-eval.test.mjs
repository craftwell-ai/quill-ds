import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'

import { CASES, acceptedPicks } from './agent-selection-cases.mjs'
import { parsePick, promptFor, BEFORE_REF } from './agent-selection-eval.mjs'
import { ALL_USAGE } from '../src/usage/index.mjs'

// The eval itself is a paid model run and stays out of CI; these keep its
// inputs honest so a renamed or retired component cannot quietly break it.

test('every right answer in the eval still has a usage guide', () => {
  const names = new Set(ALL_USAGE.map((u) => u.name))
  for (const c of CASES) {
    for (const pick of acceptedPicks(c)) {
      if (pick === 'none') continue
      assert.ok(names.has(pick), `case '${c.id}' expects '${pick}', which has no usage guide`)
    }
  }
})

test('the eval has about twenty distinct cases, and each describes the job, not the component', () => {
  assert.ok(CASES.length >= 20, `only ${CASES.length} cases`)
  assert.equal(new Set(CASES.map((c) => c.id)).size, CASES.length, 'duplicate case ids')
  for (const c of CASES) {
    for (const pick of acceptedPicks(c)) {
      if (pick === 'none') continue
      // Whole-word match, so 'switch' in "switches" still fails but 'alert' in "alerts" is caught too.
      assert.doesNotMatch(c.request.toLowerCase(), new RegExp(`\\b${pick.replace(/-/g, '[- ]')}\\b`), `case '${c.id}' names its own answer '${pick}'`)
    }
  }
  assert.ok(CASES.some((c) => c.expect === 'none'), 'no case tests the "nothing fits" rule')
})

test('parsePick reads the last PICK line in any of the forms an agent writes', () => {
  assert.equal(parsePick('I would use this.\nPICK: alert-dialog'), 'alert-dialog')
  assert.equal(parsePick('PICK: `@quill/stat-cards`'), 'stat-cards')
  assert.equal(parsePick('PICK: Login-Minimal'), 'login-minimal')
  assert.equal(parsePick('first PICK: dialog then PICK: sheet'), 'sheet')
  assert.equal(parsePick('PICK: none'), 'none')
  assert.equal(parsePick('no pick here'), null)
})

test('the prompt asks for a pick without naming a component', () => {
  const prompt = promptFor(CASES[0])
  assert.match(prompt, /PICK: <name>/)
  assert.match(prompt, /PICK: none/)
  assert.ok(prompt.startsWith(CASES[0].request))
})

// CI checks out one commit with no tags, so this runs where the eval does: locally.
const hasBeforeRef = (() => {
  try { execFileSync('git', ['rev-parse', '--verify', '--quiet', `${BEFORE_REF}^{commit}`], { stdio: 'ignore' }); return true } catch { return false }
})()

test('the "before" arm can find the rules file it compares against', { skip: !hasBeforeRef && `${BEFORE_REF} is not in this checkout (shallow clone)` }, () => {
  const rules = execFileSync('git', ['show', `${BEFORE_REF}:registry/agent-rules/quill.md`], { encoding: 'utf8' })
  assert.match(rules, /^# Quill design system/)
  assert.doesNotMatch(rules, /quill-components/, `${BEFORE_REF} already mentions the skill; it is not a before`)
})
