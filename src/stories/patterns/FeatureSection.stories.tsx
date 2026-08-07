import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FeatureSection as FeatureSectionBlock } from '@registry/blocks/feature-section'
import { usage } from '@/usage/feature-section.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Marketing / Feature section',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const FeatureSection: Story = {
  render: () => <FeatureSectionBlock />,
}
