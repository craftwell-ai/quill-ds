import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PageHeader as PageHeaderBlock } from '@registry/blocks/page-header'
import { usage } from '@/usage/page-header.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Shells / Page header',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const PageHeader: Story = {
  render: () => <PageHeaderBlock />,
}
