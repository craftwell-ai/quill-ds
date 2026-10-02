import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { AiButton } from '../../registry/lib/ai-button'
import { usage } from '@/usage/ai-button.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / AiButton',
  component: AiButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered', docs: { description: { component: renderUsageDocs(usage) } } },
  argTypes: {
    variant: { control: 'select', options: ['default', 'outline', 'ghost', 'secondary'] },
    children: { control: 'text' },
  },
} satisfies Meta<typeof AiButton>

export default meta
type Story = StoryObj<typeof meta>

export const Outline: Story = {
  args: { variant: 'outline', children: 'Ask AI' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Ask AI' })
    await expect(button.querySelector('svg[aria-hidden="true"]')).not.toBeNull()
  },
}
export const Ghost: Story = { args: { variant: 'ghost', children: 'Summarize' } }

// Every Button size, so the 18px mark can be judged in the small ones (xs is 24px tall).
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {(['xs', 'sm', 'default', 'lg'] as const).map((size) => (
        <AiButton key={size} variant="outline" size={size}>Ask AI ({size})</AiButton>
      ))}
      {/* An icon-only AiButton: the mark is the whole face, so the button carries the name. */}
      <AiButton variant="outline" size="icon" aria-label="Ask AI" />
    </div>
  ),
  play: async ({ canvas }) => {
    for (const size of ['xs', 'sm', 'default', 'lg']) await expect(canvas.getByRole('button', { name: `Ask AI (${size})` })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Ask AI' })).toBeVisible()
  },
}

export const DoDont: Story = {
  render: () => (
    <DoDontPair usage={usage} id="gradient-on-mark-not-label"
      doExample={<AiButton variant="outline">Rewrite</AiButton>}
      dontExample={<button className="ai-text rounded-lg border px-3 py-1.5 text-sm font-semibold">Rewrite</button>} />
  ),
}
