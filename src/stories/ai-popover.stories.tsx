import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { AiPopover } from '../../registry/lib/ai-popover'
import { Button } from '@/components/ui/button'
import { usage } from '@/usage/ai-popover.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'
import { compositeOver, contrastRatio, washedTop } from './contrast'

const ORIGINAL = 'Signups beat target in July and August but missed it in September by twelve percent, which we think is about the pricing page.'
const SUGGESTION = 'Signups beat target in July and August but fell 12% short in September, likely because of the new pricing page.'
const TITLE = 'Rewrite: shorter'

// The test runner sizes its page from these (addon-vitest reads the viewport global), the same way the pattern stories do.
const VIEWPORTS = {
  desktop: { name: 'Desktop 1280', styles: { width: '1280px', height: '720px' }, type: 'desktop' },
  phone320: { name: 'Phone 320', styles: { width: '320px', height: '640px' }, type: 'mobile' },
  short: { name: 'Short 600x360', styles: { width: '600px', height: '360px' }, type: 'mobile' },
} as const

const meta = {
  title: 'Components / AiPopover',
  component: AiPopover,
  tags: ['autodocs'],
  parameters: { layout: 'centered', docs: { description: { component: renderUsageDocs(usage) } } },
  // The popover is anchored to text inside running prose, as it is in a document. This is the meta's render (not a
  // decorator) so the stories with their own render, and the Do/Don't pair, are not wrapped in the sentence.
  render: (args) => (
    <div className="w-[26rem] max-w-full text-sm leading-relaxed text-ink-soft">
      Q3 closed ahead of plan. <AiPopover {...args} /> <span data-testid="after">We will revisit in October.</span>
    </div>
  ),
  args: {
    title: TITLE,
    suggestion: SUGGESTION,
    onReplace: fn(),
    onRetry: fn(),
    onDiscard: fn(),
    onOpenChange: fn(),
    children: <mark className="rounded-sm bg-gold/25 px-0.5 text-foreground">{ORIGINAL}</mark>,
  },
} satisfies Meta<typeof AiPopover>

export default meta
type Story = StoryObj<typeof meta>
type Canvas = ReturnType<typeof within>

// The popover renders in a portal on the page body, outside the canvas.
const page = () => within(document.body)
const anchor = (canvas: Canvas) => canvas.getByRole('button', { name: ORIGINAL })
const openFrom = async (canvas: Canvas) => {
  await userEvent.click(anchor(canvas))
  return page().findByRole('dialog', { name: TITLE })
}
const closed = () => waitFor(() => expect(page().queryByRole('dialog')).toBeNull())

export const Suggestion: Story = {
  play: async ({ canvas }) => {
    await expect(page().queryByRole('dialog')).toBeNull()
    const dialog = await openFrom(canvas)
    await expect(within(dialog).getByText(SUGGESTION)).toBeVisible()
    await expect(within(dialog).getByRole('button', { name: 'Discard' })).toBeVisible()
    await expect(within(dialog).getByRole('button', { name: 'Try again' })).toBeVisible()
    await expect(within(dialog).getByRole('button', { name: 'Replace' })).toBeVisible()
    // Insert below only appears when the app asks for it.
    await expect(within(dialog).queryByRole('button', { name: 'Insert below' })).toBeNull()
    // The wash, and the two-star mark in the header.
    await expect(getComputedStyle(dialog).backgroundImage).toContain('gradient')
    await expect(dialog.querySelectorAll('svg path').length).toBe(2)
    // The original stays on the page underneath.
    await expect(canvas.getByText(ORIGINAL)).toBeVisible()
  },
}

export const ReplaceIsPlain: Story = {
  play: async ({ canvas, args }) => {
    const dialog = await openFrom(canvas)
    const replace = within(dialog).getByRole('button', { name: 'Replace' })
    await expect(replace).toHaveAttribute('data-slot', 'button')
    await expect(getComputedStyle(replace).backgroundImage).toBe('none')
    await expect(getComputedStyle(within(dialog).getByText(SUGGESTION)).backgroundImage).toBe('none')
    await userEvent.click(replace)
    await expect(args.onReplace).toHaveBeenCalledTimes(1)
    await closed()
  },
}

