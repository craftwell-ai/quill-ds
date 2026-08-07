import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CalendarPage as CalendarPageBlock } from '@registry/blocks/calendar-page'
import { usage } from '@/usage/calendar-page.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Data / Calendar page',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const CalendarPage: Story = {
  render: () => <CalendarPageBlock />,
}
