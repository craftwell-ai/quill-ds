import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { AiPanel, AiSidePanel } from '@registry/blocks/ai-side-panel'
import { AiButton } from '@/components/ui/ai-button'
import { usage } from '@/usage/ai-side-panel.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { compositeOver, contrastRatio, surfaceBehind, washedTop } from '../contrast'
import { expectFocusRing } from '../focus-ring'

// In the canvas the panel gives way to a window shorter than itself, keeping the wrapper's 24px margin (3rem both sides);
// on the Docs page the window is the whole long page, so it keeps its full height. The story is tagged `framed` so the
// Figma visual diff adds those 48px to its window and still captures the 560px panel.
const fitHeight = (viewMode: string, docs: string, canvas: string) => (viewMode === 'docs' ? docs : canvas)

const meta = {
  title: 'Patterns / AI / AI Side Panel',
  component: AiSidePanel,
  tags: ['autodocs', 'framed'],
  // Centred by the theme wrapper in .storybook/preview.tsx, not by Storybook's own `layout: 'centered'`: that is a
  // class on the preview page, which the test runner's page does not have, so the guard tests below could not see it.
  // The panel stays the wrapper's only element, which is what the Figma visual diff screenshots.
  parameters: { layout: 'fullscreen', quillCentered: true, docs: { description: { component: renderUsageDocs(usage) } } },
  args: { onSubmit: fn(), onHistory: fn(), onScopeRemove: fn(), onOpenChange: fn() },
  afterEach: async ({ canvasElement, viewMode }) => {
    // The Docs page runs this hook too, but there the window is the whole long page and the example's box is its preview.
    if (viewMode === 'docs') return
    const target = canvasElement.querySelector<HTMLElement>('section.ai-wash') ?? canvasElement.querySelector<HTMLElement>('button')
    await expect(target).not.toBeNull()
    await expectCentredWithMargin(target as HTMLElement)
  },
  // The panel drawn inline, as one root element: this is what the docs page, the Figma frame and the visual
  // diff show. The Sheet itself is the InASheet story.
  render: (args, { viewMode }) => (
    <AiPanel title={args.title} scope={args.scope} onSubmit={args.onSubmit} onHistory={args.onHistory} onScopeRemove={args.onScopeRemove}
      className={`${fitHeight(viewMode, 'h-[35rem]', 'h-[min(35rem,calc(100dvh-3rem))]')} w-full max-w-sm rounded-xl border border-border shadow-md`} />
  ),
} satisfies Meta<typeof AiSidePanel>

export default meta
type Story = StoryObj<typeof meta>

// The test runner sizes its page from these (addon-vitest reads the viewport global).
const VIEWPORTS = {
  desktop: { name: 'Desktop 1024', styles: { width: '1024px', height: '800px' }, type: 'desktop' },
  short: { name: 'Short 900x480', styles: { width: '900px', height: '480px' }, type: 'desktop' },
  phone: { name: 'Phone 375', styles: { width: '375px', height: '812px' }, type: 'mobile' },
} as const
// Every example sits dead centre on both axes with an even margin on all four sides, and never past the window:
// a framing change that parks it in a corner, lets a fixed height hang past the bottom, or crowds an edge fails here.
// Run after every story's own play (meta `afterEach`), so the end state is what is measured, not the first paint.
const expectCentredWithMargin = async (element: HTMLElement) => {
  const box = element.getBoundingClientRect()
  const pageWidth = document.documentElement.clientWidth
  const margins = { left: box.left, right: pageWidth - box.right, top: box.top, bottom: window.innerHeight - box.bottom }
  await expect(Math.abs(margins.left - margins.right)).toBeLessThanOrEqual(0.5)
  await expect(Math.abs(margins.top - margins.bottom)).toBeLessThanOrEqual(0.5)
  for (const margin of Object.values(margins)) await expect(margin).toBeGreaterThanOrEqual(16)
}