export const StaysOpenUntilDismissed: Story = {
  play: async ({ canvas, args }) => {
    // A press inside the popover does not close it.
    let dialog = await openFrom(canvas)
    await userEvent.click(within(dialog).getByText(SUGGESTION))
    await expect(dialog).toBeVisible()
    // Escape closes it, and that is not a Discard.
    await userEvent.keyboard('{Escape}')
    await closed()
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false)
    await expect(args.onDiscard).not.toHaveBeenCalled()
    // A second press on the anchor closes it.
    dialog = await openFrom(canvas)
    await userEvent.click(anchor(canvas))
    await closed()
    await expect(args.onDiscard).not.toHaveBeenCalled()
    // A press outside closes it.
    dialog = await openFrom(canvas)
    await userEvent.click(canvas.getByTestId('after'))
    await closed()
    await expect(args.onDiscard).not.toHaveBeenCalled()
    await expect(args.onReplace).not.toHaveBeenCalled()
  },
}

export const TryAgainStaysOpen: Story = {
  play: async ({ canvas, args }) => {
    const dialog = await openFrom(canvas)
    await userEvent.click(within(dialog).getByRole('button', { name: 'Try again' }))
    await expect(args.onRetry).toHaveBeenCalledTimes(1)
    await expect(dialog).toBeVisible()
  },
}

export const NoRetryCallbackHidesTryAgain: Story = {
  args: { onRetry: undefined },
  play: async ({ canvas }) => {
    const dialog = await openFrom(canvas)
    await expect(within(dialog).queryByRole('button', { name: 'Try again' })).toBeNull()
    await expect(within(dialog).getAllByRole('button')).toHaveLength(2)
  },
}

export const InsertBelow: Story = {
  args: { onInsertBelow: fn() },
  play: async ({ canvas, args }) => {
    const dialog = await openFrom(canvas)
    await userEvent.click(within(dialog).getByRole('button', { name: 'Insert below' }))
    await expect(args.onInsertBelow).toHaveBeenCalledTimes(1)
    await expect(args.onReplace).not.toHaveBeenCalled()
    await closed()
  },
}

export const Discard: Story = {
  play: async ({ canvas, args }) => {
    const dialog = await openFrom(canvas)
    await userEvent.click(within(dialog).getByRole('button', { name: 'Discard' }))
    await expect(args.onDiscard).toHaveBeenCalledTimes(1)
    await closed()
  },
}

// After Try again there is a moment with no suggestion: the label shimmers, Replace waits, and the change is announced.
export const WritingThenReady: Story = {
  args: { suggestion: undefined, working: true },
  render: function Render(args) {
    const [working, setWorking] = React.useState(true)
    // A button in the story would count as a press outside the popover, so the test asks with an event.
    React.useEffect(() => {
      const finish = () => setWorking(false)
      window.addEventListener('quill-story-finish-writing', finish)
      return () => window.removeEventListener('quill-story-finish-writing', finish)
    }, [])
    return <AiPopover {...args} working={working} suggestion={working ? undefined : SUGGESTION} />
  },
  play: async ({ canvas }) => {
    // The region must be in the popover before its text: record what it holds the moment it appears.
    let firstText: string | null = null
    const observer = new MutationObserver(() => {
      const region = document.body.querySelector('[role="dialog"] [role="status"]')
      if (region && firstText === null) firstText = region.textContent
    })
    observer.observe(document.body, { childList: true, subtree: true })
    const dialog = await openFrom(canvas)
    const region = within(dialog).getByRole('status')
    await waitFor(() => expect(region).toHaveTextContent('Writing'))
    observer.disconnect()
    await expect(firstText).toBe('')
    const label = dialog.querySelector('[data-slot="writing-label"]') as HTMLElement
    await expect(label).toBeVisible()
    await expect(label).toHaveAttribute('aria-hidden', 'true')
    await expect(dialog.querySelector('[data-slot="suggestion"]')).toBeNull()
    await expect(within(dialog).getByRole('button', { name: 'Replace' })).toBeDisabled()
    await expect(within(dialog).getByRole('button', { name: 'Try again' })).toBeDisabled()
    await expect(within(dialog).getByRole('button', { name: 'Discard' })).toBeEnabled()
    window.dispatchEvent(new Event('quill-story-finish-writing'))
    await waitFor(() => expect(region).toHaveTextContent('Suggestion ready'))
    await expect(within(dialog).getByRole('status')).toBe(region)
    await expect(within(dialog).getByText(SUGGESTION)).toBeVisible()
    await expect(within(dialog).getByRole('button', { name: 'Replace' })).toBeEnabled()
  },
}

