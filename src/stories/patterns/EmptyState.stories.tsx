import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { EmptyState as EmptyStateBlock } from '@registry/blocks/empty-state'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { usage } from '@/usage/empty-state.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / State / Empty state',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const EmptyState: Story = {
  render: () => <EmptyStateBlock />,
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="always-pair-with-an-action"
      doExample={
        <div className="flex w-[280px] flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon name="folder_open" size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-medium text-foreground">No projects yet</h3>
            <p className="text-sm text-muted-foreground">
              Create your first project and it’ll show up here.
            </p>
          </div>
          <Button size="sm">
            <Icon name="add" size={16} /> New project
          </Button>
        </div>
      }
      dontExample={
        <div className="flex w-[280px] flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon name="folder_open" size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-medium text-foreground">No projects yet</h3>
            <p className="text-sm text-muted-foreground">
              Create your first project and it’ll show up here.
            </p>
          </div>
        </div>
      }
    />
  ),
}
