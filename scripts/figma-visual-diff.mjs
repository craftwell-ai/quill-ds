/**
 * Figma ↔ Storybook visual diff (CRA-224). For every mirrored pattern page and template:
 * export the Figma frame at 2x, render the block's canonical story at the same width,
 * compare with a tolerance for font rasterisation, and report — a table plus a
 * Figma | Storybook | diff strip per pair. Compares against figma/visual-baseline.json
 * so only a REGRESSION (more difference than last accepted) is a finding; report-only
 * unless --strict. Spec: docs/superpowers/specs/2026-09-23-figma-visual-diff-design.md.
 *
 *   node --env-file=.env scripts/figma-visual-diff.mjs --out .visual/out --sb .visual/sb [--pairs a,b] [--strict] [--update-baseline]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, symlinkSync, rmSync, statSync, createReadStream } from 'node:fs'
import { join, dirname, resolve, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import http from 'node:http'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
export const FILE_KEY = 'Dcf8lEB7Ash71iNl7WN4Jq'
export const BASELINE_PATH = join(root, 'figma/visual-baseline.json')
const PAPER = [0xf5, 0xed, 0xdd] // Dawn page ground: what surrounds a frame in both tools
export const REGRESSION_PCT = 1.0 // points of diffPct above the accepted value
export const REGRESSION_PX = 8 // CSS px of width or height drift
const CANVAS_PADDING = 24 // .storybook/preview.tsx CANVAS_PADDING, each side
const SCALE = 2

// ------------------------------------------------------------------ pairs
/** The story that stands for a block: `…--<name>`, else `…--default`, else the first non-docs, non-Do/Don't story. */
export function canonicalStory(name, storyIds) {
  const real = storyIds.filter((id) => !/--docs$/.test(id) && !/--do-?dont$/.test(id))
  return real.find((id) => id.endsWith(`--${name}`)) ?? real.find((id) => id.endsWith('--default')) ?? real[0] ?? null
}

/** Mirrored pages + templates from sync-state, each with its frame id and canonical story. */
export function pairsFromState(state, rootsStories) {
  const stories = new Map(rootsStories.map((r) => [`${r.kind}:${r.name}`, r.storyIds ?? []]))
  const vals = (o) => (Array.isArray(o) ? o : Object.values(o))
  const roots = [
    ...vals(state.patterns).filter((p) => p.status === 'mirrored').map((p) => ({ kind: 'pattern', name: p.block, frameId: p.frameId })),
    ...vals(state.templates).map((t) => ({ kind: 'template', name: t.block || t.name, frameId: t.frameId })),
  ]
  return roots.map((r) => ({ ...r, story: canonicalStory(r.name, stories.get(`${r.kind}:${r.name}`) ?? []) }))
}

// ------------------------------------------------------------------ images
/** A frame with no fill exports transparent; Storybook renders on paper. Same ground for both. */
export function flatten(png) {
  for (let i = 0; i < png.width * png.height; i++) {
    const a = png.data[i * 4 + 3] / 255
    if (a === 1) continue
    for (let c = 0; c < 3; c++) png.data[i * 4 + c] = Math.round(png.data[i * 4 + c] * a + PAPER[c] * (1 - a))
    png.data[i * 4 + 3] = 255
  }
  return png
}

/** Cut a region out of a PNG. Figma's export covers the RENDER bounds — a drop shadow
 * bleeds past the frame — while Playwright shoots the element box, so exports are cropped
 * to the frame's own bounding box before comparing. */
export function cropTo(png, x, y, w, h) {
  x = Math.max(0, Math.round(x)); y = Math.max(0, Math.round(y))
  w = Math.min(Math.round(w), png.width - x); h = Math.min(Math.round(h), png.height - y)
  if (x === 0 && y === 0 && w === png.width && h === png.height) return png
  const out = new PNG({ width: w, height: h })
  PNG.bitblt(png, out, x, y, w, h, 0, 0)
  return out
}

export function padTo(png, w, h) {
  if (png.width === w && png.height === h) return png
  const out = new PNG({ width: w, height: h })
  for (let i = 0; i < w * h; i++) { out.data[i * 4] = PAPER[0]; out.data[i * 4 + 1] = PAPER[1]; out.data[i * 4 + 2] = PAPER[2]; out.data[i * 4 + 3] = 255 }
  PNG.bitblt(png, out, 0, 0, Math.min(png.width, w), Math.min(png.height, h), 0, 0)
  return out
}

