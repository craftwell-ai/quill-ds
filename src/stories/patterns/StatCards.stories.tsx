import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StatCards as StatCardsBlock } from '@registry/blocks/stat-cards'
import { usage } from '@/usage/stat-cards.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Data / Stat cards',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const StatCards: Story = {
  render: () => <StatCardsBlock />,
}
