// Figma text layers vs the browser's computed style for the same words.
import fs from 'node:fs'
import path from 'node:path'
const dir = process.argv[2]
const { tokens } = await import('../../src/tokens/quill.tokens.mjs')
const ratio = (css) => { const m = css.match(/^calc\(([\d.]+)\s*\/\s*([\d.]+)\)$/); return m ? m[1] / m[2] : Number(css) }
const UTIL = Object.fromEntries(Object.entries(tokens.text).map(([k, v]) => [k, { px: parseFloat(v) * 16, lh: tokens.textLeading[k] ? ratio(tokens.textLeading[k]) * 100 : null }]))
const WEIGHT = { Thin: 100, ExtraLight: 200, Light: 300, Regular: 400, Italic: 400, Medium: 500, SemiBold: 600, 'Semi Bold': 600, Bold: 700 }
const norm = (s) => s.replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 40)
const num = (s) => (typeof s === 'string' ? parseFloat(s) : s)
const files = fs.readdirSync(path.join(dir, 'figma')).filter((f) => f.endsWith('.json'))
const report = []
const tally = { layers: 0, matched: 0, unmatched: 0, exact: 0, size: 0, lh: 0, ls: 0, weight: 0, family: 0, textCase: 0 }
const byStyle = {}
const fixes = {}
for (const f of files) {
  const fig = JSON.parse(fs.readFileSync(path.join(dir, 'figma', f), 'utf8'))
  const domFile = path.join(dir, 'dom', f)
  if (!fig.rows || !fs.existsSync(domFile)) continue
  const dom = JSON.parse(fs.readFileSync(domFile, 'utf8'))
  const domRows = Object.values(dom.stories).flat().filter((r) => r.visible)
  const index = new Map(); for (const r of domRows) { const k = norm(r.chars); (index.get(k) ?? index.set(k, []).get(k)).push(r) }
  const rootOut = { kind: fig.kind, name: fig.name, page: fig.page, layers: 0, matched: 0, diffs: [] }
  for (const t of fig.rows) {
    rootOut.layers += t.n; tally.layers += t.n
    const cands = index.get(norm(t.chars))
    const st = (byStyle[t.style || '(no style)'] ??= { layers: 0, matched: 0, off: 0 }); st.layers += t.n
    if (!cands) { tally.unmatched += t.n; continue }
    // the DOM twin: same words, closest size
    const d = [...cands].sort((a, b) => Math.abs(a.size - t.size) - Math.abs(b.size - t.size))[0]
    rootOut.matched += t.n; tally.matched += t.n; st.matched += t.n
    const truth = `${d.size}px · ${d.lh} · ${d.ls} · ${d.weight}${d.italic ? ' italic' : ''}${d.transform ? ' · ' + d.transform : ''}${d.inHeading ? ' · in h*' : ''}`
    ;(st.truths ??= {})[truth] = (st.truths[truth] || 0) + t.n
    st.figma ??= `${t.size}px · ${t.lh} · ${t.ls} · ${t.font.split('/')[1]}`
    const [family, style] = t.font.split('/')
    const figLh = t.lh === 'auto' ? null : t.lh.endsWith('%') ? num(t.lh) : (num(t.lh) / t.size) * 100
    const domLh = d.lh === 'normal' ? null : num(d.lh)
    const figLs = t.ls.endsWith('%') ? num(t.ls) : (num(t.ls) / t.size) * 100
    const off = {}
    if (Math.abs(t.size - d.size) > 0.06) off.size = [t.size, d.size]
    if (figLh !== null && domLh !== null && Math.abs(figLh - domLh) > 0.6) off.lh = [Math.round(figLh * 10) / 10, Math.round(domLh * 10) / 10]
    if (Math.abs(figLs - num(d.ls)) > 0.15) off.ls = [figLs, num(d.ls)]
    if ((WEIGHT[style.replace(' Italic', '')] ?? 400) !== Number(d.weight)) off.weight = [style, d.weight]
    if (family.toLowerCase() !== d.family.toLowerCase()) off.family = [family, d.family]
    if ((t.textCase === 'UPPER') !== (d.transform === 'uppercase')) off.textCase = [t.textCase, d.transform || 'none']
    if (!Object.keys(off).length) { tally.exact += t.n; continue }
    st.off += t.n
    for (const k of Object.keys(off)) tally[k] += t.n
    // what would make it right: a generated Text/* style when code is a bare utility, else explicit values
    const util = Object.entries(UTIL).find(([, u]) => Math.abs(u.px - d.size) < 0.06 && u.lh !== null && domLh !== null && Math.abs(u.lh - domLh) < 0.6)
    const plain = Number(d.weight) === 400 && !d.italic && Math.abs(num(d.ls)) < 0.05 && d.family === 'Raleway' && !d.transform
    const fix = util && plain ? `Text/${util[0]}` : `explicit ${d.size}px / ${d.lh} / ${d.ls}${Number(d.weight) !== 400 ? ' / ' + d.weight : ''}${d.inHeading ? ' (in heading)' : ''}`
    const fk = `${t.style || '(no style)'} → ${util && plain ? `Text/${util[0]}` : 'explicit values'}`; fixes[fk] = (fixes[fk] || 0) + t.n
    rootOut.diffs.push({ chars: t.chars.slice(0, 36), n: t.n, figmaStyle: t.style, off, dom: { tag: d.tag, slot: d.slot, cls: d.cls.slice(0, 60) }, fix, id: t.id })
  }
  report.push(rootOut)
}
fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify({ tally, byStyle, fixes, roots: report }, null, 1))
console.log('roots compared:', report.length, '·', JSON.stringify(tally))
console.log('by Figma style (layers / matched / off):'); for (const [k, v] of Object.entries(byStyle).sort((a, b) => b[1].layers - a[1].layers)) console.log('  ' + k.padEnd(16), String(v.layers).padStart(5), String(v.matched).padStart(6), String(v.off).padStart(5))
console.log('what code renders, per Figma style (top 3):'); for (const [k, v] of Object.entries(byStyle).sort((a, b) => b[1].layers - a[1].layers)) { if (!v.truths || k === '(no style)') continue; const top = Object.entries(v.truths).sort((a, b) => b[1] - a[1]); console.log('  ' + k.padEnd(15), 'figma:', v.figma); for (const [t, n] of top.slice(0, 3)) console.log('      ' + String(n).padStart(4) + ' × ' + t) }
console.log('fix shape:'); for (const [k, v] of Object.entries(fixes).sort((a, b) => b[1] - a[1]).slice(0, 14)) console.log('  ' + String(v).padStart(4), k)
