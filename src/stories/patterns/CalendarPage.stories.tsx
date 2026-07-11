import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CalendarPage as CalendarPageBlock } from '@registry/blocks/calendar-page'

const meta = {
  title: 'Patterns / Data / Calendar page',
  parameters: { layout: 'centered' },
} satisfies Meta
export default meta
type Story = StoryObj

export const CalendarPage: Story = {
  render: () => <CalendarPageBlock />,
}
