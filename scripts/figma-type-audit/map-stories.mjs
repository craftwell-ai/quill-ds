// root (Figma twin / pattern / template) → the Storybook stories that render its code twin
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const repo = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const dir = process.argv[2]
// every Figma root the parity bot knows: component twins, mirrored patterns, templates
const state = JSON.parse(fs.readFileSync(path.join(repo, 'figma/sync-state.json'), 'utf8'))
const vals = (x) => (Array.isArray(x) ? x : Object.values(x || {}))
const roots = [
  ...vals(state.components).map((c) => ({ kind: 'twin', name: c.name, id: c.nodeId, code: c.codeFile })),
  ...vals(state.patterns).filter((p) => p.status === 'mirrored').map((p) => ({ kind: 'pattern', name: p.block, id: p.frameId, code: `registry/blocks/${p.block}.tsx` })),
  ...vals(state.templates).map((t) => ({ kind: 'template', name: t.block || t.name, id: t.frameId, code: `registry/examples/${t.block || t.name}.tsx` })),
]
fs.writeFileSync(path.join(dir, 'roots.json'), JSON.stringify(roots, null, 1))
const index = JSON.parse(fs.readFileSync(path.join(dir, 'sb/index.json'), 'utf8'))
const stories = Object.values(index.entries).filter((e) => e.type === 'story')
const byFile = new Map()
for (const s of stories) { const f = s.importPath.replace(/^\.\//, ''); (byFile.get(f) ?? byFile.set(f, []).get(f)).push(s.id) }
const imports = new Map() // story file → set of imported module stems
for (const f of byFile.keys()) {
  const src = fs.readFileSync(path.join(repo, f), 'utf8')
  imports.set(f, new Set([...src.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1])))
}
const out = []
for (const r of roots) {
  const stem = path.basename(r.code).replace(/\.tsx?$/, '')
  const wants = r.kind === 'twin' ? [`@/components/ui/${stem}`, `@registry/lib/${stem}`, `../components/ui/${stem}`] : r.kind === 'pattern' ? [`@registry/blocks/${stem}`] : [`@registry/examples/${stem}`]
  const tail = (m) => m.split('/').slice(-2).join('/')
  const wantTails = new Set(wants.map(tail))
  const files = [...imports].filter(([, set]) => [...set].some((m) => wants.includes(m) || (m.startsWith('.') && wantTails.has(tail(m))))).map(([f]) => f)
  // a twin's own story file first (src/stories/<stem>.stories.tsx), not every pattern that happens to import it
  const own = files.filter((f) => path.basename(f).toLowerCase().startsWith(stem.replace(/-/g, '').toLowerCase()) || path.basename(f).toLowerCase().startsWith(stem.toLowerCase()))
  const chosen = r.kind === 'twin' ? (own.length ? own : []) : files
  out.push({ ...r, storyFiles: chosen, storyIds: chosen.flatMap((f) => byFile.get(f)) })
}
fs.writeFileSync(path.join(dir, 'roots-stories.json'), JSON.stringify(out, null, 1))
const none = out.filter((r) => !r.storyIds.length)
console.log('roots:', out.length, '· with stories:', out.length - none.length, '· story ids total:', out.reduce((a, r) => a + r.storyIds.length, 0))
console.log('no story found:', none.map((r) => `${r.kind}:${r.name}`).join(', ') || 'none')
