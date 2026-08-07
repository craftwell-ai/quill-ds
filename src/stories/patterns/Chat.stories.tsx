import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Chat as ChatBlock } from '@registry/blocks/chat'
import { usage } from '@/usage/chat.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Data / Chat',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Chat: Story = {
  render: () => <ChatBlock />,
}
