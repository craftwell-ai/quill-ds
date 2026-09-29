import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { ALL_USAGE } from '../src/usage/index.mjs'
import { USAGE_DIR } from './build-usage.mjs'
import { getComponent, installCommand, normalizeName, HOME } from '../src/mcp/tools.mjs'

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