// A popover that opens with a finished suggestion has nothing to announce.
export const ReadySuggestionStaysQuiet: Story = {
  play: async ({ canvas }) => {
    const dialog = await openFrom(canvas)
    await new Promise((resolve) => setTimeout(resolve, 300))
    await expect(within(dialog).getByRole('status').textContent).toBe('')
  },
}

export const EmptySuggestion: Story = {
  args: { suggestion: '   ' },
  play: async ({ canvas }) => {
    const dialog = await openFrom(canvas)
    await expect(dialog.querySelector('[data-slot="suggestion"]')).toBeNull()
    await expect(within(dialog).getByRole('button', { name: 'Replace' })).toBeDisabled()
  },
}

// The tile sits on the popover's wash, so the outline is measured against the washed colour, where the wash is strongest.
// This outline groups content rather than marking a control, so the floor is "clearly reads as a shape" (the earlier
// invisible pills were 1.1-1.3:1), not WCAG's 3:1 for controls.
export const SuggestionReadsAsAShape: Story = {
  play: async ({ canvas }) => {
    const dialog = await openFrom(canvas)
    const tile = dialog.querySelector('[data-slot="suggestion"]') as HTMLElement
    const surface = compositeOver(getComputedStyle(dialog).backgroundColor, 'rgb(255 255 255)')
    const washed = washedTop(surface, tile)
    const outline = compositeOver(getComputedStyle(tile).borderTopColor, `rgb(${washed.join(' ')})`)
    const ratio = contrastRatio(outline, washed)
    console.log(`ai-popover suggestion outline on the wash ${ratio.toFixed(2)}:1`)
    await expect(ratio).toBeGreaterThanOrEqual(2)
  },
}

// Opening puts focus on the dialog (named by its title); every way of closing puts it back on the anchor.
export const FocusMovesInAndBack: Story = {
  args: { onInsertBelow: fn() },
  play: async ({ canvas }) => {
    const closers: Array<[string, (dialog: HTMLElement) => Promise<unknown>]> = [
      ['Replace', async (dialog) => userEvent.click(within(dialog).getByRole('button', { name: 'Replace' }))],
      ['Discard', async (dialog) => userEvent.click(within(dialog).getByRole('button', { name: 'Discard' }))],
      ['Insert below', async (dialog) => userEvent.click(within(dialog).getByRole('button', { name: 'Insert below' }))],
      ['Escape', async () => userEvent.keyboard('{Escape}')],
      ['outside press', async () => userEvent.click(canvas.getByTestId('after'))],
      ['second press on the anchor', async () => userEvent.click(anchor(canvas))],
    ]
    for (const [name, close] of closers) {
      const dialog = await openFrom(canvas)
      await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true), { timeout: 2000 })
      await close(dialog)
      await closed()
      await waitFor(() => expect(document.activeElement, `focus after ${name}`).toBe(anchor(canvas)))
    }
  },
}

