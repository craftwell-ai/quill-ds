import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { EmptyState as EmptyStateBlock } from '@registry/blocks/empty-state'
import { usage } from '@/usage/empty-state.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

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
