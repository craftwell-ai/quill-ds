import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Citation, Sources, type Source } from '../../registry/lib/citations'
import { usage } from '@/usage/citations.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const SOURCES: Source[] = [
  { title: 'Q3 board deck.pdf', label: 'Q3 deck', detail: 'Page 4 · Quarterly targets', snippet: 'July 4,100 · August 4,300 · September 4,800 signups.', kind: 'file' },
  { title: 'signups-sept.csv', label: 'signups-sept', detail: '812 rows', snippet: '4,226 signups, 12% under target.', kind: 'file' },
  { title: 'New pricing page', label: 'changelog', detail: 'craftwell.ai/changelog', snippet: 'Shipped 9 September: annual plans shown first.', href: 'https://craftwell.ai/changelog', kind: 'web' },
]

const meta = {
  title: 'Components / Citations',
  component: Sources,
  tags: ['autodocs'],
  parameters: { layout: 'centered', docs: { description: { component: renderUsageDocs(usage) } } },
  decorators: [(Story) => <div className="w-[34rem] max-w-full"><Story /></div>],
  args: { sources: SOURCES },
} satisfies Meta<typeof Sources>

export default meta
type Story = StoryObj<typeof meta>

const Answer = () => (
  <p className="text-sm leading-relaxed">
    Signups beat target in July and August<Citation source={SOURCES[0]} /> but fell 12% short in September<Citation source={SOURCES[1]} />. The dip matches the pricing page change on 9 September<Citation source={SOURCES[2]} />.
  </p>
)

export const InAnAnswer: Story = {
  render: (args) => <div className="grid gap-3"><Answer /><Sources {...args} /></div>,
  play: async ({ canvas }) => {
    const chip = canvas.getByRole('button', { name: 'Source: Q3 board deck.pdf' })
    await expect(chip).toHaveTextContent('Q3 deck')
    await expect(chip.getBoundingClientRect().height).toBeGreaterThanOrEqual(20)
    await expect(canvas.getByRole('link', { name: 'Source: New pricing page' })).toHaveAttribute('href', 'https://craftwell.ai/changelog')
    // Keyboard focus opens the same preview as hover (it renders in a portal on the page body).
    chip.focus()
    await waitFor(() => expect(within(document.body).getByText('July 4,100 · August 4,300 · September 4,800 signups.')).toBeVisible())
  },
}
export const LongTitleNoLabel: Story = {
  args: { sources: [] },
  render: () => (
    <p className="text-sm">
      Revenue is on plan<Citation source={{ title: 'Quarterly revenue reconciliation workbook, final version for the board', kind: 'file' }} />.
    </p>
  ),
  play: async ({ canvas }) => {
    const chip = canvas.getByRole('button', { name: 'Source: Quarterly revenue reconciliation workbook, final version for the board' })
    // max-w-40 is 10rem; the chip truncates instead of growing with the title.
    const maxWidth = 10 * parseFloat(getComputedStyle(document.documentElement).fontSize)
    await expect(chip.getBoundingClientRect().width).toBeLessThanOrEqual(maxWidth + 1)
    await expect(chip.scrollWidth).toBeGreaterThan(chip.clientWidth)
  },
}
export const SourcesList: Story = {
  play: async ({ canvas }) => {
    const pill = canvas.getByRole('button', { name: /3 sources/ })
    await expect(pill).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(pill)
    await expect(canvas.getByText('signups-sept.csv')).toBeVisible()
  },
}
export const OneSource: Story = {
  args: { sources: [SOURCES[0]], defaultOpen: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /1 source$/ })).toBeVisible()
  },
}
export const NoSources: Story = {
  args: { sources: [] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="sources"]')).toBeNull()
  },
}
export const DoDont: Story = {
  args: { sources: SOURCES },
  render: () => (
    <DoDontPair usage={usage} id="chip-after-claim"
      doExample={<Answer />}
      dontExample={<div className="grid gap-1 text-sm"><p>Signups beat target in July and August but fell 12% short in September. The dip matches the pricing page change.</p><p className="text-xs text-muted-foreground">Sources: Q3 board deck.pdf, signups-sept.csv, New pricing page</p></div>} />
  ),
}
