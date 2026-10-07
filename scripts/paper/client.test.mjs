import { test } from 'node:test'
import assert from 'node:assert/strict'
import { NOT_OPEN, PaperClient, PaperError, parseRpcBody, parseToolResult, pickResponse } from './client.mjs'

// Recorded from paper-desktop 0.5.15 (protocol 2025-03-26), trimmed. No network here: the
// transport test hands the client a fake fetch.
const INITIALIZE = 'event: message\ndata: {"result":{"protocolVersion":"2025-03-26","capabilities":{"tools":{}},"serverInfo":{"name":"paper-desktop","version":"0.5.15"}},"jsonrpc":"2.0","id":1}\n\n'
const HEADER = '{\n  "file": {\n    "id": "01M4AC4WS8H77MJGWHJYZCR909",\n    "name": "Quill Design System"\n  },\n  "contentHash": {\n    "tokens": "811c9dc5"\n  }\n}'
const sse = (message) => `event: message\ndata: ${JSON.stringify(message)}\n\n`

test('an event stream is split into its JSON-RPC messages', () => {
  const [message] = parseRpcBody(INITIALIZE, 'text/event-stream')
  assert.equal(message.id, 1)
  assert.equal(message.result.serverInfo.name, 'paper-desktop')
})

test('a payload split over several data lines is joined; comments and CRLF are tolerated', () => {
  const body = ': keep-alive\r\n\r\nevent: message\r\ndata: {"jsonrpc":"2.0",\r\ndata: "id":7,"result":{"ok":true}}\r\n\r\n'
  assert.deepEqual(parseRpcBody(body, 'text/event-stream'), [{ jsonrpc: '2.0', id: 7, result: { ok: true } }])
})

test('a plain JSON body, single or batched, is accepted too', () => {
  assert.deepEqual(parseRpcBody('{"jsonrpc":"2.0","id":2,"result":{}}', 'application/json'), [{ jsonrpc: '2.0', id: 2, result: {} }])
  assert.equal(parseRpcBody('[{"id":1,"result":1},{"id":2,"result":2}]', 'application/json').length, 2)
  assert.deepEqual(parseRpcBody('', 'text/event-stream'), [])
})

test('the response is picked by id, past any notification; a JSON-RPC error throws', () => {
  const messages = [{ jsonrpc: '2.0', method: 'notifications/progress', params: {} }, { jsonrpc: '2.0', id: 3, result: { tools: [] } }]
  assert.deepEqual(pickResponse(messages, 3), { tools: [] })
  assert.throws(() => pickResponse(messages, 4), /no response to request 4/)
  assert.throws(() => pickResponse([{ id: 5, error: { code: -32602, message: 'Invalid params' } }], 5), (error) => error instanceof PaperError && error.code === -32602)
})

test('a tool result is unwrapped: the file header is set aside and the payload parsed', () => {
  const result = parseToolResult({ content: [{ type: 'text', text: HEADER }, { type: 'text', text: '{"tokens":[{"name":"--color-card","result":"created"}],"count":1}' }] })
  assert.equal(result.header.file.name, 'Quill Design System')
  assert.equal(result.data.tokens[0].name, '--color-card')
})

test('a result with one block, plain text, or only a header still gives data', () => {
  assert.deepEqual(parseToolResult({ content: [{ type: 'text', text: '{"fileId":"abc"}' }] }).data, { fileId: 'abc' })
  assert.equal(parseToolResult({ content: [{ type: 'text', text: '@theme {\n  --color-card: #EFE4CE;\n}' }] }).data.startsWith('@theme'), true)
  assert.equal(parseToolResult({ content: [{ type: 'text', text: HEADER }] }).data.file.id, '01M4AC4WS8H77MJGWHJYZCR909')
  assert.equal(parseToolResult({ content: [] }).data, null)
})

test('a screenshot comes back as bytes', () => {
  const { images } = parseToolResult({ content: [{ type: 'image', mimeType: 'image/jpeg', data: Buffer.from('jpeg-bytes').toString('base64') }] })
  assert.equal(images[0].mimeType, 'image/jpeg')
  assert.equal(images[0].bytes.toString(), 'jpeg-bytes')
})

test('a tool error throws with the tool name and Paper\'s message, without the file header', () => {
  const failed = { isError: true, content: [{ type: 'text', text: HEADER }, { type: 'text', text: 'Node "Rectangle" (Rectangle) cannot have children' }] }
  assert.throws(() => parseToolResult(failed, 'write_html'), (error) => error instanceof PaperError && error.tool === 'write_html' && error.message === 'write_html: Node "Rectangle" (Rectangle) cannot have children')
})

test('connect initialises, keeps the session id, sends the initialized notification and reads the guide', async () => {
  const seen = []
  const fetchImpl = async (url, init) => {
    const message = JSON.parse(init.body)
    seen.push({ method: message.method, tool: message.params?.name, session: init.headers['mcp-session-id'] ?? null, accept: init.headers.Accept })
    const headers = new Headers({ 'content-type': 'text/event-stream', 'mcp-session-id': 'session-1' })
    if (message.method === 'initialize') return new Response(INITIALIZE, { headers })
    if (message.method === 'notifications/initialized') return new Response('', { status: 202, headers })
    return new Response(sse({ jsonrpc: '2.0', id: message.id, result: { content: [{ type: 'text', text: '{"ok":true}' }] } }), { headers })
  }
  const client = await new PaperClient({ url: 'http://paper.test/mcp', fetchImpl }).connect()
  assert.deepEqual(seen.map((call) => call.method), ['initialize', 'notifications/initialized', 'tools/call'])
  assert.equal(seen[2].tool, 'get_guide')
  assert.deepEqual(seen.map((call) => call.session), [null, 'session-1', 'session-1'])
  assert.equal(seen[0].accept, 'application/json, text/event-stream')
  assert.deepEqual(await client.call('get_basic_info', { fileId: 'x' }), { ok: true })
  assert.equal(client.server.version, '0.5.15')
})

test('a refused connection says Paper is not open', async () => {
  const client = new PaperClient({ fetchImpl: async () => { throw new TypeError('fetch failed') } })
  await assert.rejects(client.connect(), (error) => error instanceof PaperError && error.message === NOT_OPEN && error.code === 'not-open')
})

test('the endpoint comes from PAPER_MCP_URL, with the local default', () => {
  const before = process.env.PAPER_MCP_URL
  delete process.env.PAPER_MCP_URL
  assert.equal(new PaperClient().url, 'http://127.0.0.1:29979/mcp')
  process.env.PAPER_MCP_URL = 'http://127.0.0.1:40000/mcp'
  assert.equal(new PaperClient().url, 'http://127.0.0.1:40000/mcp')
  if (before === undefined) delete process.env.PAPER_MCP_URL
  else process.env.PAPER_MCP_URL = before
})
