import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import vm from 'node:vm'

import { AI_RULES } from './build-tokens.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// Does Figma's composer edge carry the stops code paints?
//
// Code mixes the edge's gold end (and every stop at rest) with color-mix, which a
// Figma gradient stop cannot bind. The foundations sync turns each mix into a derived
// `ai-edge/*` variable and binds the three AI/Edge styles to them. The recipe is a
// second copy of AI_RULES, so this test reads both and fails when they part: change a
// mix percentage in build-tokens and the sync must change with it.

const source = readFileSync(join(root, 'figma/sync-foundations.figma.js'), 'utf8')
const sync = vm.runInNewContext(`${source}\n;({ AI_EDGE_STYLES, aiEdgeCss })`, {})
// JSON round trip: arrays made in the vm realm never deep-equal this realm's.
const AI_EDGE_STYLES = JSON.parse(JSON.stringify(sync.AI_EDGE_STYLES))
const aiEdgeCss = sync.aiEdgeCss

// Split on top-level commas only (color-mix nests its own).
const splitTop = (str) => {
  const parts = []
  let depth = 0
  let start = 0
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '(') depth++
    else if (str[i] === ')') depth--
    else if (str[i] === ',' && depth === 0) { parts.push(str.slice(start, i).trim()); start = i + 1 }
  }
  return [...parts, str.slice(start).trim()]
}
// The border-box layer of an edge `background` → { angle, stops: [[css, position]] }; an
// unpositioned CSS stop sits evenly between its neighbours, as the browser places it.
const edgeOf = (background) => {
  const inner = /^linear-gradient\((.*)\) border-box$/.exec(splitTop(background)[1])
  assert.ok(inner, `unexpected edge layer in '${background}'`)
  const [angle, ...stops] = splitTop(inner[1])
  return {
    angle: Number(/^(\d+)deg$/.exec(angle)[1]),
    stops: stops.map((stop, i) => {
      const m = /^(.*) (\d+)%$/.exec(stop)
      return m ? [m[1], Number(m[2]) / 100] : [stop, i / (stops.length - 1)]
    }),
  }
}

const code = {
  'AI/Edge': edgeOf(AI_RULES['@utility ai-edge']['&:focus-within, &[data-lit]'].background),
  'AI/Edge (rest)': edgeOf(AI_RULES['@utility ai-edge'].background),
  'AI/Edge (working)': edgeOf(AI_RULES['@utility ai-edge-working'].background),
}

test('every AI edge style in the sync paints the stops and angle code paints', () => {
  assert.deepEqual(AI_EDGE_STYLES.map((s) => s.name).sort(), Object.keys(code).sort())
  for (const style of AI_EDGE_STYLES) {
    const figma = { angle: style.angle, stops: style.stops.map(([name, position]) => [aiEdgeCss(name), position]) }
    assert.deepEqual(figma, code[style.name], `${style.name} differs from AI_RULES`)
  }
})