// The thread's scrolling element. Messages scrolled under the header fade out through a mask, which only exists
// while something is scrolled above: 'none' at the very top, a gradient as soon as the thread has moved.
const threadOf = (root: HTMLElement) => root.querySelector('[data-slot="thread"]') as HTMLElement
const fadeOf = (thread: HTMLElement) => getComputedStyle(thread).maskImage

const DESKTOP = { parameters: { viewport: { options: VIEWPORTS } }, globals: { viewport: { value: 'desktop', isRotated: false } } } as const

// Read-only on purpose: this is the story the Figma frame is compared with.
export const Default: Story = {
  ...DESKTOP,
  play: async ({ canvas }) => {
    const panel = canvas.getByRole('region', { name: 'Assistant' })
    await expect(within(panel).getByText('Looking at: Q3 report')).toBeVisible()
    const log = within(panel).getByRole('log', { name: 'Messages' })
    await expect(log).toHaveTextContent('The September dip.')
    await expect(within(log).getByRole('button', { name: 'changelog, source: Changelog: new pricing page' })).toBeVisible()
    await expect(within(log).getByRole('list', { name: 'Follow-ups' })).toHaveAttribute('data-layout', 'list')
    await expect(within(panel).getByRole('textbox', { name: 'Message' })).toBeVisible()
    await expect(within(panel).getByRole('button', { name: 'History' })).toBeVisible()
    // Inline there is nothing to close.
    await expect(within(panel).queryByRole('button', { name: 'Close' })).toBeNull()
    // One wash, on the panel itself, top to bottom: no part paints a band or a fill of its own over it.
    await expect(getComputedStyle(panel).backgroundImage).toContain('gradient')
    for (const part of Array.from(panel.children)) {
      await expect(getComputedStyle(part).backgroundImage).toBe('none')
      await expect(getComputedStyle(part).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    }
    // A short thread has nothing scrolled above it, so nothing fades: the first message is drawn in full.
    const thread = threadOf(panel)
    await expect(thread.scrollTop).toBe(0)
    await expect(fadeOf(thread)).toBe('none')
  },
}

// A window shorter than the panel (a laptop with Storybook's own chrome around the canvas): the panel shrinks to the window
// and the thread scrolls inside it, so the header and the composer are both on screen and the page itself does not scroll.
export const FitsAShortView: Story = {
  parameters: { viewport: { options: VIEWPORTS } },
  globals: { viewport: { value: 'short', isRotated: false } },
  play: async ({ canvas }) => {
    await waitFor(() => expect(window.innerHeight).toBe(480))
    const panel = canvas.getByRole('region', { name: 'Assistant' })
    const box = panel.getBoundingClientRect()
    await expect(box.top).toBeGreaterThanOrEqual(0)
    await expect(box.bottom).toBeLessThanOrEqual(window.innerHeight)
    await expect(canvas.getByRole('textbox', { name: 'Message' })).toBeVisible()
    const composer = canvas.getByRole('textbox', { name: 'Message' }).getBoundingClientRect()
    await expect(composer.bottom).toBeLessThanOrEqual(window.innerHeight)
    await expect(document.documentElement.scrollHeight).toBeLessThanOrEqual(window.innerHeight)
    // The panel shrank to the window minus the usual 24px margin, evenly: the same margin above, below and at the sides.
    await expect(box.top).toBeCloseTo(24, 0)
    await expect(window.innerHeight - box.bottom).toBeCloseTo(24, 0)
    await expect(box.height).toBeCloseTo(window.innerHeight - 48, 0)
  },
}

export const AskAndStop: Story = {
  ...DESKTOP,
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'History' }))
    await expect(args.onHistory).toHaveBeenCalledTimes(1)
    // A suggestion fills the composer; it never sends.
    await userEvent.click(canvas.getByRole('button', { name: 'Draft a fix for the pricing page' }))
    const box = canvas.getByRole('textbox', { name: 'Message' })
    await expect(box).toHaveValue('Draft a fix for the pricing page')
    await expect(args.onSubmit).not.toHaveBeenCalled()
    await userEvent.keyboard('{Enter}')
    await expect(args.onSubmit).toHaveBeenCalledWith('Draft a fix for the pricing page')
    await expect(canvas.getByRole('log', { name: 'Messages' })).toHaveTextContent('Draft a fix for the pricing page')
    // Every reply carries a (usually empty) status region; the working one fills just after it mounts.
    await waitFor(() => expect(canvas.getAllByRole('status').some((region) => region.textContent?.includes('Reading the page'))).toBe(true))
    await userEvent.click(canvas.getByRole('button', { name: 'Stop' }))
    await expect(canvas.getByText('You stopped this answer.')).toBeVisible()
    // Stop unmounts with the working state; the cursor must land back in the box, not on the page.
    await expect(box).toHaveFocus()
  },
}

