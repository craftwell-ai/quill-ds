'use client'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AnalyticsCharts as AnalyticsChartsBlock } from '@registry/blocks/analytics-charts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Area, AreaChart, XAxis, YAxis } from 'recharts'
import { usage } from '@/usage/analytics-charts.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

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

// Same data and chart-token colors as the Audience chart above — the only
// variable is whether a ChartLegend is present.
const dodontTraffic = [
  { month: 'Jan', readers: 820, subscribers: 310 },
  { month: 'Feb', readers: 932, subscribers: 340 },
  { month: 'Mar', readers: 1105, subscribers: 415 },
  { month: 'Apr', readers: 1043, subscribers: 462 },
]
const dodontTrafficConfig = {
  readers: { label: 'Readers', color: 'var(--chart-1)' },
  subscribers: { label: 'Subscribers', color: 'var(--chart-2)' },
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="legend-ties-color-to-name"
      doExample={
        <ChartContainer config={dodontTrafficConfig} className="h-48 w-full">
          <AreaChart data={dodontTraffic}>
            <XAxis dataKey="month" />
            <YAxis width={36} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="readers"
              fill="var(--color-readers)"
              fillOpacity={0.2}
              stroke="var(--color-readers)"
              strokeWidth={2}
              type="monotone"
            />
            <Area
              dataKey="subscribers"
              fill="var(--color-subscribers)"
              fillOpacity={0.2}
              stroke="var(--color-subscribers)"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ChartContainer>
      }
      dontExample={
        <ChartContainer config={dodontTrafficConfig} className="h-48 w-full">
          <AreaChart data={dodontTraffic}>
            <XAxis dataKey="month" />
            <YAxis width={36} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="readers"
              fill="var(--color-readers)"
              fillOpacity={0.2}
              stroke="var(--color-readers)"
              strokeWidth={2}
              type="monotone"
            />
            <Area
              dataKey="subscribers"
              fill="var(--color-subscribers)"
              fillOpacity={0.2}
              stroke="var(--color-subscribers)"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ChartContainer>
      }
    />
  ),
}