// Opening with the keyboard: Enter on the anchor, focus is inside the dialog and Enter held down cannot press Discard.
export const KeyboardOpenDoesNotDiscard: Story = {
  play: async ({ canvas, args }) => {
    anchor(canvas).focus()
    await userEvent.keyboard('{Enter}')
    const dialog = await page().findByRole('dialog', { name: TITLE })
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))
    await expect(document.activeElement).not.toBe(within(dialog).getByRole('button', { name: 'Discard' }))
    await expect(args.onDiscard).not.toHaveBeenCalled()
    // Focus rests on the dialog itself, so the dialog has to show it.
    await expect(document.activeElement).toBe(dialog)
    await expect(getComputedStyle(dialog).boxShadow).toContain('3px')
  },
}

// Try again swaps the suggestion for the shimmer and disables the button: focus stays in the dialog.
export const FocusSurvivesTryAgain: Story = {
  render: function Render(args) {
    const [working, setWorking] = React.useState(false)
    return <AiPopover {...args} working={working} suggestion={working ? undefined : SUGGESTION} onRetry={() => { args.onRetry?.(); setWorking(true) }} />
  },
  play: async ({ canvas }) => {
    const dialog = await openFrom(canvas)
    await userEvent.click(within(dialog).getByRole('button', { name: 'Try again' }))
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Replace' })).toBeDisabled())
    await expect(dialog.querySelector('[data-slot="suggestion"]')).toBeNull()
    await expect(dialog.contains(document.activeElement)).toBe(true)
    await expect(document.activeElement).not.toBe(document.body)
    // And Escape still closes it, returning focus to the anchor.
    await userEvent.keyboard('{Escape}')
    await closed()
    await waitFor(() => expect(document.activeElement).toBe(anchor(canvas)))
  },
}

// Motion stops under reduced motion; the label stays readable. The test cannot switch the browser's setting, so it reads
// the stylesheet: inside a reduced-motion media rule, both the shimmer and the line must have their animation turned off.
export const WritingHoldsStillWhenReduced: Story = {
  args: { suggestion: undefined, working: true },
  play: async ({ canvas }) => {
    const dialog = await openFrom(canvas)
    const label = dialog.querySelector('[data-slot="writing-label"]') as HTMLElement
    const line = dialog.querySelector('.ai-line') as HTMLElement
    const stopped = (element: HTMLElement) => {
      let found = false
      // Quill writes `.ai-line { @media (prefers-reduced-motion: reduce) { animation: none } }`: a media rule nested in a style rule.
      const walk = (rules: CSSRuleList, insideReduced: boolean, selector: string | null) => {
        for (const rule of Array.from(rules)) {
          if (rule instanceof CSSMediaRule) walk(rule.cssRules, insideReduced || rule.conditionText.includes('prefers-reduced-motion: reduce'), selector)
          else if (rule instanceof CSSStyleRule) {
            const own = selector && !rule.selectorText.includes('&') ? rule.selectorText : rule.selectorText.replace(/&/g, selector ?? '')
            if (own.includes('ai-line'))             if (insideReduced && rule.style.animationName === 'none' && element.matches(own)) found = true
            walk(rule.cssRules, insideReduced, own)
          } else if ('style' in rule) {
            // Declarations written directly inside a nested media rule arrive as a nested-declarations block of the selector above.
            if (insideReduced && (rule as CSSStyleRule).style.animationName === 'none' && selector && element.matches(selector)) found = true
          } else if ('cssRules' in rule) walk((rule as CSSGroupingRule).cssRules, insideReduced, selector)
        }
      }
      for (const sheet of Array.from(document.styleSheets)) { try { walk(sheet.cssRules, false, null) } catch { /* cross-origin sheet */ } }
      return found
    }
    await expect(stopped(label)).toBe(true)
    await expect(stopped(line)).toBe(true)
    await expect(label).toBeVisible()
  },
}