export const RemoveScope: Story = {
  ...DESKTOP,
  play: async ({ canvas, args }) => {
    const box = canvas.getByRole('textbox', { name: 'Message' })
    await expect(box).toHaveAttribute('placeholder', 'Ask about this')
    await userEvent.click(canvas.getByRole('button', { name: 'Stop looking at Q3 report' }))
    await expect(canvas.queryByText('Looking at: Q3 report')).toBeNull()
    await expect(args.onScopeRemove).toHaveBeenCalledTimes(1)
    // The remove button is gone; the cursor must not fall to the page.
    await expect(box).toHaveFocus()
    await expect(box).toHaveAttribute('placeholder', 'Ask anything')
  },
}

// The app owns the scope and gave no way to remove it: the chip shows, with no dead remove button.
export const ControlledScope: Story = {
  ...DESKTOP,
  args: { scope: 'Pricing page', onScopeRemove: undefined },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Looking at: Pricing page')).toBeVisible()
    await expect(canvasElement.querySelector('[data-slot="scope-chip"] button')).toBeNull()
  },
}

export const NoScope: Story = {
  ...DESKTOP,
  args: { scope: null },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="scope-chip"]')).toBeNull()
    await expect(canvas.getByRole('textbox', { name: 'Message' })).toHaveAttribute('placeholder', 'Ask anything')
  },
}

// The chip sits on the panel's wash, so its outline is measured against the washed colour, where the wash is strongest.
// This outline groups content rather than marking a control, so the floor is "clearly reads as a shape" (the earlier
// invisible pills were 1.1-1.3:1), not WCAG's 3:1 for controls.
export const ScopeChipReadsAsAShape: Story = {
  ...DESKTOP,
  play: async ({ canvasElement }) => {
    const chip = canvasElement.querySelector('[data-slot="scope-chip"]') as HTMLElement
    const surface = surfaceBehind(chip)
    const washed = washedTop(surface, chip)
    const outline = compositeOver(getComputedStyle(chip).borderTopColor, `rgb(${washed.join(' ')})`)
    const ratio = contrastRatio(outline, washed)
    console.log(`ai-side-panel scope chip outline on the wash ${ratio.toFixed(2)}:1`)
    await expect(ratio).toBeGreaterThanOrEqual(2)
  },
}

// Small grey text (the reply's name, a source's detail, "You stopped this answer.") can sit anywhere on the wash, so it
// is measured where the wash is strongest: the very top. WCAG 2.1 AA asks 4.5:1 of text this size.
export const MutedTextOnTheWashMeetsAA: Story = {
  ...DESKTOP,
  play: async ({ canvas }) => {
    const panel = canvas.getByRole('region', { name: 'Assistant' })
    const muted = panel.querySelector('.text-muted-foreground') as HTMLElement
    await expect(muted).not.toBeNull()
    const washed = washedTop(surfaceBehind(muted), muted)
    const ink = compositeOver(getComputedStyle(muted).color, `rgb(${washed.join(' ')})`)
    const ratio = contrastRatio(ink, washed)
    console.log(`ai-side-panel muted text on the wash top ${ratio.toFixed(2)}:1`)
    await expect(ratio).toBeGreaterThanOrEqual(4.5)
  },
}

