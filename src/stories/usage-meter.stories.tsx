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
const STOP = /(?:rgba?|oklab|oklch|color)\([^()]*(?:\([^()]*\)[^()]*)*\)/g
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
    // Said in words beside the amount, in view and in the value a screen reader hears; the total never goes away.
    await expect(canvas.getByText('Running low')).toBeVisible()
    await expect(canvas.getByText('of 5,000')).toBeVisible()
    await expect(canvasElement.querySelector('[data-slot="usage-bar"] p span')).toHaveTextContent('120 left · Running low')
    await expect(canvas.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '120 of 5,000 credits left. Running low')
    await expect(canvasElement.querySelector('[data-slot="usage-meter"]')).toHaveAttribute('data-low', 'true')
    // A low meter keeps the gradient: the bar does not change colour.
    await expect(getComputedStyle(fillOf(canvasElement)).backgroundImage).toContain('linear-gradient')
    const track = compositeOver(getComputedStyle(trackOf(canvasElement)).backgroundColor, `rgb(${surfaceBehind(trackOf(canvasElement)).join(' ')})`)
    const stops = getComputedStyle(fillOf(canvasElement)).backgroundImage.match(STOP) ?? []
    const ratios = stops.map((stop) => contrastRatio(compositeOver(stop, `rgb(${track.join(' ')})`), track))
    console.log(`usage-meter low fill stops on track ${ratios.map((ratio) => ratio.toFixed(2)).join(' / ')}`)
    for (const ratio of ratios) await expect(ratio).toBeGreaterThanOrEqual(3)
  },
}

export const RunningLowCard: Story = {
  args: { remaining: 120 },
  play: async ({ canvas, canvasElement }) => {
    const card = canvas.getByRole('group', { name: 'AI credits' })
    await expect(within(card).getByText('Running low')).toBeVisible()
    await expect(within(card).getByText('of 5,000')).toBeVisible()
    await expect(getComputedStyle(fillOf(canvasElement)).backgroundImage).toContain('linear-gradient')
  },
}

