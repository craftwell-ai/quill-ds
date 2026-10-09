// Prints the foundations-sync script for one `use_figma` call, trimmed to fit.
//
// figma/README.md, "Re-run the foundation sync": the call is `const DTCG = <export>;`
// + figma/sync-foundations.figma.js + `return await syncFoundations(DTCG)`. Sent as
// written that is ~81k characters, over use_figma's 50,000-character limit. Nothing
// the sync reads is lost by trimming: the DTCG is minified with its `$description`
// keys and its Intelligent mode values dropped (the sync reads neither — Intelligent
// is code-only by decision), and the script loses whole-line `//` comments and its
// indentation (it has no multi-line template strings, so no string changes). The
// size goes to stderr so the payload itself can be piped or copied; exit 1 if over.
//
//   node scripts/figma-sync-payload.mjs > /tmp/sync.js   # then paste it as the `code`

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { isMain } from './lib/is-main.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
export const LIMIT = 50000

const dropDescriptions = (node) => {
  if (Array.isArray(node)) return node.map(dropDescriptions)
  if (!node || typeof node !== 'object') return node
  return Object.fromEntries(Object.entries(node).filter(([k]) => k !== '$description' && k !== 'Intelligent').map(([k, v]) => [k, dropDescriptions(v)]))
}

export function syncPayload() {
  const dtcg = dropDescriptions(JSON.parse(readFileSync(join(root, 'tokens/quill.figma.json'), 'utf8')))
  const script = readFileSync(join(root, 'figma/sync-foundations.figma.js'), 'utf8')
    .split('\n')
    .filter((line) => !/^\s*\/\//.test(line))
    .map((line) => line.trimStart())
    .join('\n')
  return `const DTCG = ${JSON.stringify(dtcg)};\n${script}\nreturn await syncFoundations(DTCG)\n`
}

if (isMain(import.meta.url)) {
  const payload = syncPayload()
  process.stdout.write(payload)
  const headroom = LIMIT - payload.length
  process.stderr.write(`${payload.length} characters (use_figma limit ${LIMIT}) — ${headroom >= 0 ? `${headroom} to spare` : `OVER THE LIMIT by ${-headroom}; split the run (figma/README.md, "Payload size")`}\n`)
  if (payload.length > LIMIT) process.exitCode = 1
}
