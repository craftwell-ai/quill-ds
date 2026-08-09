import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StatsBand as StatsBandBlock } from '@registry/blocks/stats-band'
import { usage } from '@/usage/stats-band.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Marketing / Stats band',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const StatsBand: Story = {
  render: () => <StatsBandBlock />,
}

// Numbers stay on the accent-driven token (--accent-pigment) in both
// examples — the rule under test is label presence, not color.
function Stat({ value, label }: { value: string; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="font-heading text-3xl leading-none text-[var(--accent-pigment)]">{value}</span>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  )
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="pair-every-number-with-a-label"
      doExample={
        <div className="flex gap-8">
          <Stat value="56" label="Components" />
          <Stat value="40+" label="Patterns" />
        </div>
      }
      dontExample={
        <div className="flex gap-8">
          <Stat value="56" />
          <Stat value="40+" />
        </div>
      }
    />
  ),
}
