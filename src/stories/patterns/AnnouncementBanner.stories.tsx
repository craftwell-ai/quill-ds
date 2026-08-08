import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AnnouncementBanner as AnnouncementBannerBlock } from '@registry/blocks/announcement-banner'
import { usage } from '@/usage/announcement-banner.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Marketing / Announcement banner',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const AnnouncementBanner: Story = {
  render: () => <AnnouncementBannerBlock />,
}