export const ChipButtonShowsFocusRing: Story = {
  ...DESKTOP,
  play: async ({ canvas }) => {
    await expectFocusRing(canvas.getByRole('button', { name: 'Stop looking at Q3 report' }))
  },
}

// Without onHistory the button is not drawn: no button that does nothing.
export const NoHistory: Story = {
  ...DESKTOP,
  args: { onHistory: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button', { name: 'History' })).toBeNull()
    await expect(canvas.getByRole('region', { name: 'Assistant' })).toBeVisible()
  },
}

// A long thread scrolls inside the panel: the header and the composer stay inside the panel's box.
export const LongThreadScrolls: Story = {
  ...DESKTOP,
  parameters: { docs: { description: { story: 'A long conversation scrolling inside the panel: the header and the composer stay put while the thread moves.' } } },
  // The same frame as every other example (rounded, bordered, shadowed); only the height is shorter so the thread overflows.
  render: (args, { viewMode }) => <AiPanel onSubmit={args.onSubmit} onHistory={args.onHistory} className={`${fitHeight(viewMode, 'h-[28rem]', 'h-[min(28rem,calc(100dvh-3rem))]')} w-full max-w-sm rounded-xl border border-border shadow-md`} />,
  play: async ({ canvas }) => {
    const panel = canvas.getByRole('region', { name: 'Assistant' })
    const box = canvas.getByRole('textbox', { name: 'Message' })
    for (let turn = 1; turn <= 6; turn += 1) {
      await userEvent.type(box, `Question number ${turn}{Enter}`)
      await userEvent.click(await canvas.findByRole('button', { name: 'Stop' }))
    }
    const scroller = threadOf(panel)
    await expect(scroller).toBe(canvas.getByRole('log', { name: 'Messages' }).parentElement?.parentElement)
    await expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight)
    const outer = panel.getBoundingClientRect()
    await expect(panel.getBoundingClientRect().height).toBeLessThanOrEqual(449)
    const composer = box.getBoundingClientRect()
    await expect(composer.bottom).toBeLessThanOrEqual(outer.bottom + 1)
    await expect(composer.top).toBeGreaterThanOrEqual(outer.top)
    const history = canvas.getByRole('button', { name: 'History' }).getBoundingClientRect()
    await expect(history.top).toBeGreaterThanOrEqual(outer.top)
    await expect(history.bottom).toBeLessThanOrEqual(outer.bottom)
    // The newest turn is the one in view.
    await expect(scroller.scrollTop + scroller.clientHeight).toBeGreaterThanOrEqual(scroller.scrollHeight - 2)
    // Messages are scrolled above, so they fade out under the header: a mask (no colour, so the wash shows through
    // in every theme), from clear at the top edge to solid 28px down.
    await waitFor(() => expect(fadeOf(scroller)).toContain('gradient'))
    await expect(fadeOf(scroller)).toMatch(/28px\)$/)
    // A mask is not an element: nothing sits over the thread to take a press meant for a message.
    const edge = scroller.getBoundingClientRect()
    await expect(scroller.contains(document.elementFromPoint(edge.left + edge.width / 2, edge.top + 10))).toBe(true)
    // Back at the very top there is nothing above to fade, and the first thing in the thread is drawn in full.
    scroller.scrollTop = 0
    await waitFor(() => expect(fadeOf(scroller)).toBe('none'))
    scroller.scrollTop = scroller.scrollHeight
    await waitFor(() => expect(fadeOf(scroller)).toMatch(/28px\)$/))
    // A control reached by keyboard is scrolled clear of the fade, so its focus ring is never drawn half-faded.
    // Walking back from the composer passes every control in the thread: the first reply's Copy and source chip
    // (mid-thread), then the chip's remove button (the very top).
    await userEvent.click(box)
    let visited = 0
    for (let press = 0; press < 6; press += 1) {
      await userEvent.tab({ shift: true })
      const focused = document.activeElement as HTMLElement
      if (!scroller.contains(focused)) break
      visited += 1
      await waitFor(() => {
        const fade = /([\d.]+)px\)$/.exec(fadeOf(scroller))
        const fadeBottom = scroller.getBoundingClientRect().top + (fade ? Number(fade[1]) : 0)
        // 3px: the focus ring is drawn outside the control.
        expect(focused.getBoundingClientRect().top - 3).toBeGreaterThanOrEqual(fadeBottom)
      })
    }
    await expect(visited).toBeGreaterThanOrEqual(3)
    // Chromium centres a focused control; other browsers bring it just inside the nearest edge, which here is the
    // faded one. The thread's scroll padding is what keeps it clear there, so that route is measured too.
    const copy = canvas.getByRole('button', { name: 'Copy' })
    scroller.scrollTop = scroller.scrollHeight
    copy.scrollIntoView({ block: 'nearest' })
    await waitFor(() => expect(fadeOf(scroller)).toMatch(/28px\)$/))
    await expect(copy.getBoundingClientRect().top - 3).toBeGreaterThanOrEqual(scroller.getBoundingClientRect().top + 28)
  },
}

