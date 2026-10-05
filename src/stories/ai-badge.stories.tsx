import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { AiBadge } from '../../registry/lib/ai-badge'
import { ToneBadge } from '../../registry/lib/tone-badge'
import { usage } from '@/usage/ai-badge.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'
import { compositeOver, contrastRatio, surfaceBehind } from './contrast'

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
// The faint divider colour made the pill vanish on the dark themes; a non-text boundary needs 3:1 (WCAG 1.4.11).
export const OutlineIsVisible: Story = {
  args: { children: 'Suggested' },
  play: async ({ canvas }) => {
    const badge = canvas.getByText('Suggested')
    const surface = surfaceBehind(badge)
    const outline = compositeOver(getComputedStyle(badge).borderTopColor, `rgb(${surface.join(' ')})`)
    const ratio = contrastRatio(outline, surface)
    console.log(`ai-badge outline ${ratio.toFixed(2)}:1`)
    await expect(ratio).toBeGreaterThanOrEqual(3)
  },
}
export const Suggested: Story = { args: { children: 'Suggested' } }

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
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
