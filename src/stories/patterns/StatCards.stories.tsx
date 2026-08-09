import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StatCards as StatCardsBlock } from '@registry/blocks/stat-cards'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usage } from '@/usage/stat-cards.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Data / Stat cards',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const StatCards: Story = {
  render: () => <StatCardsBlock />,
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="delta-tone-matches-meaning"
      doExample={
        <Card className="w-[220px]">
          <CardHeader>
            <CardDescription>Open tickets</CardDescription>
            <CardTitle className="text-2xl">27</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="destructive">+6</Badge>
            <span className="ml-2 text-sm text-muted-foreground">vs last month</span>
          </CardContent>
        </Card>
      }
      dontExample={
        <Card className="w-[220px]">
          <CardHeader>
            <CardDescription>Open tickets</CardDescription>
            <CardTitle className="text-2xl">27</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge>+6</Badge>
            <span className="ml-2 text-sm text-muted-foreground">vs last month</span>
          </CardContent>
        </Card>
      }
    />
  ),
}
