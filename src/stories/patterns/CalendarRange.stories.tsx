import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CalendarRange as CalendarRangeBlock } from '@registry/blocks/calendar-range'
import { usage } from '@/usage/calendar-range.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

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
