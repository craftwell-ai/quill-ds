import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Chat as ChatBlock } from '@registry/blocks/chat'
import { usage } from '@/usage/chat.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

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

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="align-by-sender"
      doExample={
        <div className="flex w-[280px] flex-col gap-2 rounded-xl border border-border bg-card p-4">
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl bg-muted px-3 py-2 text-sm text-foreground">
              Did the new tokens land?
            </div>
          </div>
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl bg-primary px-3 py-2 text-sm text-primary-foreground">
              Yep — merged this morning.
            </div>
          </div>
        </div>
      }
      dontExample={
        <div className="flex w-[280px] flex-col gap-2 rounded-xl border border-border bg-card p-4">
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl bg-muted px-3 py-2 text-sm text-foreground">
              Did the new tokens land?
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl bg-primary px-3 py-2 text-sm text-primary-foreground">
              Yep — merged this morning.
            </div>
          </div>
        </div>
      }
    />
  ),
}
