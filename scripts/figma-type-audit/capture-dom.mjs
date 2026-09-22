// For every mapped story: the computed type metrics of each element that owns text.
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { chromium } from 'playwright'
const dir = process.argv[2]
const roots = JSON.parse(fs.readFileSync(path.join(dir, 'roots-stories.json'), 'utf8'))
const sb = path.join(dir, 'sb')
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.ico': 'image/x-icon' }
const server = http.createServer((req, res) => {
  const p = path.join(sb, decodeURIComponent(new URL(req.url, 'http://x').pathname))
  const f = fs.existsSync(p) && fs.statSync(p).isDirectory() ? path.join(p, 'index.html') : p
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end() }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res)
})
await new Promise((r) => server.listen(0, r))
const port = server.address().port
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const collect = () => {
  const rows = []
  const root = document.querySelector('#storybook-root')
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)
  for (let el = walker.currentNode; el; el = walker.nextNode()) {
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ').replace(/\s+/g, ' ').trim()
    if (!own) continue
    const cs = getComputedStyle(el)
    const rect = el.getBoundingClientRect()
    const size = parseFloat(cs.fontSize)
    const lhPx = cs.lineHeight === 'normal' ? null : parseFloat(cs.lineHeight)
    const lsPx = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing)
    let h = el; let inHeading = false; while (h && h !== root) { if (/^H[1-6]$/.test(h.tagName)) { inHeading = true; break } h = h.parentElement }
    rows.push({ chars: own.slice(0, 60), tag: el.tagName.toLowerCase(), inHeading, family: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(), weight: cs.fontWeight, italic: cs.fontStyle === 'italic', size: Math.round(size * 100) / 100, lh: lhPx === null ? 'normal' : Math.round((lhPx / size) * 10000) / 100 + '%', ls: Math.round((lsPx / size) * 10000) / 100 + '%', transform: cs.textTransform === 'none' ? '' : cs.textTransform, visible: rect.width > 0 && rect.height > 0 && cs.visibility !== 'hidden', slot: el.getAttribute('data-slot') || '', cls: (el.getAttribute('class') || '').slice(0, 90) })
  }
  return rows
}
let done = 0, failed = []
for (const r of roots) {
  const stories = {}
  for (const id of r.storyIds) {
    const page = await ctx.newPage()
    try {
      await page.goto(`http://127.0.0.1:${port}/iframe.html?id=${id}&viewMode=story&globals=theme:light`, { waitUntil: 'domcontentloaded' })
      await page.waitForFunction(() => { const el = document.querySelector('#storybook-root'); return el && el.innerHTML.trim().length > 0 }, null, { timeout: 15000 })
      await page.evaluate(() => document.fonts.ready)
      stories[id] = await page.evaluate(collect)
    } catch (e) { failed.push(`${id}: ${String(e.message).slice(0, 80)}`) }
    await page.close()
  }
  fs.writeFileSync(path.join(dir, 'dom', `${r.kind}__${r.name.replace(/[\/ ]/g, '-')}.json`), JSON.stringify({ kind: r.kind, name: r.name, code: r.code, stories }, null, 1))
  done++
}
await browser.close(); server.close()
console.log('roots captured:', done, '· stories failed:', failed.length); if (failed.length) console.log(failed.slice(0, 8).join('\n'))
