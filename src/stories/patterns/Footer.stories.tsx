import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Footer as FooterBlock } from '@registry/blocks/footer'
import { usage } from '@/usage/footer.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Marketing / Footer',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Footer: Story = {
  render: () => <FooterBlock />,
}
