import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { join } from 'node:path'

import { renderAgentRules, RULES_PATH, skillFiles, agentRulesItemFiles, SKILL_SRC } from './build-agent-rules.mjs'
import { ALL_USAGE } from '../src/usage/index.mjs'
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
  for (const h of ['## Theming contract', '## Colour roles', '## Foundations', '## Principles', '## Icons', '## Blocks', '## Primitives', '## Updating and verifying']) {
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
  assert.deepEqual(item.files, agentRulesItemFiles(), 'the agent-rules file list is stale — run `npm run build:agent-rules`')
  assert.equal(item.files[0].target, '~/.claude/rules/quill.md')
  assert.ok(typeof item.docs === 'string' && item.docs.includes('--overwrite'), 'the item docs must state the update rule')
})

test('the rules file stays small enough to load into every session', () => {
  // Claude Code loads .claude/rules/*.md into every session of the app, and its
  // docs set a 200-line target: longer files cost context and reduce adherence.
  // So the block index is names only, one line per intent, and which component
  // to pick lives in the quill-components skill, which loads only when needed.
  // Raised from 18 to 19.5 KB in 0.10.0 for the colour-role guidance: the file named
  // 3 of the 31 roles, and picking a colour is what an agent does most. It gets the
  // 1.8 KB compact form; the full 12 KB table lives in llms.txt. Spend on nothing else.
  // Raised from 19.5 to 20 KB for the AI gradient exception (~650 B): an agent that
  // does not see the rule will either use the gradient on non-AI UI or avoid it for AI.
  assert.ok(committed.length < 20_000, `rules file is ${committed.length} bytes — trim it, every session pays for it`)
  const lines = committed.split('\n').length
  assert.ok(lines <= 200, `rules file is ${lines} lines — Claude Code's target is 200; move detail into the skill`)
})

test('the rules file sends agents to the skill before they choose a component', () => {
  assert.match(committed, /load the `quill-components` skill/)
})

test('the quill-components skill is committed and current (run `npm run build:agent-rules`)', () => {
  for (const f of skillFiles()) {
    const path = join(new URL('..', import.meta.url).pathname, f.path)
    assert.equal(readFileSync(path, 'utf8'), f.content, `${f.path} is stale — run \`npm run build:agent-rules\``)
  }
})

test('the skill names every block and primitive, and ships every usage guide as a reference', () => {
  const skill = skillFiles().find((f) => f.rel === 'SKILL.md').content
  assert.match(skill, /^---\nname: quill-components\ndescription: .{80,}\n---\n/, 'SKILL.md needs name + a real description in its frontmatter')
  // Claude Code's skills guidance: keep SKILL.md under 500 lines, detail in reference files.
  const lines = skill.split('\n').length
  assert.ok(lines < 500, `SKILL.md is ${lines} lines — move detail into reference/`)
  for (const b of registry.items.filter((i) => i.type === 'registry:block')) {
    assert.ok(skill.includes(`- \`${b.name}\` — `), `block '${b.name}' is missing from the skill`)
  }
  for (const u of ALL_USAGE) {
    if (u.kind === 'component') assert.ok(skill.includes(`- \`${u.name}\``), `primitive '${u.name}' is missing from the skill`)
    assert.ok(skillFiles().some((f) => f.rel === `reference/${u.name}.md`), `no reference guide for '${u.name}'`)
  }
  assert.match(skill, /If nothing fits/, 'the skill must say what to do when nothing fits')
  assert.ok(SKILL_SRC.startsWith('registry/'), 'shadcn build reads item files from the repo; keep the skill under registry/')
})

test('every Quill-shipped component (registry:ui) is named as @quill/, not left to stock shadcn', () => {
  const shipped = registry.items.filter((i) => i.type === 'registry:ui').map((i) => i.name)
  assert.ok(shipped.length > 0, 'no registry:ui items found')
  const primitivesLine = committed.split('\n').find((l) => l.startsWith('Stock shadcn components'))
  assert.ok(primitivesLine, 'Primitives sentence not found')
  const quillSentence = primitivesLine.slice(0, primitivesLine.indexOf('`@quill/`') + 9)
  const howToChoose = readFileSync(join(SKILL_SRC, 'SKILL.md'), 'utf8')
  for (const name of shipped) {
    assert.ok(quillSentence.includes(`\`${name}\``), `'${name}' is not named in the "come from @quill/" sentence`)
    assert.ok(howToChoose.includes(`\`${name}\` with \`@quill/<name>\``) || howToChoose.match(new RegExp(`\`${name}\`[^)]*with \`@quill/<name>\``)), `'${name}' is not named in the skill's @quill/<name> clause`)
  }
  assert.ok(!/shadcn@latest add (ai-|icon|tone)/.test(committed), 'rules file tells the agent to install a Quill component from stock shadcn')
})
