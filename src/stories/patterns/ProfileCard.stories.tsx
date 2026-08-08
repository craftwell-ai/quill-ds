import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProfileCard as ProfileCardBlock } from '@registry/blocks/profile-card'
import { usage } from '@/usage/profile-card.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Data / Profile card',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const ProfileCard: Story = {
  render: () => <ProfileCardBlock />,
}
