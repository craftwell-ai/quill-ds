import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Pricing as PricingBlock } from '@registry/blocks/pricing'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usage } from '@/usage/pricing.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

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

function PlanChip({ name, featured }: { name: string; featured: boolean }) {
  return (
    <Card size="sm" className={`w-[120px] ${featured ? 'ring-2 ring-ring' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between gap-1">
          <CardTitle className="text-sm">{name}</CardTitle>
          {featured && <Badge>Popular</Badge>}
        </div>
      </CardHeader>
    </Card>
  )
}

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="highlight-exactly-one-plan"
      doExample={
        <div className="flex gap-3">
          <PlanChip name="Starter" featured={false} />
          <PlanChip name="Pro" featured={true} />
        </div>
      }
      dontExample={
        <div className="flex gap-3">
          <PlanChip name="Starter" featured={true} />
          <PlanChip name="Pro" featured={true} />
        </div>
      }
    />
  ),
}
