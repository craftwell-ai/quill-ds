import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AnalyticsCharts as AnalyticsChartsBlock } from '@registry/blocks/analytics-charts'
import { usage } from '@/usage/analytics-charts.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Data / Analytics charts',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const AnalyticsCharts: Story = {
  render: () => <AnalyticsChartsBlock />,
}
