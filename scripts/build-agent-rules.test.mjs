import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { renderAgentRules, RULES_PATH } from './build-agent-rules.mjs'
import { ALL_MODES } from './build-tokens.mjs'
import { icons } from '../src/components/ui/icons.core.mjs'

const committed = readFileSync(RULES_PATH, 'utf8')
const registry = JSON.parse(readFileSync(new URL('../registry.json', import.meta.url), 'utf8'))

test('registry/agent-rules/quill.md is in sync with its sources (run `npm run build:agent-rules`)', () => {
  assert.equal(committed, renderAgentRules(), 'the agent-rules file is stale — run `npm run build:agent-rules` (before build:registry)')
})

test('the rules file carries the contract an agent in an app needs', () => {
  assert.doesNotMatch(committed, /quill-ds v\d/, 'no version stamp — the file must change only when its content does')
  assert.doesNotMatch(committed, /undefined/, 'contains the literal string "undefined"')
  for (const m of ALL_MODES) assert.ok(committed.includes(`data-theme="${m.attr}"`), `does not name the '${m.attr}' theme`)
  assert.match(committed, /--overwrite/, 'must state the update rule')
  for (const h of ['## Theming contract', '## Foundations', '## Principles', '## Icons', '## Blocks', '## Primitives', '## Updating and verifying']) {
    assert.ok(committed.includes(`\n${h}`), `missing section ${h}`)
  }
  for (const b of registry.items.filter((i) => i.type === 'registry:block')) {
    assert.ok(committed.includes(`\`${b.name}\``), `block '${b.name}' is missing from the block index`)
  }
  assert.match(committed, /\/usage\/<name>\.md/, 'must state where the usage guides live')
  for (const name of Object.keys(icons)) assert.ok(committed.includes(name), `core icon '${name}' is missing from the icon list`)
})

test('the registry ships the rules file to the project root, with install docs', () => {
  const item = registry.items.find((i) => i.name === 'agent-rules')
  assert.ok(item, 'registry.json has no agent-rules item')
  assert.equal(item.type, 'registry:file')
  assert.deepEqual(item.files.map((f) => f.target), ['~/.claude/rules/quill.md'])
  assert.ok(typeof item.docs === 'string' && item.docs.includes('--overwrite'), 'the item docs must state the update rule')
})

test('the rules file stays small enough to load into every session', () => {
  // Claude Code loads .claude/rules/*.md into every session of the app. The
  // block index is names + titles for that reason; use_when and rules live in
  // the linked usage pages.
  assert.ok(committed.length < 18_000, `rules file is ${committed.length} bytes — trim it, every session pays for it`)
})
