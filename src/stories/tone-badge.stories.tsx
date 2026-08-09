import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ToneBadge } from '../../registry/lib/tone-badge'
import { usage } from '@/usage/tone-badge.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / ToneBadge',
  component: ToneBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['moss', 'gold', 'terracotta', 'indigo', 'neutral', 'muted'],
      description: 'Pigment vocabulary',
    },
    size: {
      control: 'select',
      options: ['md', 'sm'],
      description: 'md = 20px badge · sm = 16px count-pill scale',
      table: { defaultValue: { summary: 'md' } },
    },
    solid: {
      control: 'boolean',
      description: 'Filled pigment for the strong cue',
      table: { defaultValue: { summary: 'false' } },
    },
    children: { control: 'text', description: 'Pill label (1–2 words)' },
  },
} satisfies Meta<typeof ToneBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Tinted: Story = { args: { tone: 'moss', children: 'trusted' } }
export const Solid: Story = { args: { tone: 'moss', solid: true, children: 'current' } }
export const Small: Story = { args: { tone: 'moss', solid: true, size: 'sm', children: 'current' } }
export const Caution: Story = { args: { tone: 'gold', children: 'developing' } }
export const Attention: Story = { args: { tone: 'terracotta', children: 'red flag' } }
export const Informational: Story = { args: { tone: 'indigo', size: 'sm', children: 'dormant' } }
export const Muted: Story = { args: { tone: 'muted', children: 'building' } }

export const AllTones: Story = {
  args: { tone: 'moss', children: 'tone' },
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {(['moss', 'gold', 'terracotta', 'indigo', 'neutral', 'muted'] as const).map((tone) => (
          <ToneBadge key={tone} tone={tone}>
            {tone}
          </ToneBadge>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {(['moss', 'gold', 'terracotta', 'indigo', 'neutral', 'muted'] as const).map((tone) => (
          <ToneBadge key={tone} tone={tone} solid size="sm">
            {tone}
          </ToneBadge>
        ))}
      </div>
    </div>
  ),
}

export const DoDont: Story = {
  args: { tone: 'moss', children: 'trusted' },
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="no-hand-rolled-pills"
      doExample={<ToneBadge tone="moss">trusted</ToneBadge>}
      dontExample={
        <span className="inline-flex items-center rounded-full bg-moss/20 px-2 py-0.5 text-xs font-medium text-moss-deep uppercase">
          trusted
        </span>
      }
    />
  ),
}
