import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Notifications as NotificationsBlock } from '@registry/blocks/notifications'
import { usage } from '@/usage/notifications.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Data / Notifications',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Notifications: Story = {
  render: () => <NotificationsBlock />,
}