// No extra wrapper: a block div around an inline button adds a line box a little taller than the button, which nudged
// it half a pixel off-centre. The story wrapper's own padding is the margin.
const inSheet = (args: Story['args']) => (
  <AiSidePanel {...args} trigger={<AiButton variant="outline">Ask the assistant</AiButton>} />
)

export const InASheet: Story = {
  ...DESKTOP,
  render: inSheet,
  play: async ({ canvas, args }) => {
    // The Sheet renders in a portal on the page body, outside the canvas.
    const page = within(document.body)
    const closed = () => waitFor(() => expect(page.queryByRole('dialog')).toBeNull())
    await expect(page.queryByRole('dialog')).toBeNull()
    await userEvent.click(canvas.getByRole('button', { name: 'Ask the assistant' }))
    let dialog = await page.findByRole('dialog', { name: 'Assistant' })
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true)
    // Opening puts the cursor inside the panel, not on the page behind it.
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))
    // The Sheet fades in, and a faded-out element counts as hidden.
    await waitFor(() => expect(within(dialog).getByText('Looking at: Q3 report')).toBeVisible())
    await expect(within(dialog).getByRole('textbox', { name: 'Message' })).toBeVisible()
    // One Close: the panel's own. The Sheet's corner button is switched off.
    await expect(within(dialog).getAllByRole('button', { name: 'Close' })).toHaveLength(1)
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }))
    await closed()
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false)
    // Closing hands focus back to what opened it.
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Ask the assistant' })).toHaveFocus())
    // Escape closes it too.
    await userEvent.click(canvas.getByRole('button', { name: 'Ask the assistant' }))
    dialog = await page.findByRole('dialog', { name: 'Assistant' })
    await userEvent.keyboard('{Escape}')
    await closed()
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Ask the assistant' })).toHaveFocus())
  },
}

export const Phone: Story = {
  parameters: { viewport: { options: VIEWPORTS } },
  globals: { viewport: { value: 'phone', isRotated: false } },
  render: inSheet,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Ask the assistant' }))
    const dialog = await within(document.body).findByRole('dialog', { name: 'Assistant' })
    await expect(window.innerWidth).toBeLessThanOrEqual(375)
    await waitFor(() => expect(dialog.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth + 1))
    await expect(dialog.getBoundingClientRect().width).toBeLessThanOrEqual(window.innerWidth)
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth)
    await expect(within(dialog).getByRole('textbox', { name: 'Message' })).toBeVisible()
  },
}
