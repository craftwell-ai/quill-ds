import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Testimonial as TestimonialBlock } from '@registry/blocks/testimonial'
import { usage } from '@/usage/testimonial.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Marketing / Testimonial',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Testimonial: Story = {
  render: () => <TestimonialBlock />,
}
