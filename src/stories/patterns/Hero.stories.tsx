import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Hero as HeroBlock } from '@registry/blocks/hero'
import { usage } from '@/usage/hero.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Marketing / Hero',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Hero: Story = {
  render: () => <HeroBlock />,
}
