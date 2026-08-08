import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Dashboard as DashboardBlock } from '@registry/blocks/dashboard'
import { expect } from 'storybook/test'
import { usage } from '@/usage/dashboard.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Shells / Dashboard',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Dashboard: Story = {
  render: () => <DashboardBlock />,
  play: async ({ canvasElement }) => {
    const wrapper = canvasElement.querySelector('[data-theme]')
    if (!wrapper) throw new Error('themed wrapper not found')
    expect(wrapper.getBoundingClientRect().height).toBeGreaterThanOrEqual(window.innerHeight)
  },
}
