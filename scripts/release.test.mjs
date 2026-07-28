import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { changelogSection, nextPatch, commitSubjects, renderEntry } from './release.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

test('release notes for the current version are non-empty', () => {
  // Guards the autonomous release path: publishing notes for a version with no
  // entry would ship an empty GitHub release.
  const section = changelogSection(changelog, pkg.version)
  assert.ok(section, `no CHANGELOG section for current version ${pkg.version}`)
  assert.ok(section.length > 20, 'section suspiciously short')
})

test('a section stops at the next release heading', () => {
  const fake = ['## [1.1.0] — 2026-01-02', '', '### Added', '- new thing', '', '## [1.0.0] — 2026-01-01', '', '- old thing'].join('\n')
  const section = changelogSection(fake, '1.1.0')
  assert.match(section, /new thing/)
  assert.doesNotMatch(section, /old thing/, 'bled into the previous release')
})

test('missing version yields null rather than a wrong section', () => {
  assert.equal(changelogSection(changelog, '99.99.99'), null)
})

test('nextPatch increments only the patch', () => {
  assert.equal(nextPatch('0.2.19'), '0.2.20')
  assert.equal(nextPatch('1.0.0'), '1.0.1')
  assert.equal(nextPatch('0.9.99'), '0.9.100')
  assert.throws(() => nextPatch('not-a-version'))
})

test('commit subjects drop merges and prior release commits', () => {
  const log = [
    'feat(registry): a new block',
    'Merge pull request #40 from craftwell-ai/x',
    'chore(release): v0.2.20',
    'fix(tokens): a real fix',
    'Merge branch main into y',
  ].join('\n')
  assert.deepEqual(commitSubjects(log), ['feat(registry): a new block', 'fix(tokens): a real fix'])
})

test('an entry renders as a parseable section, and round-trips', () => {
  const entry = renderEntry('9.9.9', '2026-01-01', ['fix(a): one', 'feat(b): two'])
  assert.match(entry, /^## \[9\.9\.9\] — 2026-01-01$/m)
  // The generated entry must be readable by the notes extractor, or the release
  // step would publish empty notes for exactly the versions this script creates.
  const section = changelogSection(`${entry}\n\n## [9.9.8] — 2025-12-31\n\n- older\n`, '9.9.9')
  assert.match(section, /fix\(a\): one/)
  assert.doesNotMatch(section, /older/)
})

test('an empty commit list still renders a valid entry', () => {
  const entry = renderEntry('9.9.9', '2026-01-01', [])
  assert.match(entry, /### Changed/)
  assert.ok(changelogSection(`${entry}\n`, '9.9.9'))
})
