import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StatsBand as StatsBandBlock } from '@registry/blocks/stats-band'
import { usage } from '@/usage/stats-band.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Marketing / Stats band',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const StatsBand: Story = {
  render: () => <StatsBandBlock />,
}
