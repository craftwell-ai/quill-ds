import { test } from 'node:test'
import assert from 'node:assert/strict'

import { renderUsageDocs } from '../src/usage/render.mjs'

const sample = {
  name: 'sample',
  kind: 'component',
  summary: 'Does the thing.',
  useWhen: ['You need the thing.'],
  alternatives: [{ name: 'other', when: 'the thing is heavy.' }],
  rules: [{ id: 'r1', do: 'Do it once.', dont: 'Do it twice.', visual: false }],
  a11y: ['Label the thing.'],
  tokens: ['--primary'],
}

test('renderUsageDocs emits every section from the usage object', () => {
  const md = renderUsageDocs(sample)
  assert.match(md, /^Does the thing\./)
  assert.match(md, /### When to use\n- You need the thing\./)
  assert.match(md, /### Reach for instead\n- \*\*other\*\* — when the thing is heavy\./)
  assert.match(md, /### Rules\n- \*\*Do:\*\* Do it once\. \*\*Don't:\*\* Do it twice\./)
  assert.match(md, /### Accessibility\n- Label the thing\./)
  assert.match(md, /### Design tokens\n`--primary`/)
})

test('empty optional sections are omitted entirely', () => {
  const md = renderUsageDocs({ ...sample, alternatives: [], rules: [], a11y: [], tokens: [] })
  assert.ok(!md.includes('### Reach for instead'))
  assert.ok(!md.includes('### Rules'))
  assert.ok(!md.includes('### Accessibility'))
  assert.ok(!md.includes('### Design tokens'))
})
