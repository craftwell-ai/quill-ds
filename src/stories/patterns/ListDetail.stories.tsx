import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ListDetail as ListDetailBlock } from '@registry/blocks/list-detail'
import { usage } from '@/usage/list-detail.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

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