/** Pixel-level comparison on the union canvas. diffPct is differing pixels over the union. */
export function comparePngs(a, b) {
  const w = Math.max(a.width, b.width)
  const h = Math.max(a.height, b.height)
  const pa = padTo(a, w, h)
  const pb = padTo(b, w, h)
  const diff = new PNG({ width: w, height: h })
  // includeAA:false — anti-aliased pixels are detected and skipped; Figma and Chromium
  // rasterise the same glyph differently and that is not drift.
  const differing = pixelmatch(pa.data, pb.data, diff.data, w, h, { threshold: 0.2, includeAA: false, diffColor: [196, 104, 75], diffColorAlt: [122, 140, 92] })
  return {
    diffPct: Math.round((differing / (w * h)) * 10000) / 100,
    differing,
    diff,
    size: { figma: [a.width / SCALE, a.height / SCALE], storybook: [b.width / SCALE, b.height / SCALE] },
    sizeDelta: [Math.abs(a.width - b.width) / SCALE, Math.abs(a.height - b.height) / SCALE],
  }
}

/** Figma | Storybook | diff, side by side on paper, for a human to read. */
export function strip(a, b, diff, gap = 16 * SCALE) {
  const h = Math.max(a.height, b.height, diff.height)
  const w = a.width + b.width + diff.width + gap * 2
  const out = padTo(new PNG({ width: 1, height: 1 }), w, h)
  let x = 0
  for (const img of [a, b, diff]) { PNG.bitblt(img, out, 0, 0, img.width, img.height, x, 0); x += img.width + gap }
  return out
}

// ------------------------------------------------------------------ verdicts + report
export function verdict(result, baseline) {
  if (!baseline) return 'unbaselined'
  const worse = result.diffPct - baseline.diffPct > REGRESSION_PCT
  const moved = Math.abs(result.size.storybook[0] - baseline.storybook[0]) > REGRESSION_PX || Math.abs(result.size.storybook[1] - baseline.storybook[1]) > REGRESSION_PX
    || Math.abs(result.size.figma[0] - baseline.figma[0]) > REGRESSION_PX || Math.abs(result.size.figma[1] - baseline.figma[1]) > REGRESSION_PX
  return worse || moved ? 'regression' : 'ok'
}

export function renderSummary(rows, { strict = false } = {}) {
  const L = []
  const reg = rows.filter((r) => r.verdict === 'regression')
  const un = rows.filter((r) => r.verdict === 'unbaselined')
  L.push(`## Figma ↔ Storybook visual diff — ${rows.length} pairs · ${reg.length} regression${reg.length === 1 ? '' : 's'} · ${un.length} unbaselined${strict ? '' : ' · report-only'}`)
  L.push('')
  L.push('| pair | diff % | accepted | size Figma → Storybook (CSS px) | verdict |')
  L.push('|---|---:|---:|---|---|')
  for (const r of rows) {
    const size = r.error ? '—' : `${r.size.figma.join('×')} → ${r.size.storybook.join('×')}${r.sizeDelta.some((d) => d > REGRESSION_PX) ? ' ⚠' : ''}`
    L.push(`| ${r.kind}/${r.name}${r.strip ? ` ([strip](${r.strip}))` : ''} | ${r.error ? '—' : r.diffPct.toFixed(2)} | ${r.baseline ? r.baseline.diffPct.toFixed(2) : '—'} | ${size} | ${r.error ? `error: ${r.error}` : r.verdict} |`)
  }
  if (reg.length) { L.push(''); L.push(`Regressions name the page; open its strip (Figma | Storybook | diff) in the artifact. A change made on purpose is accepted with \`--update-baseline\` after reading the strip.`) }
  return L.join('\n')
}

/** The accepted numbers, built from a run's summary.json (a CI artifact). */
export function baselineFrom(summary, previous = { pairs: {} }) {
  const pairs = { ...previous.pairs }
  for (const r of summary.rows) if (!r.error) pairs[r.name] = { diffPct: r.diffPct, figma: r.size.figma, storybook: r.size.storybook, story: r.story, frameId: r.frameId, at: summary.at.slice(0, 10) }
  return { platform: summary.platform ?? 'linux (CI)', pairs }
}

// ------------------------------------------------------------------ Figma export
async function figmaExport(token, ids) {
  const urls = {}
  for (let i = 0; i < ids.length; i += 20) {
    const batch = ids.slice(i, i + 20)
    const r = await fetch(`https://api.figma.com/v1/images/${FILE_KEY}?ids=${encodeURIComponent(batch.join(','))}&format=png&scale=${SCALE}`, { headers: { 'X-Figma-Token': token } })
    if (!r.ok) throw new Error(`Figma images ${r.status}: ${await r.text()}`)
    Object.assign(urls, (await r.json()).images)
  }
  return urls
}

