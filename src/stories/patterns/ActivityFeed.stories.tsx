import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ActivityFeed as ActivityFeedBlock } from '@registry/blocks/activity-feed'
import { usage } from '@/usage/activity-feed.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Data / Activity feed',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const ActivityFeed: Story = {
  render: () => <ActivityFeedBlock />,
}
