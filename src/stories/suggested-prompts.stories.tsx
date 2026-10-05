import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, spyOn, userEvent } from 'storybook/test'
import { SuggestedPrompts } from '../../registry/lib/suggested-prompts'
import { usage } from '@/usage/suggested-prompts.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'
import { expectFocusRing } from './focus-ring'

const FOLLOW_UPS = [{ label: 'Break September down by week' }, { label: 'Compare with Q2' }, { label: 'Draft a note to the team' }]
const STARTERS = [
  { label: 'Brainstorm', detail: 'Ideas for a launch', prompt: 'Brainstorm ideas for our next launch' },
  { label: 'Draft a brief', detail: 'From my notes', prompt: 'Draft a brief from my notes' },
  { label: 'Plan my week', detail: 'Around my meetings', prompt: 'Plan my week around my meetings' },
  { label: 'Find', detail: 'Tasks due soon', prompt: 'Find tasks due soon' },
]

const meta = {
  title: 'Components / SuggestedPrompts',
  component: SuggestedPrompts,
  tags: ['autodocs'],
  parameters: { layout: 'centered', docs: { description: { component: renderUsageDocs(usage) } } },
  decorators: [(Story) => <div className="w-[40rem] max-w-full"><Story /></div>],
  args: { onPick: fn(), suggestions: FOLLOW_UPS },
  argTypes: { layout: { control: 'select', options: ['chips', 'cards', 'list'] } },
} satisfies Meta<typeof SuggestedPrompts>

export default meta
type Story = StoryObj<typeof meta>

export const Chips: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('list', { name: 'Suggestions' })).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Compare with Q2' }))
    await expect(args.onPick).toHaveBeenCalledWith('Compare with Q2')
  },
}
export const Cards: Story = {
  args: { layout: 'cards', suggestions: STARTERS },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Plan my week/ }))
    await expect(args.onPick).toHaveBeenCalledWith('Plan my week around my meetings')
  },
}
export const List: Story = {
  args: { layout: 'list', suggestions: [{ label: 'Summarize this page' }, { label: 'What changed since Monday?' }] },
  play: async ({ canvas, args }) => {
    // The last row needs its own bottom rule, or the list looks unfinished.
    const lastRow = canvas.getByRole('button', { name: /What changed since Monday/ })
    await expect(getComputedStyle(lastRow).borderBottomWidth).toBe('1px')
    await userEvent.click(lastRow)
    await expect(args.onPick).toHaveBeenCalledWith('What changed since Monday?')
  },
}
export const SameLabelTwiceDoesNotCollide: Story = {
  args: { suggestions: [{ label: 'Summarize', prompt: 'Summarize this page' }, { label: 'Summarize', prompt: 'Summarize this thread' }] },
  beforeEach: () => { spyOn(console, 'error') },
  play: async ({ canvas, args }) => {
    const buttons = canvas.getAllByRole('button', { name: 'Summarize' })
    await expect(buttons).toHaveLength(2)
    await userEvent.click(buttons[1])
    await expect(args.onPick).toHaveBeenCalledWith('Summarize this thread')
    // React reports a repeated key through console.error.
    await expect(callsText(console.error)).not.toMatch(/same key/)
  },
}
const callsText = (spy: unknown) => (spy as { mock: { calls: unknown[][] } }).mock.calls.flat().join(' ')
export const ShowFocusRing: Story = {
  render: (args) => (
    <div className="grid gap-4">
      <SuggestedPrompts {...args} layout="chips" suggestions={[{ label: 'Chip one' }]} />
      <SuggestedPrompts {...args} layout="cards" suggestions={[{ label: 'Card one', detail: 'Detail' }]} />
      <SuggestedPrompts {...args} layout="list" suggestions={[{ label: 'List one' }]} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expectFocusRing(canvas.getByRole('button', { name: 'Chip one' }))
    await expectFocusRing(canvas.getByRole('button', { name: /Card one/ }))
    await expectFocusRing(canvas.getByRole('button', { name: 'List one' }))
  },
}
export const DoDont: Story = {
  render: (args) => (
    <DoDontPair usage={usage} id="layout-by-place"
      doExample={<SuggestedPrompts {...args} layout="chips" suggestions={FOLLOW_UPS} />}
      dontExample={<SuggestedPrompts {...args} layout="cards" suggestions={STARTERS} />} />
  ),
}
