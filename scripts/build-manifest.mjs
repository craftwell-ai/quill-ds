// Builds scripts/icons.manifest.mjs — the top ~1000 Material Symbols by Google
// popularity, union'd with the icons already used in the app (so nothing breaks).
// build-icons.mjs reads that manifest as its lazy-set fallback whenever the
// metadata file is not on disk, so this runs on demand, not in the build chain.
//
// Ranking source: Google Fonts metadata (fonts.google.com/metadata/icons), saved
// to a local JSON first. Usage:
//   curl -s "https://fonts.google.com/metadata/icons?key=material_symbols&incomplete=1" -o /tmp/ms-meta.json
//   npm run build:icon-manifest -- /tmp/ms-meta.json   (then npm run build:icons)
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { has, usedInSrc } from './build-icons.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const metaPath = process.argv[2] || process.env.MS_META || '/tmp/ms-meta.json'

const raw = readFileSync(metaPath, 'utf8').replace(/^\)\]\}'?\n?/, '')
const data = JSON.parse(raw)

// Icons referenced in the codebase must survive regeneration. The scanner is
// build-icons.mjs's own, so the two can never disagree about what "in use"
// means — the inline git-grep this replaced had a branch that never matched.
const inUse = usedInSrc()
if (inUse.length < 30) {
  console.error(`in-use extraction suspiciously low (${inUse.length}) — check referencedIconNames() in build-icons.mjs`)
  process.exit(1)
}

const ranked = [
  ...new Set(
    [...data.icons]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .map((i) => i.name)
      .filter(has)
  ),
] // dedupe (metadata repeats names) preserving popularity order
const top1000 = ranked.slice(0, 1000)

const names = [...new Set([...top1000, ...inUse])].sort()
const body = names.map((n) => `  '${n}',`).join('\n')
const out =
  `// GENERATED — top ~1000 Material Symbols (Outlined) by Google popularity, union'd with in-use icons.\n` +
  `// Regenerate: npm run build:icon-manifest -- /tmp/ms-meta.json  (then npm run build:icons)\n` +
  `export const MANIFEST = [\n${body}\n]\n`
writeFileSync(join(root, 'scripts/icons.manifest.mjs'), out)

console.log(`in-use: ${inUse.length} | top1000: ${top1000.length} | union total: ${names.length}`)
console.log('sample:', names.slice(0, 16).join(', '))
