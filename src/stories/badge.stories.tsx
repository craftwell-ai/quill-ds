import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Badge } from '@/components/ui/badge'
import { usage } from '@/usage/badge.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
      description: 'Visual style',
      table: { defaultValue: { summary: 'default' } },
    },
    children: {
      control: 'text',
      description: 'Badge label',
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { variant: 'default', children: 'New' } }
export const Secondary: Story = { args: { variant: 'secondary', children: 'Beta' } }
export const Destructive: Story = { args: { variant: 'destructive', children: 'Error' } }
export const Outline: Story = { args: { variant: 'outline', children: 'Draft' } }
export const Ghost: Story = { args: { variant: 'ghost', children: 'Archive' } }
export const Link: Story = { args: { variant: 'link', children: 'View details' } }

export const AsLink: Story = {
  name: 'As anchor (interactive)',
  render: () => (
    <Badge variant="outline" render={<a href="#" />}>
      Release notes
    </Badge>
  ),
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-2 items-center">
      {(['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'] as const).map((v) => (
        <Badge key={v} variant={v}>{v}</Badge>
      ))}
    </div>
  ),
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="short-label"
      doExample={<Badge>Beta</Badge>}
      dontExample={
        <Badge className="max-w-28">This is a much longer badge label than the component was built for</Badge>
      }
    />
  ),
}
