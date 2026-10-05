import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { AiPanel, AiSidePanel } from '@registry/blocks/ai-side-panel'
import { AiButton } from '@/components/ui/ai-button'
import { usage } from '@/usage/ai-side-panel.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { compositeOver, contrastRatio, surfaceBehind, washedTop } from '../contrast'
import { expectFocusRing } from '../focus-ring'

const meta = {
  title: 'Patterns / AI / AI Side Panel',
  component: AiSidePanel,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: renderUsageDocs(usage) } } },
  args: { onSubmit: fn(), onHistory: fn(), onScopeRemove: fn(), onOpenChange: fn() },
  // The panel drawn inline, as one root element: this is what the docs page, the Figma frame and the visual
  // diff show. The Sheet itself is the InASheet story.
  render: (args) => (
    <AiPanel title={args.title} scope={args.scope} onSubmit={args.onSubmit} onHistory={args.onHistory} onScopeRemove={args.onScopeRemove}
      className="h-[35rem] w-full max-w-sm rounded-xl border border-border shadow-md" />
  ),
} satisfies Meta<typeof AiSidePanel>

export default meta
type Story = StoryObj<typeof meta>

// The test runner sizes its page from these (addon-vitest reads the viewport global).
const VIEWPORTS = {
  desktop: { name: 'Desktop 1024', styles: { width: '1024px', height: '800px' }, type: 'desktop' },
  phone: { name: 'Phone 375', styles: { width: '375px', height: '812px' }, type: 'mobile' },
} as const
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
  render: (args) => <AiPanel onSubmit={args.onSubmit} onHistory={args.onHistory} className="h-80 w-full max-w-sm border border-border" />,
  play: async ({ canvas }) => {
    const panel = canvas.getByRole('region', { name: 'Assistant' })
    const box = canvas.getByRole('textbox', { name: 'Message' })
    for (let turn = 1; turn <= 6; turn += 1) {
      await userEvent.type(box, `Question number ${turn}{Enter}`)
      await userEvent.click(await canvas.findByRole('button', { name: 'Stop' }))
    }
    const log = canvas.getByRole('log', { name: 'Messages' })
    const scroller = log.parentElement?.parentElement as HTMLElement
    await expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight)
    const outer = panel.getBoundingClientRect()
    await expect(panel.getBoundingClientRect().height).toBeLessThanOrEqual(321)
    const composer = box.getBoundingClientRect()
    await expect(composer.bottom).toBeLessThanOrEqual(outer.bottom + 1)
    await expect(composer.top).toBeGreaterThanOrEqual(outer.top)
    const history = canvas.getByRole('button', { name: 'History' }).getBoundingClientRect()
    await expect(history.top).toBeGreaterThanOrEqual(outer.top)
    await expect(history.bottom).toBeLessThanOrEqual(outer.bottom)
    // The newest turn is the one in view.
    await expect(scroller.scrollTop + scroller.clientHeight).toBeGreaterThanOrEqual(scroller.scrollHeight - 2)
  },
}

const inSheet = (args: Story['args']) => (
  <div className="p-6"><AiSidePanel {...args} trigger={<AiButton variant="outline">Ask the assistant</AiButton>} /></div>
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
