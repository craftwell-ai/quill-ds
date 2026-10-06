import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { UsageMeter } from '../../registry/lib/usage-meter'
import { Button } from '@/components/ui/button'
import { usage } from '@/usage/usage-meter.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair, unlessDoDont } from './DoDont'
import { compositeOver, contrastRatio, surfaceBehind } from './contrast'

const BREAKDOWN = [{ label: 'Chat answers', value: 2400 }, { label: 'Agent tasks', value: 900 }, { label: 'Rewrites', value: 200 }]

const meta = {
  title: 'Components / UsageMeter',
  component: UsageMeter,
  tags: ['autodocs'],
  parameters: { layout: 'centered', docs: { description: { component: renderUsageDocs(usage) } } },
  decorators: [unlessDoDont((Story) => <div className="w-[23.75rem] max-w-full"><Story /></div>)],
  args: { remaining: 1500, total: 5000, renews: 'Renews 1 November', estimate: 'About 150 more long answers.', breakdown: BREAKDOWN, action: <Button variant="outline">Get more credits</Button> },
} satisfies Meta<typeof UsageMeter>

export default meta
type Story = StoryObj<typeof meta>

const fillOf = (root: Element) => root.querySelector('[data-slot="progress-indicator"]') as HTMLElement
const trackOf = (root: Element) => root.querySelector('[data-slot="progress-track"]') as HTMLElement

export const Card: Story = {
  play: async ({ canvas, canvasElement }) => {
    const card = canvas.getByRole('group', { name: 'AI credits' })
    await expect(within(card).getByText('1,500')).toBeVisible()
    await expect(within(card).getByText('of 5,000')).toBeVisible()
    await expect(within(card).getByText('Renews 1 November')).toBeVisible()
    await expect(within(card).getByText('About 150 more long answers.')).toBeVisible()
    const bar = within(card).getByRole('progressbar', { name: 'AI credits left' })
    await expect(bar).toHaveAttribute('aria-valuetext', '1,500 of 5,000 credits left')
    // 30% of the track, measured.
    const share = fillOf(canvasElement).getBoundingClientRect().width / trackOf(canvasElement).getBoundingClientRect().width
    await expect(Math.abs(share - 0.3)).toBeLessThan(0.01)
    // The fill is the AI gradient, and it does not move.
    await expect(getComputedStyle(fillOf(canvasElement)).backgroundImage).toContain('linear-gradient')
    await expect(getComputedStyle(fillOf(canvasElement)).animationName).toBe('none')
    // The breakdown is a real table: three rows, each with a row header.
    const table = within(card).getByRole('table', { name: 'Used so far' })
    await expect(within(table).getAllByRole('rowheader')).toHaveLength(3)
    await expect(within(table).getByRole('row', { name: 'Chat answers 2,400' })).toBeVisible()
    await expect(within(card).getByRole('button', { name: 'Get more credits' })).toBeVisible()
  },
}

export const Bar: Story = {
  args: { variant: 'bar', renews: undefined, estimate: undefined, breakdown: undefined, action: undefined },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.queryByRole('group')).toBeNull()
    await expect(canvas.queryByRole('table')).toBeNull()
    await expect(canvas.getByRole('progressbar', { name: 'AI credits left' })).toBeVisible()
    await expect(canvasElement.querySelector('[data-slot="usage-meter"]')).toHaveAttribute('data-variant', 'bar')
  },
}

export const RunningLow: Story = {
  args: { variant: 'bar', remaining: 120 },
  play: async ({ canvas, canvasElement }) => {
    // Said in words, in view and in the value a screen reader hears.
    await expect(canvas.getByText('Running low')).toBeVisible()
    await expect(canvas.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '120 of 5,000 credits left. Running low')
    // A low meter is terracotta, never the gradient.
    await expect(getComputedStyle(fillOf(canvasElement)).backgroundImage).toBe('none')
    const track = compositeOver(getComputedStyle(trackOf(canvasElement)).backgroundColor, `rgb(${surfaceBehind(trackOf(canvasElement)).join(' ')})`)
    const fill = compositeOver(getComputedStyle(fillOf(canvasElement)).backgroundColor, `rgb(${track.join(' ')})`)
    console.log(`usage-meter low fill on track ${contrastRatio(fill, track).toFixed(2)}:1`)
    await expect(contrastRatio(fill, track)).toBeGreaterThanOrEqual(3)
  },
}

