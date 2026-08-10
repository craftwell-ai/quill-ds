import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CalendarRange as CalendarRangeBlock } from '@registry/blocks/calendar-range'
import { Button } from '@/components/ui/button'
import { usage } from '@/usage/calendar-range.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Data / Calendar range',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const CalendarRange: Story = {
  render: () => <CalendarRangeBlock />,
}

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="always-offer-clear"
      doExample={
        <div className="flex w-[320px] items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
          <span className="text-sm text-muted-foreground">July 20 – 24, 2026</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              Clear
            </Button>
            <Button size="sm">Reserve</Button>
          </div>
        </div>
      }
      dontExample={
        <div className="flex w-[320px] items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
          <span className="text-sm text-muted-foreground">July 20 – 24, 2026</span>
          <div className="flex gap-2">
            <Button size="sm">Reserve</Button>
          </div>
        </div>
      }
    />
  ),
}
