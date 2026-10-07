/**
 * A small MCP client for the Paper desktop app (paper.design).
 *
 * Paper serves its tools over streamable HTTP on localhost while the app is open: one POST
 * of JSON-RPC per call, answered as server-sent events. This speaks just enough of that to
 * call tools from a node script, so the Paper sync can run without an agent in the loop.
 *
 *   import { connect } from './client.mjs'
 *   const paper = await connect()
 *   const info = await paper.call('get_basic_info', { fileId })
 */

// A localhost address, not a secret: the app only listens on this machine.
export const DEFAULT_URL = 'http://127.0.0.1:29979/mcp'
export const NOT_OPEN = 'Paper is not open: start the Paper desktop app'
const PROTOCOL = '2025-03-26'

export class PaperError extends Error {
  constructor(message, { tool, code } = {}) {
    super(message)
    this.name = 'PaperError'
    this.tool = tool
    this.code = code
  }
}

// ------------------------------------------------------------------ parsing (pure, unit-tested)

/**
 * Every JSON-RPC message in a response body. The server answers `text/event-stream`
 * (events separated by a blank line, a payload possibly split over several `data:` lines)
 * but the spec also allows a plain JSON body, single or batched.
 */
export function parseRpcBody(body, contentType = '') {
  const text = body.trim()
  if (!text) return []
  if (!/event-stream/.test(contentType) && /^[[{]/.test(text)) {
    const parsed = JSON.parse(text)
    return Array.isArray(parsed) ? parsed : [parsed]
  }
  const messages = []
  for (const event of text.split(/\r?\n\r?\n/)) {
    const data = event.split(/\r?\n/).filter((line) => line.startsWith('data:')).map((line) => line.slice(5).replace(/^ /, ''))
    if (!data.length) continue // a comment or a keep-alive
    messages.push(JSON.parse(data.join('\n')))
  }
  return messages
}

/** The response to request `id`; a stream may carry notifications before it. */
export function pickResponse(messages, id) {
  const found = messages.find((message) => message.id === id && ('result' in message || 'error' in message))
  if (!found) throw new PaperError(`no response to request ${id} in the reply`)
  if (found.error) throw new PaperError(found.error.message ?? 'JSON-RPC error', { code: found.error.code })
  return found.result
}

const tryJson = (text) => { try { return JSON.parse(text) } catch { return undefined } }

/**
 * A tool result, unwrapped. Paper answers with one or more text blocks: file-scoped tools
 * may lead with a header block (`{ file, contentHash }`) and the payload follows; image
 * tools add image blocks. `data` is the payload (parsed when it is JSON), `header` the file
 * header when one was sent, `images` any pictures as Buffers.
 */
export function parseToolResult(result, tool = 'tool') {
  const content = result?.content ?? []
  const texts = content.filter((block) => block.type === 'text').map((block) => block.text)
  const parsed = texts.map((text) => ({ text, json: tryJson(text) }))
  const isHeader = (entry) => entry.json && typeof entry.json === 'object' && entry.json.file && entry.json.contentHash && Object.keys(entry.json).length === 2
  if (result?.isError) throw new PaperError(`${tool}: ${parsed.filter((entry) => !isHeader(entry)).map((entry) => entry.text).join(' ').trim() || 'tool error'}`, { tool })
  const header = parsed.find(isHeader)?.json ?? null
  const payload = parsed.filter((entry) => !isHeader(entry))
  const last = payload.at(-1)
  return {
    data: last ? (last.json !== undefined ? last.json : last.text) : (header ?? null),
    header,
    texts,
    images: content.filter((block) => block.type === 'image').map((block) => ({ mimeType: block.mimeType, bytes: Buffer.from(block.data, 'base64') })),
  }
}

// ------------------------------------------------------------------ transport

export class PaperClient {
  constructor({ url = process.env.PAPER_MCP_URL || DEFAULT_URL, fetchImpl = fetch, timeoutMs = 120_000 } = {}) {
    this.url = url
    this.fetch = fetchImpl
    this.timeoutMs = timeoutMs
    this.sessionId = null
    this.nextId = 0
    this.server = null
  }

  async post(message) {
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' }
    if (this.sessionId) headers['mcp-session-id'] = this.sessionId
    let response
    try {
      response = await this.fetch(this.url, { method: 'POST', headers, body: JSON.stringify(message), signal: AbortSignal.timeout(this.timeoutMs) })
    } catch (error) {
      // A refused connection is the app being closed; a timeout is the app being stuck. Different fixes.
      if (error.name === 'TimeoutError') throw new PaperError(`Paper did not answer within ${this.timeoutMs / 1000}s (${message.method})`)
      throw new PaperError(NOT_OPEN, { code: 'not-open' })
    }
    this.sessionId = response.headers.get('mcp-session-id') || this.sessionId
    const body = await response.text()
    if (!response.ok) throw new PaperError(`Paper answered HTTP ${response.status}: ${body.slice(0, 200)}`, { code: response.status })
    return parseRpcBody(body, response.headers.get('content-type') ?? '')
  }

  async request(method, params = {}) {
    const id = ++this.nextId
    return pickResponse(await this.post({ jsonrpc: '2.0', id, method, params }), id)
  }

  async connect() {
    const result = await this.request('initialize', { protocolVersion: PROTOCOL, capabilities: {}, clientInfo: { name: 'quill-paper-sync', version: '0.1.0' } })
    this.server = result.serverInfo
    await this.post({ jsonrpc: '2.0', method: 'notifications/initialized' })
    // The server refuses to be useful until its guide has been read once per session.
    await this.callFull('get_guide', { topic: 'paper-mcp-instructions' })
    return this
  }

  async tools() {
    return (await this.request('tools/list')).tools
  }

  /** Call a tool; the whole unwrapped result (`data`, `header`, `texts`, `images`). */
  async callFull(tool, args = {}) {
    return parseToolResult(await this.request('tools/call', { name: tool, arguments: args }), tool)
  }

  /** Call a tool; just its payload. */
  async call(tool, args = {}) {
    return (await this.callFull(tool, args)).data
  }
}

export async function connect(options) {
  return new PaperClient(options).connect()
}
