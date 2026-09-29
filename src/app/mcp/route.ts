import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'

import packageJson from '../../../package.json'
import {
  findComponent,
  getComponent,
  getSetup,
  getFoundations,
  FOUNDATION_TOPICS,
  SERVER_INSTRUCTIONS,
  MAX_NAME,
} from '@/mcp/tools.mjs'

const text = (body: string, isError = false) => ({ content: [{ type: 'text' as const, text: body }], isError })

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      'find_component',
      {
        title: 'Find a Quill component',
        description: 'Describe the job ("confirm deleting an account") and get up to five Quill components that fit, best first.',
        inputSchema: z.object({ task: z.string().max(500).describe('What the UI needs to do, in plain words') }),
      },
      async ({ task }) => {
        const res = findComponent(task)
        return text(res.text, !res.ok)
      },
    )
    server.registerTool(
      'get_component',
      {
        title: 'Get a Quill component guide',
        description: "A component's usage guide — when to use it, what to reach for instead, Do/Don't rules, accessibility, tokens — and its exact install command.",
        inputSchema: z.object({ name: z.string().max(MAX_NAME).describe('Component name, e.g. "alert-dialog" or "login-minimal"') }),
      },
      async ({ name }) => {
        const res = getComponent(name)
        return text(res.text, !res.ok)
      },
    )
    server.registerTool(
      'get_setup',
      {
        title: 'Set up Quill in an app',
        description: 'How to install the Quill theme, its five themes and four accents, and the shipped-tokens-only rule.',
        inputSchema: z.object({}),
      },
      async () => text(getSetup()),
    )
    server.registerTool(
      'get_foundations',
      {
        title: 'Quill foundations',
        description: 'Type, spacing, effects (radius, shadow, motion) and principles. Omit topic for all four.',
        inputSchema: z.object({ topic: z.enum(FOUNDATION_TOPICS as [string, ...string[]]).optional() }),
      },
      async ({ topic }) => {
        const res = getFoundations(topic)
        return text(res.text, !res.ok)
      },
    )
  },
  { serverInfo: { name: 'quill', version: packageJson.version }, instructions: SERVER_INSTRUCTIONS },
)

export { handler as GET, handler as POST }
