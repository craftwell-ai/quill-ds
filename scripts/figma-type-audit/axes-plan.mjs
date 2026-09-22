// From report.json, plan the Fraunces axis edits: which text STYLES can move as a
// whole (every matched layer of the style wants the same axes) and which LAYERS need
// their own values (unstyled, or a style whose layers disagree). Usage:
//   node scripts/figma-type-audit/axes-plan.mjs <workdir>   → <workdir>/axes-plan.json
import fs from 'node:fs'
import path from 'node:path'
const dir = process.argv[2]
const report = JSON.parse(fs.readFileSync(path.join(dir, 'report.json'), 'utf8'))

// figma axes + the wanted deltas → the full wanted set (only the axes code sets move)
const wantOf = (diff) => Object.fromEntries(Object.entries(diff.off.axes).map(([k, [, want]]) => [k, want]))
const key = (o) => JSON.stringify(Object.fromEntries(Object.entries(o).sort()))

const byStyle = {}
const layers = []
let diffs = 0
for (const root of report.roots) {
  for (const d of root.diffs) {
    if (!d.off.axes) continue
    diffs += d.n
    const want = wantOf(d)
    if (d.figmaStyle) {
      const s = (byStyle[d.figmaStyle] ??= { wants: {}, layers: 0, groups: [] })
      s.layers += d.n
      s.wants[key(want)] = (s.wants[key(want)] || 0) + d.n
      s.groups.push({ root: root.name, chars: d.chars, n: d.n, ids: d.ids ?? [d.id], want, dom: d.dom })
    } else {
      layers.push({ root: root.name, chars: d.chars, n: d.n, ids: d.ids ?? [d.id], want, dom: d.dom })
    }
  }
}

// A style moves as a whole only when every matched layer of it wants the same thing
// AND no matched layer of that style was already exact (an exact layer wants the
// style's current axes, so moving the style would break it).
const exactByStyle = {}
for (const [name, st] of Object.entries(report.byStyle)) exactByStyle[name] = st.matched - st.off
const styles = {}
const layerOverrides = []
for (const [name, s] of Object.entries(byStyle)) {
  const wants = Object.entries(s.wants)
  const unanimous = wants.length === 1 && exactByStyle[name] === 0
  if (unanimous) styles[name] = { want: JSON.parse(wants[0][0]), layers: s.layers }
  else {
    styles[name] = { split: true, wants: s.wants, exactLayers: exactByStyle[name], layers: s.layers }
    for (const g of s.groups) layerOverrides.push({ ...g, style: name })
  }
}

const plan = { diffs, styles, styleMoves: Object.values(styles).filter((s) => !s.split).length, layerEdits: [...layers, ...layerOverrides] }
fs.writeFileSync(path.join(dir, 'axes-plan.json'), JSON.stringify(plan, null, 1))
console.log(`layers off on axes: ${diffs}`)
console.log('styles:')
for (const [name, s] of Object.entries(styles)) console.log(`  ${name.padEnd(16)} ${s.split ? `SPLIT — wants ${JSON.stringify(s.wants)}, exact ${s.exactLayers}` : `→ ${JSON.stringify(s.want)} (${s.layers} layers)`}`)
console.log(`layer-level edits: ${plan.layerEdits.length} groups / ${plan.layerEdits.reduce((a, l) => a + l.n, 0)} layers`)
for (const l of plan.layerEdits.slice(0, 12)) console.log(`  ${l.root.padEnd(18)} ${String(l.n).padStart(3)} × "${l.chars}" ${l.style ? `[${l.style}] ` : ''}→ ${JSON.stringify(l.want)}  (${l.dom.tag})`)
