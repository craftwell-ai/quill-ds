import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TeamSection as TeamSectionBlock } from '@registry/blocks/team-section'
import { usage } from '@/usage/team-section.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Marketing / Team section',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const TeamSection: Story = {
  render: () => <TeamSectionBlock />,
}
