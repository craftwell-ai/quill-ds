import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Checkout as CheckoutBlock } from '@registry/blocks/checkout'
import { usage } from '@/usage/checkout.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Forms / Checkout',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Checkout: Story = {
  render: () => <CheckoutBlock />,
}
