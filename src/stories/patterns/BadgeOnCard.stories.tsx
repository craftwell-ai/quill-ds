import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BadgeOnCard as BadgeOnCardBlock } from '@registry/blocks/badge-on-card'
import { usage } from '@/usage/badge-on-card.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Data / Badge on card',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

// Regression guard: destructive Badge on a card surface must pass AA contrast (was 4.45:1).
export const BadgeOnCard: Story = {
  render: () => <BadgeOnCardBlock />,
}
