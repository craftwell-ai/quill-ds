import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ListDetail as ListDetailBlock } from '@registry/blocks/list-detail'
import { usage } from '@/usage/list-detail.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Shells / List + detail',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const ListDetail: Story = {
  render: () => <ListDetailBlock />,
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="selected-item-stays-visible"
      doExample={
        <ul className="flex w-72 flex-col overflow-hidden rounded-lg border border-border">
          <li className="flex flex-col gap-0.5 border-b border-border bg-accent px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Grace Hopper</span>
              <span className="text-xs text-muted-foreground">9:41</span>
            </div>
            <span className="text-sm text-foreground">Re: Q3 roadmap</span>
          </li>
          <li className="flex flex-col gap-0.5 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Alan Turing</span>
              <span className="text-xs text-muted-foreground">8:02</span>
            </div>
            <span className="text-sm text-foreground">Deploy window</span>
          </li>
        </ul>
      }
      dontExample={
        <ul className="flex w-72 flex-col overflow-hidden rounded-lg border border-border">
          <li className="flex flex-col gap-0.5 border-b border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Grace Hopper</span>
              <span className="text-xs text-muted-foreground">9:41</span>
            </div>
            <span className="text-sm text-foreground">Re: Q3 roadmap</span>
          </li>
          <li className="flex flex-col gap-0.5 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Alan Turing</span>
              <span className="text-xs text-muted-foreground">8:02</span>
            </div>
            <span className="text-sm text-foreground">Deploy window</span>
          </li>
        </ul>
      }
    />
  ),
}