/** Each frame's bounding box and render bounds (effects included), to crop the export by. */
async function figmaBounds(token, ids) {
  const out = {}
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50)
    const r = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${encodeURIComponent(batch.join(','))}&depth=1`, { headers: { 'X-Figma-Token': token } })
    if (!r.ok) throw new Error(`Figma nodes ${r.status}: ${await r.text()}`)
    const { nodes } = await r.json()
    for (const id of batch) { const d = nodes[id]?.document; if (d) out[id] = { box: d.absoluteBoundingBox, render: d.absoluteRenderBounds ?? d.absoluteBoundingBox } }
  }
  return out
}

// ------------------------------------------------------------------ Storybook render
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.ico': 'image/x-icon' }
function serve(dir) {
  const server = http.createServer((req, res) => {
    const p = join(dir, decodeURIComponent(req.url.split('?')[0]))
    if (!existsSync(p) || statSync(p).isDirectory()) { res.statusCode = 404; return res.end() }
    res.setHeader('content-type', MIME[extname(p)] || 'application/octet-stream')
    createReadStream(p).pipe(res)
  })
  return new Promise((r) => server.listen(0, () => r({ server, port: server.address().port })))
}

// The block must get the width Figma's frame had, inside a DESKTOP viewport: the pages were
// drawn at their desktop layouts (hero at its 1280 px size, four stat cards in a row), and
// Tailwind's breakpoints read the viewport, not the container. So the viewport is 1280 wide
// (or wider for a wider frame), the frame's height tall (fullscreen stories fill it), and the
// preview wrapper is pinned to the frame width + its own canvas padding, centred.
const DESKTOP = 1280
async function renderStory(page, port, storyId, widthCss, heightCss) {
  const inner = Math.round(widthCss + CANVAS_PADDING * 2)
  await page.setViewportSize({ width: Math.max(DESKTOP, inner + 64), height: Math.min(8000, Math.max(400, Math.round(heightCss))) })
  await page.goto(`http://127.0.0.1:${port}/iframe.html?id=${storyId}&viewMode=story&globals=theme:light`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('#storybook-root')?.children.length > 0, null, { timeout: 15000 })
  await page.addStyleTag({ content: `#storybook-root > div { width: ${inner}px !important; max-width: none !important; margin: 0 auto !important; box-sizing: border-box !important; }` })
  await page.evaluate(() => document.fonts.ready)
  // Charts (Recharts) and transitions animate on mount and ignore reduced-motion; a
  // screenshot mid-animation swings the number by points. Freeze CSS motion and wait it out.
  await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' })
  await page.waitForTimeout(1500)
  // the theme wrapper's first real child: the block itself, without the canvas padding
  const target = await page.evaluateHandle(() => {
    const wrapper = document.querySelector('#storybook-root > div')
    const kids = [...(wrapper?.children ?? [])].filter((el) => !el.matches('section[aria-label], ol[data-sonner-toaster]'))
    return kids.length === 1 ? kids[0] : wrapper
  })
  const el = target.asElement()
  return PNG.sync.read(await el.screenshot({ type: 'png' }))
}

