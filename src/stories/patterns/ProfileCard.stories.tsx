import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProfileCard as ProfileCardBlock } from '@registry/blocks/profile-card'

const meta = {
  title: 'Patterns / Data / Profile card',
  parameters: { layout: 'centered' },
} satisfies Meta
export default meta
type Story = StoryObj

export const ProfileCard: Story = {
  render: () => <ProfileCardBlock />,
}
