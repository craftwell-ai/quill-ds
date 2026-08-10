import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { OrderSummary as OrderSummaryBlock } from '@registry/blocks/order-summary'
import { Separator } from '@/components/ui/separator'
import { usage } from '@/usage/order-summary.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

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

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="promo-discount-is-a-visible-line"
      doExample={
        <div className="flex w-[320px] flex-col gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">Pro plan (annual)</span>
            <span className="text-muted-foreground">$180.00</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">Extra seats × 3</span>
            <span className="text-muted-foreground">$54.00</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">Promo SAVE10</span>
            <span className="text-muted-foreground">−$23.40</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total due today</span>
            <span className="text-lg font-medium text-foreground">$210.60</span>
          </div>
        </div>
      }
      dontExample={
        <div className="flex w-[320px] flex-col gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">Pro plan (annual)</span>
            <span className="text-muted-foreground">$180.00</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">Extra seats × 3</span>
            <span className="text-muted-foreground">$54.00</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total due today</span>
            <span className="text-lg font-medium text-foreground">$210.60</span>
          </div>
        </div>
      }
    />
  ),
}