// ------------------------------------------------------------------ main
async function main(argv = process.argv.slice(2)) {
  const opts = { out: '.visual/out', sb: '.visual/sb', pairs: null, strict: false, update: false, from: null }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--out') opts.out = argv[++i]
    else if (a === '--sb') opts.sb = argv[++i]
    else if (a === '--pairs') opts.pairs = argv[++i].split(',')
    else if (a === '--strict') opts.strict = true
    else if (a === '--update-baseline') opts.update = true
    else if (a === '--baseline-from') opts.from = argv[++i]
    else throw new Error(`unknown option ${a}`)
  }
  // The nightly runs on Linux and text rasterises differently there (a few pairs even wrap
  // differently), so the accepted numbers must come from a CI run's summary.json, never
  // from a laptop: download the artifact and point --baseline-from at it.
  if (opts.from) {
    const summary = JSON.parse(readFileSync(resolve(root, opts.from), 'utf8'))
    writeFileSync(BASELINE_PATH, JSON.stringify(baselineFrom(summary), null, 1) + '\n')
    console.log(`baseline written from ${opts.from}: ${summary.rows.filter((r) => !r.error).length} pairs (${summary.at.slice(0, 10)}) → figma/visual-baseline.json`)
    return 0
  }
  const token = process.env.FIGMA_TOKEN
  if (!token) { console.log('figma-visual-diff: no FIGMA_TOKEN — skipped.'); return 0 }
  const out = resolve(root, opts.out)
  const sb = resolve(root, opts.sb)
  if (!existsSync(join(sb, 'index.json'))) throw new Error(`no static Storybook at ${sb} — run: npm run build-storybook -- -o ${opts.sb} --quiet`)
  mkdirSync(out, { recursive: true })
  // map-stories expects <dir>/sb; point a link at the build so the map lands in <out>
  if (!existsSync(join(out, 'sb'))) symlinkSync(sb, join(out, 'sb'))
  execFileSync(process.execPath, [join(root, 'scripts/figma-type-audit/map-stories.mjs'), out], { stdio: 'ignore' })
  const state = JSON.parse(readFileSync(join(root, 'figma/sync-state.json'), 'utf8'))
  const rootsStories = JSON.parse(readFileSync(join(out, 'roots-stories.json'), 'utf8'))
  let pairs = pairsFromState(state, rootsStories)
  if (opts.pairs) pairs = pairs.filter((p) => opts.pairs.includes(p.name))
  const baseline = existsSync(BASELINE_PATH) ? JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) : { pairs: {} }

  console.log(`exporting ${pairs.length} frames from Figma…`)
  const urls = await figmaExport(token, pairs.map((p) => p.frameId))
  const bounds = await figmaBounds(token, pairs.map((p) => p.frameId))
  const { chromium } = await import('playwright')
  const { server, port } = await serve(sb)
  const browser = await chromium.launch()
  const page = await browser.newPage({ deviceScaleFactor: SCALE })
  const rows = []
  for (const p of pairs) {
    const row = { kind: p.kind, name: p.name, frameId: p.frameId, story: p.story }
    try {
      if (!p.story) throw new Error('no story')
      const url = urls[p.frameId]
      if (!url) throw new Error('Figma returned no image (frame missing?)')
      let figma = flatten(PNG.sync.read(Buffer.from(await (await fetch(url)).arrayBuffer())))
      const b = bounds[p.frameId]
      if (b && b.box && b.render) figma = cropTo(figma, (b.box.x - b.render.x) * SCALE, (b.box.y - b.render.y) * SCALE, b.box.width * SCALE, b.box.height * SCALE)
      const storybook = await renderStory(page, port, p.story, figma.width / SCALE, figma.height / SCALE)
      const result = comparePngs(figma, storybook)
      const dir = join(out, 'pairs', p.name)
      mkdirSync(dir, { recursive: true })
      writeFileSync(join(dir, 'figma.png'), PNG.sync.write(figma))
      writeFileSync(join(dir, 'storybook.png'), PNG.sync.write(storybook))
      writeFileSync(join(dir, 'diff.png'), PNG.sync.write(result.diff))
      writeFileSync(join(dir, 'strip.png'), PNG.sync.write(strip(padTo(figma, result.diff.width, result.diff.height), padTo(storybook, result.diff.width, result.diff.height), result.diff)))
      Object.assign(row, { diffPct: result.diffPct, size: result.size, sizeDelta: result.sizeDelta, baseline: baseline.pairs[p.name] ?? null, strip: `pairs/${p.name}/strip.png` })
      row.verdict = verdict(result, row.baseline)
      console.log(`  ${p.name.padEnd(24)} ${String(result.diffPct.toFixed(2)).padStart(6)}%  ${result.size.figma.join('×')} → ${result.size.storybook.join('×')}  ${row.verdict}`)
    } catch (e) {
      row.error = e.message
      console.log(`  ${p.name.padEnd(24)} error: ${e.message}`)
    }
    rows.push(row)
  }
  await browser.close()
  server.close()
  rmSync(join(out, 'sb'))

  const summary = renderSummary(rows, { strict: opts.strict })
  writeFileSync(join(out, 'summary.md'), summary)
  writeFileSync(join(out, 'summary.json'), JSON.stringify({ at: new Date().toISOString(), platform: `${process.platform}${process.env.CI ? ' (CI)' : ' (local)'}`, strict: opts.strict, rows }, null, 1))
  if (process.env.GITHUB_STEP_SUMMARY) writeFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n', { flag: 'a' })
  if (opts.update) {
    if (!process.env.CI) console.log('note: a local baseline will not match the Linux nightly — prefer --baseline-from <CI summary.json>')
    for (const r of rows) if (!r.error) baseline.pairs[r.name] = { diffPct: r.diffPct, figma: r.size.figma, storybook: r.size.storybook, story: r.story, frameId: r.frameId, at: new Date().toISOString().slice(0, 10) }
    writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 1) + '\n')
    console.log(`baseline written: ${rows.filter((r) => !r.error).length} pairs → figma/visual-baseline.json`)
  }
  const regressions = rows.filter((r) => r.verdict === 'regression').length
  console.log(`\n${rows.length} pairs · ${regressions} regressions · ${rows.filter((r) => r.verdict === 'unbaselined').length} unbaselined · ${rows.filter((r) => r.error).length} errors → ${out}/summary.md`)
  return opts.strict && regressions ? 1 : 0
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) process.exit(await main())
