import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SignupSocial as SignupSocialBlock } from '@registry/blocks/signup-social'
import { usage } from '@/usage/signup-social.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Auth / Signup — social first',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const SignupSocial: Story = {
  render: () => <SignupSocialBlock />,
}
