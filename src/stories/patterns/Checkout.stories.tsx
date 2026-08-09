import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Checkout as CheckoutBlock } from '@registry/blocks/checkout'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { usage } from '@/usage/checkout.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

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

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="lock-icon-signals-secure-submit"
      doExample={
        <Button>
          Pay $58.00 <Icon name="lock" size={14} />
        </Button>
      }
      dontExample={<Button>Pay $58.00</Button>}
    />
  ),
}
