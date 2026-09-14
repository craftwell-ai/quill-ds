// The Figma-parity fixture, kept on purpose. `figma/sync-state.json` pairs
// `test-card.tsx` with the `❖ Test` node in the Quill Figma file; the daily
// figma-parity bot and the /figma-pull + /figma-push skills exercise that pair
// before touching real components. It stays in the published catalog because
// its docs description below is written as a public demonstration of the
// automation — hide it with `tags: ['!dev']` if that ever changes.
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