// Long unbroken text wraps inside the popover, and on a real 320px-wide viewport the popover fits.
// The viewport global sizes the test page and the width is asserted before anything is measured.
export const LongTextWraps: Story = {
  args: { suggestion: 'x'.repeat(220) + ' ' + 'verylongunbrokenwordwithoutanyspacesatallthatwouldoverflow'.repeat(4) },
  parameters: { viewport: { options: VIEWPORTS } },
  globals: { viewport: { value: 'phone320', isRotated: false } },
  play: async ({ canvas }) => {
    await waitFor(() => expect(window.innerWidth).toBe(320))
    const dialog = await openFrom(canvas)
    const tile = dialog.querySelector('[data-slot="suggestion"]') as HTMLElement
    const rect = dialog.getBoundingClientRect()
    // The popup clips what overflows it, so the tile itself has to end inside the popup.
    await expect(tile.getBoundingClientRect().right).toBeLessThanOrEqual(rect.right)
    await expect(tile.scrollWidth).toBeLessThanOrEqual(tile.clientWidth)
    // The width is capped to the viewport less 1rem; the positioner keeps the box inside the screen with its own small margin.
    await expect(rect.width).toBeLessThanOrEqual(320 - 16 + 0.5)
    await expect(rect.right).toBeLessThanOrEqual(320 - 4)
    await expect(rect.left).toBeGreaterThanOrEqual(4)
  },
}

// A suggestion taller than the space left on screen scrolls inside the popover; the action row stays reachable.
export const TallSuggestionKeepsActionsReachable: Story = {
  // The anchor stays uncovered here, so it uses a fill that keeps its text readable in every theme.
  args: { children: <mark className="rounded-sm bg-muted px-0.5 text-foreground">{ORIGINAL}</mark>, suggestion: Array.from({ length: 60 }, (_, line) => `Line ${line + 1} of a long rewritten passage.`).join(' ') },
  render: (args) => (
    <div className="fixed inset-x-0 top-2/3 text-sm text-ink-soft"><AiPopover {...args} /></div>
  ),
  parameters: { viewport: { options: VIEWPORTS } },
  globals: { viewport: { value: 'short', isRotated: false } },
  play: async ({ canvas, args }) => {
    await waitFor(() => expect(window.innerHeight).toBe(360))
    const dialog = await openFrom(canvas)
    const tile = dialog.querySelector('[data-slot="suggestion"]') as HTMLElement
    const scroller = tile.parentElement as HTMLElement
    await expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight)
    await expect(getComputedStyle(scroller).overflowY).toBe('auto')
    const replace = within(dialog).getByRole('button', { name: 'Replace' })
    const box = replace.getBoundingClientRect()
    await expect(box.top).toBeGreaterThanOrEqual(0)
    await expect(box.bottom).toBeLessThanOrEqual(window.innerHeight)
    await expect(within(dialog).getByText(TITLE).getBoundingClientRect().top).toBeGreaterThanOrEqual(0)
    await userEvent.click(replace)
    await expect(args.onReplace).toHaveBeenCalledTimes(1)
  },
}

export const OpensFromAButton: Story = {
  args: { children: <Button variant="outline">Shorten</Button> },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Shorten' }))
    await expect(await page().findByRole('dialog', { name: TITLE })).toBeVisible()
  },
}

// The app owns whether it is open; the popover reports every request to change that.
export const Controlled: Story = {
  render: function Render(args) {
    const [open, setOpen] = React.useState(false)
    return <AiPopover {...args} open={open} onOpenChange={(next) => { setOpen(next); args.onOpenChange?.(next) }} />
  },
  play: async ({ canvas, args }) => {
    const dialog = await openFrom(canvas)
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true)
    await userEvent.click(within(dialog).getByRole('button', { name: 'Replace' }))
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false)
    await closed()
  },
}

export const DoDont: Story = {
  render: () => (
    <DoDontPair usage={usage} id="replace-stays-plain"
      doExample={<div className="flex justify-end gap-1.5"><Button variant="ghost">Discard</Button><Button>Replace</Button></div>}
      dontExample={<div className="flex justify-end gap-1.5"><Button variant="ghost">Discard</Button><Button variant="outline"><span className="ai-text font-semibold">Replace</span></Button></div>} />
  ),
}
