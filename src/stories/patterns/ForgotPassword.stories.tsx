import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ForgotPassword as ForgotPasswordBlock } from '@registry/blocks/forgot-password'
import { usage } from '@/usage/forgot-password.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Auth / Forgot password',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const ForgotPassword: Story = {
  render: () => <ForgotPasswordBlock />,
}
