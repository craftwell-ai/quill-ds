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
          'Sync-proof fixture: this card exists in code and as a token-bound component on the ❖ Test page in Figma. Edit it in Figma (fill, border, radius, spacing, elevation), then ask Claude to pull the change — it should land here.',
      },
    },
  },
} satisfies Meta<typeof TestCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
