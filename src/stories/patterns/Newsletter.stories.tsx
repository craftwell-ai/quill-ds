import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Newsletter as NewsletterBlock } from '@registry/blocks/newsletter'
import { usage } from '@/usage/newsletter.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Forms / Newsletter signup',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Newsletter: Story = {
  render: () => <NewsletterBlock />,
}
