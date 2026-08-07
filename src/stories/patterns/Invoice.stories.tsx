import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Invoice as InvoiceBlock } from '@registry/blocks/invoice'
import { usage } from '@/usage/invoice.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Data / Invoice',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Invoice: Story = {
  render: () => <InvoiceBlock />,
}
