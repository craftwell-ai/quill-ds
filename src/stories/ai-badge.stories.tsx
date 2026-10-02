import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { AiBadge } from '../../registry/lib/ai-badge'
import { ToneBadge } from '../../registry/lib/tone-badge'
import { usage } from '@/usage/ai-badge.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / AiBadge',
  component: AiBadge,
  tags: ['autodocs'],
  parameters: { layout: 'centered', docs: { description: { component: renderUsageDocs(usage) } } },
  argTypes: { children: { control: 'text' } },
} satisfies Meta<typeof AiBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Draft: Story = {
  args: { children: 'AI draft' },
  play: async ({ canvas }) => {
    // getByText returns the badge span itself (the mark is its child svg).
    const badge = canvas.getByText('AI draft')
    await expect(badge.querySelectorAll('svg path').length).toBe(1)
  },
}
export const Suggested: Story = { args: { children: 'Suggested' } }

export const DoDont: Story = {
  args: { children: 'AI draft' },
  render: () => (
    <DoDontPair usage={usage} id="badge-says-ai-made"
      doExample={<AiBadge>AI draft</AiBadge>}
      dontExample={<AiBadge>Active</AiBadge>} />
  ),
}
// ToneBadge import is used by BesideToneBadge.
export const BesideToneBadge: Story = {
  args: { children: 'Suggested' },
  render: () => <div className="flex gap-2"><ToneBadge tone="moss">current</ToneBadge><AiBadge>Suggested</AiBadge></div>,
}
