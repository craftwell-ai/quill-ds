import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DataTable as DataTableBlock } from '@registry/blocks/data-table'
import { usage } from '@/usage/data-table.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Data / Data table',
  component: DataTableBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta<typeof DataTableBlock>
export default meta
type Story = StoryObj<typeof meta>

export const DataTable: Story = {
  render: () => <DataTableBlock />,
}
