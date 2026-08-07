import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Faq as FaqBlock } from '@registry/blocks/faq'
import { usage } from '@/usage/faq.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Marketing / FAQ',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Faq: Story = {
  render: () => <FaqBlock />,
}
