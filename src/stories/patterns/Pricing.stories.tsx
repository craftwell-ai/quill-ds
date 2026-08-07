import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Pricing as PricingBlock } from '@registry/blocks/pricing'
import { usage } from '@/usage/pricing.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Marketing / Pricing',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Pricing: Story = {
  render: () => <PricingBlock />,
}
