import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { ALL_USAGE } from '../src/usage/index.mjs'
import { USAGE_DIR } from './build-usage.mjs'
import { getComponent, findComponent, installCommand, normalizeName, HOME, getSetup, getFoundations, FOUNDATION_TOPICS, SERVER_INSTRUCTIONS } from '../src/mcp/tools.mjs'
import { ALL_MODES } from '../src/tokens/themes.mjs'
import { accentNames } from '../src/usage/theme-docs.mjs'

const registry = JSON.parse(readFileSync(new URL('../registry.json', import.meta.url), 'utf8'))
const registryNames = new Set(registry.items.map((i) => i.name))

test('every usage guide resolves, and its body is the published page verbatim', () => {
  for (const u of ALL_USAGE) {
    const res = getComponent(u.name)
    assert.ok(res.ok, `${u.name} did not resolve`)
    const published = readFileSync(join(USAGE_DIR, `${u.name}.md`), 'utf8').trimEnd()
    assert.ok(res.text.startsWith(published), `${u.name}: MCP guide differs from public/usage/${u.name}.md`)
  }
})

test('Quill registry items install by URL, stock primitives by name', () => {
  assert.equal(installCommand('login-minimal'), `npx shadcn@latest add ${HOME}/r/login-minimal.json`)
  assert.equal(installCommand('alert-dialog'), 'npx shadcn@latest add alert-dialog')
  for (const u of ALL_USAGE) {
    const expectUrl = registryNames.has(u.name)
    assert.equal(installCommand(u.name).includes('/r/'), expectUrl, `${u.name} install form is wrong`)
    assert.ok(getComponent(u.name).text.includes(installCommand(u.name)), `${u.name} guide lacks its install line`)
  }
})

test('loosely typed names resolve', () => {
  for (const typed of ['Alert Dialog', ' alert-dialog ', 'AlertDialog', 'alert_dialog']) {
    assert.equal(normalizeName(typed), 'alert-dialog', typed)
    assert.ok(getComponent(typed).ok, typed)
  }
})

test('an unknown name suggests real names and invents none', () => {
  const res = getComponent('alert-dialgo')
  assert.equal(res.ok, false)
  assert.match(res.text, /alert-dialog/)
  const suggested = [...res.text.matchAll(/`([a-z0-9-]+)`/g)].map((m) => m[1])
  const known = new Set(ALL_USAGE.map((u) => u.name))
  for (const s of suggested) assert.ok(known.has(s) || /^(find|get)_/.test(s), `suggested a name that does not exist: ${s}`)
})

test('registry items without a usage guide point somewhere useful', () => {
  assert.match(getComponent('quill').text, /get_setup/)
  assert.match(getComponent('agent-rules').text, /get_setup/)
  const ex = getComponent('example-auth-page')
  assert.ok(ex.ok)
  assert.match(ex.text, /example-auth-page\.json/)
})

test('find_component ranks the obvious pick first', () => {
  const cases = {
    'confirm deleting an account': 'alert-dialog',
    'sign in with a one-time email code': 'login-minimal',
    'upload files': 'file-upload',
    'show a list of recent activity': 'activity-feed',
  }
  for (const [task, want] of Object.entries(cases)) {
    assert.equal(findComponent(task).names[0], want, task)
  }
})

test('find_component returns at most five real names with their use-when', () => {
  const res = findComponent('confirm deleting an account')
  assert.ok(res.names.length > 0 && res.names.length <= 5)
  for (const n of res.names) assert.ok(getComponent(n).ok, n)
  assert.match(res.text, /When to use|use when/i)
})

test('find_component with nothing to match says so instead of guessing', () => {
  for (const task of ['', '   ', 'xyzzy']) {
    const res = findComponent(task)
    assert.equal(res.ok, false, JSON.stringify(task))
    assert.deepEqual(res.names, [])
    assert.match(res.text, /No Quill component fits/)
  }
})

test('get_setup names every theme and accent from the source, and the install command', () => {
  const text = getSetup()
  for (const m of ALL_MODES) assert.ok(text.includes(m.label), `missing theme ${m.label}`)
  for (const a of accentNames()) assert.ok(text.includes(a), `missing accent ${a}`)
  assert.ok(text.includes(`${HOME}/r/quill.json`))
})

test('get_foundations returns each topic, and all four with no topic', () => {
  const all = getFoundations()
  assert.ok(all.ok)
  for (const t of FOUNDATION_TOPICS) {
    const res = getFoundations(t)
    assert.ok(res.ok && res.text.trim().length > 100, t)
    assert.ok(all.text.includes(res.text.trim()), `all-topics output lacks ${t}`)
  }
})

test('get_foundations rejects an unknown topic and lists the valid ones', () => {
  const res = getFoundations('color')
  assert.equal(res.ok, false)
  for (const t of FOUNDATION_TOPICS) assert.ok(res.text.includes(t))
})

test('server instructions send agents to find_component first', () => {
  assert.match(SERVER_INSTRUCTIONS, /find_component/)
  assert.match(SERVER_INSTRUCTIONS, /get_component/)
})
