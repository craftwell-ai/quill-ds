import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { OrderSummary as OrderSummaryBlock } from '@registry/blocks/order-summary'
import { usage } from '@/usage/order-summary.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Data / Order summary',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const OrderSummary: Story = {
  render: () => <OrderSummaryBlock />,
}
