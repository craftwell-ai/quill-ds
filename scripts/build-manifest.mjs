// Builds scripts/icons.manifest.mjs — the top ~1000 Material Symbols by Google
// popularity, union'd with the icons already used in the app (so nothing breaks).
//
// Ranking source: Google Fonts metadata (fonts.google.com/metadata/icons), saved
// to a local JSON first. Usage:
//   curl -s "https://fonts.google.com/metadata/icons?key=material_symbols&incomplete=1" -o /tmp/ms-meta.json
//   node scripts/build-manifest.mjs /tmp/ms-meta.json
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const metaPath = process.argv[2] || '/tmp/ms-meta.json'
const OUTLINED = join(root, 'node_modules/@material-symbols/svg-200/outlined')
const has = (n) => existsSync(join(OUTLINED, `${n}.svg`))

const raw = readFileSync(metaPath, 'utf8').replace(/^\)\]\}'?\n?/, '')
const data = JSON.parse(raw)

// icons currently referenced in the codebase (must be preserved)
const genSrc = readFileSync(join(root, 'scripts/build-icons.mjs'), 'utf8')
const inUseBlock = (genSrc.match(/export const MANIFEST = \[([\s\S]*?)\]/) || [])[1] || ''
const inUse = [...inUseBlock.matchAll(/'([a-z0-9_]+)'/g)].map((m) => m[1])
const missing = inUse.filter((n) => !has(n))
if (missing.length) {
  console.error('IN-USE ICON MISSING FROM PACKAGE:', missing)
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
  `// Regenerate: node scripts/build-manifest.mjs /tmp/ms-meta.json  (then npm run build:icons)\n` +
  `export const MANIFEST = [\n${body}\n]\n`
writeFileSync(join(root, 'scripts/icons.manifest.mjs'), out)

console.log(`in-use: ${inUse.length} | top1000: ${top1000.length} | union total: ${names.length}`)
console.log('sample:', names.slice(0, 16).join(', '))
