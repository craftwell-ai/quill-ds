// Stamps for the Figma re-stamp guard (scripts/figma-restamp.test.mjs).
//
// A mirrored pattern page records the hash of its block source at the last
// sync; the Figma variables record the hash of the token source at the last
// foundations sync. When code moves without Figma, the guard fails and names
// this command. Comments and whitespace are ignored so a JSDoc-only change
// (CRA-212 touched every block) does not read as drift.
//
//   node scripts/figma-stamp.mjs --block hero navbar   # after /figma-push or a rebuild (templates: --block example-app-page)
//   node scripts/figma-stamp.mjs --tokens              # after the foundations sync
//   node scripts/figma-stamp.mjs --all-blocks          # only after every page was verified

import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
export const STAMP_COMMAND = 'node scripts/figma-stamp.mjs'
const statePath = join(root, 'figma/sync-state.json')

const digest = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)
// A pattern page mirrors a block (registry/blocks) or a template (registry/examples, named example-*).
export const sourcePath = (name) => join(root, name.startsWith('example-') ? 'registry/examples' : 'registry/blocks', `${name}.tsx`)
// Strip block comments, line comments (not the // inside https://), and whitespace runs.
const strip = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\])\/\/.*$/gm, '$1').replace(/\s+/g, ' ').trim()

export const blockHash = (source) => digest(strip(source))
export const tokensHash = () => digest(strip(readFileSync(join(root, 'src/tokens/quill.tokens.mjs'), 'utf8')))
export const today = () => new Date().toISOString().slice(0, 10)

export function stamp({ blocks = [], tokens = false, allBlocks = false } = {}) {
  const state = JSON.parse(readFileSync(statePath, 'utf8'))
  const entries = [...state.patterns, ...(state.templates ?? [])]
  const wanted = new Set(allBlocks ? entries.filter((p) => p.status === 'mirrored').map((p) => p.block) : blocks)
  const stamped = []
  const restamp = (p) => {
    if (!wanted.has(p.block)) return p
    if (p.status !== 'mirrored') throw new Error(`${p.block} is ${p.status}, not mirrored — nothing to stamp`)
    const rest = { ...p }
    delete rest.stale
    stamped.push(p.block)
    return { ...rest, codeHash: blockHash(readFileSync(sourcePath(p.block), 'utf8')), syncedAt: today() }
  }
  state.patterns = state.patterns.map(restamp)
  if (state.templates) state.templates = state.templates.map(restamp)
  const unknown = [...wanted].filter((b) => !stamped.includes(b))
  if (unknown.length) throw new Error(`not in the pattern map: ${unknown.join(', ')}`)
  if (tokens) state.foundations = { ...(state.foundations ?? {}), tokensHash: tokensHash(), syncedAt: today() }
  writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n')
  return { stamped, tokens }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2)
  const blocks = args.includes('--block') ? args.slice(args.indexOf('--block') + 1).filter((a) => !a.startsWith('--')) : []
  const result = stamp({ blocks, tokens: args.includes('--tokens'), allBlocks: args.includes('--all-blocks') })
  console.log(`stamped ${result.stamped.length} block(s)${result.tokens ? ' + tokens' : ''}: ${result.stamped.join(', ') || '—'}`)
}