export const Compact: Story = {
  args: { variant: 'compact' },
  decorators: [(Story) => <div className="grid place-items-center"><Story /></div>],
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-slot="usage-meter"]') as HTMLElement
    await expect(root).toHaveAttribute('data-variant', 'compact')
    await expect(root).toHaveTextContent(/1\.5K credits left/)
    await expect(root).toHaveTextContent(/of 5,000/)
    const svg = root.querySelector('svg') as SVGElement
    await expect(svg).toHaveAttribute('aria-hidden', 'true')
    // A ring, not a pie: the arc is a stroke with no fill, and it covers 30 of 100.
    const arc = root.querySelector('[data-slot="usage-arc"]') as SVGCircleElement
    await expect(arc.getAttribute('fill')).toBe('none')
    await expect(arc.getAttribute('stroke-dasharray')).toBe('30 100')
    await expect(arc.getAttribute('stroke')).toMatch(/^url\(#/)
  },
}

export const CompactLow: Story = {
  args: { variant: 'compact', remaining: 120 },
  decorators: [(Story) => <div className="grid place-items-center"><Story /></div>],
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-slot="usage-meter"]') as HTMLElement
    await expect(root).toHaveTextContent('Running low · 120 left')
    const arc = root.querySelector('[data-slot="usage-arc"]') as SVGCircleElement
    await expect(arc.getAttribute('stroke')).toBeNull()
  },
}

// Whatever the app passes, the meter stays a meter.
export const OddNumbers: Story = {
  render: () => (
    <div className="grid gap-4">
      <UsageMeter variant="bar" label="Over" remaining={9000} total={5000} />
      <UsageMeter variant="bar" label="Negative" remaining={-40} total={5000} />
      <UsageMeter variant="bar" label="Not a number" remaining={Number.NaN} total={5000} />
      <UsageMeter variant="bar" label="No allowance" remaining={10} total={0} />
      <UsageMeter variant="compact" label="Empty ring" remaining={0} total={5000} />
      <UsageMeter label="No extras" remaining={2500} total={5000} breakdown={[]} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement).not.toHaveTextContent('NaN')
    await expect(canvas.getByRole('progressbar', { name: 'Over left' })).toHaveAttribute('aria-valuetext', '5,000 of 5,000 credits left')
    await expect(canvas.getByRole('progressbar', { name: 'Negative left' })).toHaveAttribute('aria-valuetext', '0 of 5,000 credits left. Running low')
    await expect(canvas.getByRole('progressbar', { name: 'Not a number left' })).toHaveAttribute('aria-valuetext', '0 of 5,000 credits left. Running low')
    await expect(canvas.getByRole('progressbar', { name: 'No allowance left' })).toHaveAttribute('aria-valuetext', '0 of 0 credits left. Running low')
    // No fill ever leaves its track.
    for (const track of canvasElement.querySelectorAll<HTMLElement>('[data-slot="progress-track"]')) {
      const fill = track.querySelector('[data-slot="progress-indicator"]') as HTMLElement
      await expect(fill.getBoundingClientRect().right).toBeLessThanOrEqual(track.getBoundingClientRect().right + 0.5)
    }
    // An empty ring draws no arc at all (a zero-length round cap would still paint a dot).
    const emptyRing = [...canvasElement.querySelectorAll('[data-variant="compact"]')].at(-1) as HTMLElement
    await expect(emptyRing.querySelector('[data-slot="usage-arc"]')).toBeNull()
    // No breakdown, no table; no action, no empty row.
    await expect(canvas.queryByRole('table')).toBeNull()
  },
}

// The gradient fill has to read against its track in every theme (WCAG 1.4.11, 3:1), at both ends.
export const FillReadsOnItsTrack: Story = {
  args: { variant: 'bar', remaining: 5000 },
  play: async ({ canvasElement }) => {
    const track = compositeOver(getComputedStyle(trackOf(canvasElement)).backgroundColor, `rgb(${surfaceBehind(trackOf(canvasElement)).join(' ')})`)
    const stops = getComputedStyle(fillOf(canvasElement)).backgroundImage.match(/(?:rgba?|oklab|oklch|color)\([^()]*(?:\([^()]*\)[^()]*)*\)/g) ?? []
    await expect(stops.length).toBeGreaterThanOrEqual(3)
    for (const stop of stops) {
      const colour = compositeOver(stop, `rgb(${track.join(' ')})`)
      console.log(`usage-meter stop ${stop} on track ${contrastRatio(colour, track).toFixed(2)}:1`)
      await expect(contrastRatio(colour, track)).toBeGreaterThanOrEqual(3)
    }
  },
}

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair usage={usage} id="low-says-so-in-words"
      doExample={<div className="w-80 max-w-full"><UsageMeter variant="bar" remaining={120} total={5000} /></div>}
      dontExample={<div className="w-80 max-w-full"><UsageMeter variant="bar" remaining={120} total={5000} lowLabel="of 5,000" /></div>} />
  ),
}
