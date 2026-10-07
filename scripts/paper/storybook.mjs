/**
 * A Storybook for the Paper sync to read. Uses the one at PAPER_STORYBOOK_URL when that
 * answers; otherwise starts `storybook dev` on a free port and stops it when asked.
 *
 * A dev server, not a static build: it is up in about ten seconds and compiles a story
 * when it is first opened, where a build costs minutes before the first story is read.
 */
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { root } from './file.mjs'

const answers = async (base) => { try { return (await fetch(`${base}/index.json`, { signal: AbortSignal.timeout(3000) })).ok } catch { return false } }
const freePort = () => new Promise((resolve, reject) => { const server = createServer(); server.once('error', reject); server.listen(0, '127.0.0.1', () => { const { port } = server.address(); server.close(() => resolve(port)) }) })

/** Returns `{ base, index, stop }`. `index` is Storybook's story list (id → entry). */
export async function ensureStorybook({ base = process.env.PAPER_STORYBOOK_URL, log = console.log, timeoutMs = 180_000 } = {}) {
  let stop = async () => {}
  if (!base || !(await answers(base))) {
    if (base) log(`no Storybook at ${base}: starting one`)
    const port = await freePort()
    base = `http://127.0.0.1:${port}`
    // detached so the whole process group (storybook and its vite workers) can be stopped together
    const child = spawn('npx', ['storybook', 'dev', '-p', String(port), '--ci', '--quiet', '--host', '127.0.0.1'], { cwd: root, stdio: 'ignore', detached: true })
    let exited = null
    child.once('exit', (code) => { exited = code })
    stop = async () => { if (exited === null) { try { process.kill(-child.pid, 'SIGTERM') } catch { /* already gone */ } } }
    const deadline = Date.now() + timeoutMs
    while (!(await answers(base))) {
      if (exited !== null) throw new Error(`Storybook stopped while starting (exit ${exited}): run  npx storybook dev  to see why`)
      if (Date.now() > deadline) { await stop(); throw new Error(`Storybook did not start within ${timeoutMs / 1000}s`) }
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
    log(`Storybook started at ${base}`)
  }
  const index = (await (await fetch(`${base}/index.json`)).json()).entries
  return { base, index, stop }
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' }

/** Serve a built Storybook folder on a free local port (the daily job builds one in its own copy). Returns `{ base, close }`. */
export async function serveStatic(dir) {
  const { createServer: createHttp } = await import('node:http')
  const { createReadStream, existsSync, statSync } = await import('node:fs')
  const { extname, join, normalize } = await import('node:path')
  const server = createHttp((request, response) => {
    let wanted
    // a malformed address (a stray %) must be a 400, not a crash that takes the sync down with it
    try { wanted = decodeURIComponent(request.url.split('?')[0]) } catch { response.statusCode = 400; response.end(); return }
    const path = join(dir, normalize(wanted).replace(/^(\.\.[/\\])+/, ''))
    if (!path.startsWith(dir) || !existsSync(path) || statSync(path).isDirectory()) { response.statusCode = 404; response.end(); return }
    response.setHeader('content-type', MIME[extname(path)] || 'application/octet-stream')
    createReadStream(path).pipe(response)
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  return { base: `http://127.0.0.1:${server.address().port}`, close: () => server.close() }
}
