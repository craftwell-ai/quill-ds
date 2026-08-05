/**
 * Generates the usage outputs derived from src/usage/*.usage.mjs:
 *   - public/usage/<name>.md            one full usage page per entry
 *   - registry.json                     `docs` field (shadcn CLI prints it at
 *                                       install time), `description`
 *                                       (:= summary), and `meta.use_when`
 *                                       (:= useWhen[0]) for documented items
 * The usage module is the single source; `scripts/build-usage.test.mjs` fails
 * CI when a committed output is stale. Run `npm run build:usage` after
 * touching any usage file.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { ALL_USAGE } from '../src/usage/index.mjs'
import { renderUsageDocs } from '../src/usage/render.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
export const USAGE_DIR = join(root, 'public/usage')
export const REGISTRY_PATH = join(root, 'registry.json')

export function renderUsagePage(u) {
  return `# ${u.name} (${u.kind})\n\n${renderUsageDocs(u)}\n`
}

export function usageDocsField(u) {
  const rules = u.rules.map((r) => `Do: ${r.do} Don't: ${r.dont}`).join(' ')
  const alts = u.alternatives.map((a) => `Use ${a.name} when ${a.when}`).join(' ')
  return [u.summary, rules, alts].filter(Boolean).join(' ')
}

export function injectRegistryDocs(registry, all = ALL_USAGE) {
  const byName = new Map(all.map((u) => [u.name, u]))
  for (const item of registry.items) {
    const u = byName.get(item.name)
    if (!u) continue
    item.docs = usageDocsField(u)
    item.description = u.summary
    if (item.type === 'registry:block') item.meta = { ...item.meta, use_when: u.useWhen[0] }
  }
  return registry
}

if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync(USAGE_DIR, { recursive: true })
  for (const u of ALL_USAGE) writeFileSync(join(USAGE_DIR, `${u.name}.md`), renderUsagePage(u))
  const registry = injectRegistryDocs(JSON.parse(readFileSync(REGISTRY_PATH, 'utf8')))
  // registry.json is committed without a trailing newline (verified with
  // `python3 -c "print(open('registry.json','rb').read().endswith(b'\\n'))"` → False);
  // no `+ '\n'` here, unlike the brief's assumed format, to keep the diff minimal.
  writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2))
  console.log(`wrote ${ALL_USAGE.length} usage pages and registry.json docs fields`)
}
