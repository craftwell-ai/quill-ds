import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Kanban as KanbanBlock } from '@registry/blocks/kanban'
import { Badge } from '@/components/ui/badge'
import { usage } from '@/usage/kanban.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Data / Kanban board',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Kanban: Story = {
  render: () => <KanbanBlock />,
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="column-count-is-live"
      doExample={
        <div className="flex w-64 shrink-0 flex-col gap-3 rounded-xl bg-muted/50 p-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-medium">In progress</span>
            <Badge variant="secondary">2</Badge>
          </div>
          <div className="flex flex-col gap-2">
            <div className="rounded-lg border border-border bg-card p-3 text-sm">Wave B components</div>
            <div className="rounded-lg border border-border bg-card p-3 text-sm">Icon gallery search</div>
          </div>
        </div>
      }
      dontExample={
        <div className="flex w-64 shrink-0 flex-col gap-3 rounded-xl bg-muted/50 p-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-medium">In progress</span>
            <Badge variant="secondary">2</Badge>
          </div>
          <div className="flex flex-col gap-2">
            <div className="rounded-lg border border-border bg-card p-3 text-sm">Wave B components</div>
          </div>
        </div>
      }
    />
  ),
}
