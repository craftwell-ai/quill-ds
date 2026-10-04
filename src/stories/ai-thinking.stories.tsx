import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent } from 'storybook/test'
import { AiThinking, formatThoughtFor } from '../../registry/lib/ai-thinking'
import { usage } from '@/usage/ai-thinking.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / AiThinking',
  component: AiThinking,
  tags: ['autodocs'],
  parameters: { layout: 'centered', docs: { description: { component: renderUsageDocs(usage) } } },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
} satisfies Meta<typeof AiThinking>

export default meta
type Story = StoryObj<typeof meta>

const STEPS = ['Loaded signups-sept.csv, 812 rows', 'Compared each month with the targets in Q3 board deck.pdf', 'Checked what changed around 9 September']

export const Working: Story = {
  args: { status: 'working', activity: 'Reading signups-sept.csv' },
  play: async ({ canvas }) => {
    const region = canvas.getByRole('status')
    await expect(region).toHaveTextContent('Thinking')
    await expect(region).toHaveTextContent('Reading signups-sept.csv')
  },
}
export const Done: Story = {
  args: { status: 'done', seconds: 8, steps: STEPS },
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: 'Thought for 8 s' })
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(canvas.queryByText(STEPS[0])).not.toBeVisible()
    await userEvent.click(toggle)
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByText(STEPS[0])).toBeVisible()
  },
}
export const DoneWithoutSteps: Story = {
  args: { status: 'done', seconds: 98 },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button')).toBeNull()
    await expect(canvas.getByText('Thought for 1 min 38 s')).toBeVisible()
  },
}
export const FormatsDurations: Story = {
  args: { status: 'done' },
  play: async () => {
    await expect(formatThoughtFor(0.2)).toBe('1 s')
    await expect(formatThoughtFor(8)).toBe('8 s')
    await expect(formatThoughtFor(98)).toBe('1 min 38 s')
    await expect(formatThoughtFor(120)).toBe('2 min')
  },
}
export const DoDont: Story = {
  args: { status: 'done' },
  render: () => (
    <DoDontPair usage={usage} id="motion-only-while-working"
      doExample={<div className="grid gap-2"><AiThinking status="done" seconds={8} steps={STEPS} /><p className="text-sm">September missed target by 12%.</p></div>}
      dontExample={<div className="grid gap-2"><AiThinking status="working" /><p className="text-sm">September missed target by 12%.</p></div>} />
  ),
}
