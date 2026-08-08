import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ContactForm as ContactFormBlock } from '@registry/blocks/contact-form'
import { usage } from '@/usage/contact-form.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Forms / Contact form',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const ContactForm: Story = {
  render: () => <ContactFormBlock />,
}
