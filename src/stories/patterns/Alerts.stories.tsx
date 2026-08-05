import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Alerts as AlertsBlock } from '@registry/blocks/alerts'
import { usage } from '@/usage/alerts.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / State / Alerts',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Alerts: Story = {
  render: () => <AlertsBlock />,
}
