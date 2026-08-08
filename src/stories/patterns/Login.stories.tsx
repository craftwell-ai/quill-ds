import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Login as LoginBlock } from '@registry/blocks/login'
import { usage } from '@/usage/login.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Auth / Login',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Login: Story = {
  render: () => <LoginBlock />,
}
