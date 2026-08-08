import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Signup as SignupBlock } from '@registry/blocks/signup'
import { usage } from '@/usage/signup.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Auth / Sign up',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Signup: Story = {
  render: () => <SignupBlock />,
}