// The total must stay on the bar's line, inside its box, when the bar is narrow and the left group has more to say.
export const RunningLowNarrow: Story = {
  args: { variant: 'bar', remaining: 120 },
  decorators: [(Story) => <div className="w-[15rem]"><Story /></div>],
  play: async ({ canvas, canvasElement }) => {
    const root = canvasElement.querySelector('[data-slot="usage-meter"]') as HTMLElement
    const total = canvas.getByText('of 5,000').getBoundingClientRect()
    const box = root.getBoundingClientRect()
    await expect(box.width).toBeCloseTo(240, 0)
    await expect(total.right).toBeLessThanOrEqual(box.right + 0.5)
    await expect(total.left).toBeGreaterThanOrEqual(box.left - 0.5)
    // The total is one line, not broken across two.
    await expect(total.height).toBeLessThan(24)
    await expect(root.scrollWidth).toBeLessThanOrEqual(Math.ceil(box.width))
    await expect(canvas.getByText('Running low')).toBeVisible()
    // Squeezed well past the brief, the left group still wraps rather than push the total out.
    root.parentElement!.style.width = '10rem'
    const squeezed = canvas.getByText('of 5,000').getBoundingClientRect()
    await expect(squeezed.right).toBeLessThanOrEqual(root.getBoundingClientRect().right + 0.5)
    await expect(squeezed.height).toBeLessThan(24)
    await expect(root.scrollWidth).toBeLessThanOrEqual(Math.ceil(root.getBoundingClientRect().width))
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
    // The ring looks the same low or not: what a sighted person reads is exactly the ordinary line.
    const seen = root.cloneNode(true) as HTMLElement
    seen.querySelectorAll('.sr-only').forEach((node) => node.remove())
    await expect(seen.textContent?.trim()).toBe('120 credits left')
    await expect(root).toHaveAttribute('data-low', 'true')
    // Low is for screen readers only.
    await expect(root.querySelector('.sr-only')).toHaveTextContent('Running low:')
    await expect(root).toHaveTextContent('Running low: 120 credits left of 5,000')
    await expect(getComputedStyle(root).fontWeight).not.toBe('600')
    const probe = document.createElement('span')
    probe.className = 'text-muted-foreground'
    root.parentElement!.append(probe)
    await expect(getComputedStyle(root).color).toBe(getComputedStyle(probe).color)
    probe.remove()
    const arc = root.querySelector('[data-slot="usage-arc"]') as SVGCircleElement
    await expect(arc.getAttribute('stroke')).toMatch(/^url\(#/)
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
      <UsageMeter variant="compact" label="Sliver ring" remaining={1} total={5000} />
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
    const [emptyRing, sliverRing] = [...canvasElement.querySelectorAll('[data-variant="compact"]')] as HTMLElement[]
    await expect(emptyRing.querySelector('[data-slot="usage-arc"]')).toBeNull()
    // A share under half a percent still draws one unit of the 100, so the round caps show a short stroke and not a bare dot.
    await expect(sliverRing.querySelector('[data-slot="usage-arc"]')?.getAttribute('stroke-dasharray')).toBe('1 100')
    // No breakdown, no table; no action, no empty row.
    await expect(canvas.queryByRole('table')).toBeNull()
  },
}

// The gradient fill has to read against its track in every theme (WCAG 1.4.11, 3:1), at both ends.
export const FillReadsOnItsTrack: Story = {
  args: { variant: 'bar', remaining: 5000 },
  play: async ({ canvasElement }) => {
    const track = compositeOver(getComputedStyle(trackOf(canvasElement)).backgroundColor, `rgb(${surfaceBehind(trackOf(canvasElement)).join(' ')})`)
    const stops = getComputedStyle(fillOf(canvasElement)).backgroundImage.match(STOP) ?? []
    await expect(stops.length).toBeGreaterThanOrEqual(3)
    // Log every stop first so one failure does not hide the others.
    const ratios = stops.map((stop) => contrastRatio(compositeOver(stop, `rgb(${track.join(' ')})`), track))
    stops.forEach((stop, index) => console.log(`usage-meter stop ${stop} on track ${ratios[index].toFixed(2)}:1`))
    for (const ratio of ratios) await expect(ratio).toBeGreaterThanOrEqual(3)
  },
}

// The compact ring's three gradient stops have to read against the ring's track, which nothing else measures.
export const RingReadsOnItsTrack: Story = {
  args: { variant: 'compact', remaining: 5000 },
  decorators: [(Story) => <div className="grid place-items-center"><Story /></div>],
  play: async ({ canvasElement }) => {
    const ringTrack = canvasElement.querySelector('[data-slot="usage-ring-track"]') as SVGCircleElement
    const track = compositeOver(getComputedStyle(ringTrack).stroke, `rgb(${surfaceBehind(ringTrack).join(' ')})`)
    const stops = [...canvasElement.querySelectorAll('linearGradient stop')] as SVGStopElement[]
    await expect(stops).toHaveLength(3)
    const ratios = stops.map((stop) => contrastRatio(compositeOver(getComputedStyle(stop).stopColor, `rgb(${track.join(' ')})`), track))
    ratios.forEach((ratio, index) => console.log(`usage-meter ring stop ${index} on track ${ratio.toFixed(2)}:1`))
    for (const ratio of ratios) await expect(ratio).toBeGreaterThanOrEqual(3)
  },
}

// A "has not vanished" guard, not a WCAG number: the floor (1.08:1) is chosen from the measured values. With the light track at
// bg-muted/80 the track on its surface measures 1.13 in Dawn and 1.12 in Classic Light (it was 1.10 and 1.09 at /60); the dark
// themes, at full bg-muted, 1.17 to 1.25. The fill, not the track, is what must reach 3:1 (FillReadsOnItsTrack): at /80 its
// weakest stop (the mid one) reads 3.04 on Dawn and 3.56 on Classic Light.
export const TrackReadsAsATrack: Story = {
  args: { variant: 'bar', remaining: 1500 },
  play: async ({ canvasElement }) => {
    const surface = surfaceBehind(trackOf(canvasElement))
    const track = compositeOver(getComputedStyle(trackOf(canvasElement)).backgroundColor, `rgb(${surface.join(' ')})`)
    const ratio = contrastRatio(track, surface)
    console.log(`usage-meter track on surface ${ratio.toFixed(2)}:1`)
    await expect(ratio).toBeGreaterThanOrEqual(1.08)
  },
}

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair usage={usage} id="low-says-so-in-words"
      doExample={<div className="w-80 max-w-full"><UsageMeter variant="bar" remaining={120} total={5000} /></div>}
      dontExample={(
        // Hand-built on purpose: a low meter with a short fill and no words, so the shortness is all that says it.
        <div className="w-80 max-w-full text-sm">
          <div className="grid gap-1.5">
            <p className="flex items-baseline justify-between gap-3 text-sm tabular-nums">
              <span className="text-ink-soft"><span className="text-base font-semibold text-foreground">120</span> left</span>
              <span className="text-muted-foreground">of 5,000</span>
            </p>
            <div className="relative flex h-1.5 w-full items-center overflow-x-hidden rounded-full bg-muted/60 dark:bg-muted">
              <div className="ai-meter h-full w-[2.4%] rounded-full" />
            </div>
          </div>
        </div>
      )} />
  ),
}
