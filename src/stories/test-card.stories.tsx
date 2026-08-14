import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TestCard } from '@/components/ui/test-card'

const meta = {
  title: 'Sandbox / Test',
  component: TestCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'This is a demonstration of an agentic design system running an automation to ensure parity between design and code.',
      },
    },
  },
} satisfies Meta<typeof TestCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
