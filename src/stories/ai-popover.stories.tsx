import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, spyOn, userEvent, waitFor, within } from 'storybook/test'
import { AiPopover } from '../../registry/lib/ai-popover'
import { Button } from '@/components/ui/button'
import { usage } from '@/usage/ai-popover.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'
import { compositeOver, contrastRatio, lineColour, washedTop } from './contrast'

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
      Q3 closed ahead of plan. <AiPopover {...args} /> <span data-testid="after">We&apos;ll revisit in October.</span>
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
    // A suggestion that fits has nothing to scroll, so its area is not a stop of its own: no tabindex, no role, no
    // name, and Tab goes from the popover straight to the first button.
    const area = (dialog.querySelector('[data-slot="suggestion"]') as HTMLElement).parentElement as HTMLElement
    await expect(area.scrollHeight).toBeLessThanOrEqual(area.clientHeight)
    await expect(area).not.toHaveAttribute('tabindex')
    await expect(area).not.toHaveAttribute('role')
    await expect(area).not.toHaveAttribute('aria-label')
    await waitFor(() => expect(dialog).toHaveFocus())
    await userEvent.tab()
    await expect(within(dialog).getByRole('button', { name: 'Discard' })).toHaveFocus()
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

// The suggestion tile is read-only content, so it takes the soft divider line, not the control line that marks things
// to press or type in. What tells it apart from the popover is its FILL (the page colour on the washed popover) plus
// that hairline, so this checks the fill is there and differs from the washed surface, and that the line is the 1px
// divider. Both are measured where the wash is strongest (its top), which is where the tile is hardest to see.
// No contrast floor is asserted: the soft line is not meant to reach 3:1, and the tile holds no control.
// Measured 2026-10-05, fill vs washed popover · hairline vs washed popover:
//   Dawn 1.18:1 · 1.25:1    Dusk 1.41:1 · 1.34:1    Classic Light 1.19:1 · 1.28:1
//   Classic Dark 1.36:1 · 1.45:1    Intelligent 1.33:1 · 1.34:1
// (Until 0.19.0 the tile wore the control line and this test held it to 2:1 on the wash; that floor now belongs to controls only.)
export const SuggestionTakesTheDividerLine: Story = {
  play: async ({ canvas }) => {
    const dialog = await openFrom(canvas)
    const tile = dialog.querySelector('[data-slot="suggestion"]') as HTMLElement
    const washed = washedTop(compositeOver(getComputedStyle(dialog).backgroundColor, 'rgb(255 255 255)'), tile)
    const backdrop = `rgb(${washed.join(' ')})`
    const style = getComputedStyle(tile)
    await expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    const fill = compositeOver(style.backgroundColor, backdrop)
    await expect(fill).not.toEqual(washed)
    await expect(style.borderTopWidth).toBe('1px')
    await expect(style.borderTopStyle).toBe('solid')
    await expect(style.borderTopColor).toBe(lineColour(tile, 'border-border'))
    const hairline = compositeOver(style.borderTopColor, backdrop)
    console.log(`ai-popover suggestion tile: fill vs washed popover ${contrastRatio(fill, washed).toFixed(2)}:1 · hairline vs washed popover ${contrastRatio(hairline, washed).toFixed(2)}:1`)
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
  // Its anchor is fixed to the window, which an inline Docs preview box would cut to 128px; an iframe gives it a window of its own.
  parameters: { viewport: { options: VIEWPORTS }, docs: { story: { inline: false, iframeHeight: 420 } } },
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
    // The overflowing area holds nothing a keyboard can land on, so it is a stop itself: without one, a keyboard user
    // in a browser that does not make scrollers focusable (Safari) could never read past the first lines.
    await waitFor(() => expect(scroller).toHaveAttribute('tabindex', '0'))
    await expect(within(dialog).getByRole('group', { name: 'Suggested text' })).toBe(scroller)
    // Opening still lands on the popover; the area is the next stop, then the buttons.
    await waitFor(() => expect(dialog).toHaveFocus())
    await expect(getComputedStyle(scroller).outlineStyle).toBe('none')
    await userEvent.tab()
    await expect(scroller).toHaveFocus()
    // Drawn as an outline just inside the area: the popover clips anything outside it, and an outline is painted
    // over the text scrolling past, where an inset shadow would be covered by it.
    const focused = getComputedStyle(scroller)
    await expect(focused.outlineStyle).toBe('solid')
    await expect(focused.outlineWidth).toBe('3px')
    await expect(focused.outlineOffset).toBe('-3px')
    // The ring colour at half strength, as on every plain focus target in the kit (ring-ring/50).
    await expect(focused.outlineColor).toMatch(/[,/] ?0\.5\)$/)
    // Arrow and Page keys scroll a focused scroller; that is the browser's own doing, which the test library's
    // made-up key events cannot set off. What can be checked here is that nothing in the popover swallows those keys
    // before the browser gets them. Real key presses were checked by hand-run script in a plain Storybook when this was built.
    for (const key of ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ']) {
      const press = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      scroller.dispatchEvent(press)
      await expect(press.defaultPrevented).toBe(false)
    }
    await expect(page().getByRole('dialog', { name: TITLE })).toBe(dialog)
    await userEvent.tab()
    await expect(within(dialog).getByRole('button', { name: 'Discard' })).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect(scroller).toHaveFocus()
    await userEvent.click(replace)
    await expect(args.onReplace).toHaveBeenCalledTimes(1)
    // Left open at the end, so the accessibility check that follows every story looks at the overflowing popover
    // itself (its rule: a scrollable region must have keyboard access), not at a page it has already left.
    await closed()
    const reopened = await openFrom(canvas)
    await waitFor(() => expect(within(reopened).getByRole('group', { name: 'Suggested text' })).toHaveAttribute('tabindex', '0'))
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

// From here on the popover sits beside a selection, not an element (CRA-280): in a text box or an editor the selected
// text is a range, and there is nothing to wrap. The app passes what to sit beside (`anchor`), drives `open`, and says
// where the cursor goes back to (`returnFocus`).
const PASSAGE = 'Signups beat target in July and August but missed it in September by twelve percent.'
const BEFORE = 'Q3 closed ahead of plan. '
const AFTER = ' We will revisit in October.'
// The box the popover stands in for the selection with: laid over it, never a Tab stop, never pressed, never read out.
const spot = () => document.querySelector('[data-slot="popover-anchor"]') as HTMLElement | null
const selectText = (node: Node, start: number, end: number) => {
  const range = document.createRange()
  range.setStart(node, start)
  range.setEnd(node, end)
  const selection = document.getSelection() as Selection
  selection.removeAllRanges()
  selection.addRange(range)
  return range
}
// The popover sits just below what it is anchored to (the stock 4px gap), its left edge on the anchor's left edge.
// Waited for, with the anchor read afresh each time: the popover fades and slides in, and in a centred Storybook
// canvas the page itself settles a moment after an overlay opens.
const expectBeside = (dialog: HTMLElement, anchorBox: () => DOMRect) => waitFor(() => {
  expect(dialog.getAnimations().filter((animation) => animation.playState === 'running')).toHaveLength(0)
  const box = dialog.getBoundingClientRect()
  const beside = anchorBox()
  expect(box.top - beside.bottom).toBeGreaterThanOrEqual(0)
  expect(box.top - beside.bottom).toBeLessThanOrEqual(6)
  expect(Math.abs(box.left - beside.left)).toBeLessThanOrEqual(1)
})

type AnchorArgs = Omit<React.ComponentProps<typeof AiPopover>, 'anchor' | 'open' | 'returnFocus'>

// An editor in miniature: selecting text in it opens the suggestion beside the selection; Replace swaps the text.
function Editor({ args, text: initial = BEFORE + PASSAGE + AFTER, className, trigger, transform, after }: { args: AnchorArgs; text?: string; className?: string; trigger?: React.ReactElement; transform?: string; after?: React.ReactNode }) {
  const editor = React.useRef<HTMLDivElement>(null)
  const [text, setText] = React.useState(initial)
  const [range, setRange] = React.useState<Range | null>(null)
  const [open, setOpen] = React.useState(false)
  React.useEffect(() => {
    const read = () => {
      const selection = document.getSelection()
      if (!selection || selection.isCollapsed || !editor.current?.contains(selection.anchorNode)) return
      setRange(selection.getRangeAt(0).cloneRange())
      // With a button to ask from, selecting only says where; the button opens it.
      if (!trigger) setOpen(true)
    }
    document.addEventListener('selectionchange', read)
    return () => document.removeEventListener('selectionchange', read)
  }, [trigger])
  const popover = (
    <AiPopover {...args} anchor={range} open={open} returnFocus={trigger ? undefined : editor}
      onOpenChange={(next) => { setOpen(next); args.onOpenChange?.(next) }}
      onReplace={() => { if (range) setText(text.replace(range.toString(), SUGGESTION)); args.onReplace() }}>
      {trigger}
    </AiPopover>
  )
  return (
    <div className="grid w-[26rem] max-w-full gap-3" style={transform ? { transform, transformOrigin: 'top left' } : undefined}>
      {/* A button to ask from sits above the text, as a toolbar does, clear of the popover that opens below the selection. */}
      {trigger ? popover : null}
      {/* key: the text is the editor's own once typed in, so a replaced passage is drawn afresh. */}
      <div key={text} ref={editor} role="textbox" aria-multiline="true" aria-label="Report" tabIndex={0} contentEditable suppressContentEditableWarning
        className={`rounded-lg border border-input bg-background px-3 py-2 text-sm leading-relaxed text-foreground outline-hidden focus-visible:ring-3 focus-visible:ring-ring/50 ${className ?? ''}`}>
        {text}
      </div>
      {trigger ? null : popover}
      {after}
    </div>
  )
}
// The meta's args wrap highlighted text; these stories have nothing to wrap.
const withoutTrigger = (args: React.ComponentProps<typeof AiPopover>): AnchorArgs => ({ ...args, children: undefined })

export const OnATextSelection: Story = {
  parameters: { viewport: { options: VIEWPORTS }, docs: { description: { story: 'Select some of the text: the suggestion opens beside the selection. Nothing is wrapped around the text; the app passes the selection as `anchor`.' } } },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  render: (args) => <Editor args={withoutTrigger(args)} />,
  play: async ({ canvas, args }) => {
    const editor = canvas.getByRole('textbox', { name: 'Report' })
    await expect(page().queryByRole('dialog')).toBeNull()
    // Nothing on the page was turned into a button: the text is still text.
    await expect(canvas.queryByRole('button')).toBeNull()
    const select = () => {
      editor.focus()
      return selectText(editor.firstChild as Text, BEFORE.length, BEFORE.length + PASSAGE.length)
    }
    let range = select()
    let dialog = await page().findByRole('dialog', { name: TITLE })
    await expect(args.onOpenChange).not.toHaveBeenCalled()
    // It sits just below the selection, its left edge on the selection's left edge.
    await expect(range.getBoundingClientRect().width).toBeGreaterThan(100)
    await expectBeside(dialog, () => range.getBoundingClientRect())
    const selected = range.getBoundingClientRect()
    // The stand-in for the selection is not there for people: hidden from screen readers, out of the Tab order, and
    // a press on the selected text reaches the text.
    const standIn = spot() as HTMLElement
    await expect(standIn).toHaveAttribute('aria-hidden', 'true')
    await expect(standIn).toHaveAttribute('tabindex', '-1')
    await expect(getComputedStyle(standIn).pointerEvents).toBe('none')
    await expect(canvas.queryByRole('button')).toBeNull()
    await expect(editor.contains(document.elementFromPoint(selected.left + 20, selected.top + 6))).toBe(true)
    // Opening lands on the popover; Tab walks its buttons and never lands on the stand-in.
    await waitFor(() => expect(dialog).toHaveFocus())
    for (const name of ['Discard', 'Try again', 'Replace']) {
      await userEvent.tab()
      await expect(document.activeElement).not.toBe(standIn)
      await expect(within(dialog).getByRole('button', { name })).toHaveFocus()
    }
    for (const name of ['Try again', 'Discard']) {
      await userEvent.tab({ shift: true })
      await expect(within(dialog).getByRole('button', { name })).toHaveFocus()
    }
    // Back out of the popover's start: with nothing wrapped there is no control to step back to, so the cursor stays
    // in the popover, on the dialog itself, and the popover stays open. Tab goes on to its first button again.
    await userEvent.tab({ shift: true })
    await waitFor(() => expect(dialog).toHaveFocus())
    await expect(page().getByRole('dialog', { name: TITLE })).toBe(dialog)
    await userEvent.tab()
    await expect(within(dialog).getByRole('button', { name: 'Discard' })).toHaveFocus()
    await expect(page().getByRole('dialog', { name: TITLE })).toBe(dialog)
    // From here on every way of closing sends the cursor straight to the editor, never by way of the stand-in.
    let passedThrough = 0
    standIn.addEventListener('focus', () => { passedThrough += 1 })
    // Escape closes it and says so; the cursor goes back to the editor.
    await userEvent.keyboard('{Escape}')
    await closed()
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false)
    await expect(args.onDiscard).not.toHaveBeenCalled()
    await waitFor(() => expect(editor).toHaveFocus())
    // A press outside closes it and says so.
    range = select()
    dialog = await page().findByRole('dialog', { name: TITLE })
    const calls = (args.onOpenChange as ReturnType<typeof fn>).mock.calls.length
    await userEvent.click(document.body)
    await closed()
    await expect((args.onOpenChange as ReturnType<typeof fn>).mock.calls.length).toBe(calls + 1)
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false)
    // Replace calls back and closes; the cursor ends in the editor, which now holds the new text.
    range = select()
    dialog = await page().findByRole('dialog', { name: TITLE })
    await waitFor(() => expect(dialog).toHaveFocus())
    await userEvent.click(within(dialog).getByRole('button', { name: 'Replace' }))
    await expect(args.onReplace).toHaveBeenCalledTimes(1)
    await closed()
    const after = canvas.getByRole('textbox', { name: 'Report' })
    await expect(after).toHaveTextContent(SUGGESTION)
    await waitFor(() => expect(after).toHaveFocus())
    await expect(spot()).toBe(standIn)
    await expect(passedThrough).toBe(0)
  },
}

// A component of its own, not written inline in the story: Storybook's source view reads the story's elements, and a
// ref among them sets off a React warning of Storybook's own making.
function ParagraphAnchor({ args }: { args: AnchorArgs }) {
  const [open, setOpen] = React.useState(false)
  const [range, setRange] = React.useState<Range | null>(null)
  const text = React.useRef<HTMLParagraphElement>(null)
  return (
    <div className="grid w-[26rem] max-w-full justify-items-start gap-3 text-sm leading-relaxed text-ink-soft">
      <p ref={text}>{BEFORE + PASSAGE}</p>
      <Button variant="outline" onClick={() => {
        const range = document.createRange()
        range.selectNodeContents(text.current as HTMLElement)
        setRange(range)
        setOpen(true)
      }}>Shorten the paragraph</Button>
      <AiPopover {...args} anchor={range} open={open} onOpenChange={(next) => { setOpen(next); args.onOpenChange?.(next) }} />
    </div>
  )
}

// With no returnFocus, the cursor goes back to whatever had it when the popover opened.
export const AnchorWithoutReturnFocus: Story = {
  tags: ['!autodocs'],
  parameters: { viewport: { options: VIEWPORTS } },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  render: (args) => <ParagraphAnchor args={withoutTrigger(args)} />,
  play: async ({ canvas }) => {
    const opener = canvas.getByRole('button', { name: 'Shorten the paragraph' })
    for (const close of ['Escape', 'Replace'] as const) {
      await userEvent.click(opener)
      const dialog = await page().findByRole('dialog', { name: TITLE })
      // Beside the paragraph, not beside the button that asked.
      await expectBeside(dialog, () => (canvas.getByText(BEFORE + PASSAGE) as HTMLElement).getBoundingClientRect())
      await waitFor(() => expect(dialog).toHaveFocus())
      if (close === 'Escape') await userEvent.keyboard('{Escape}')
      else await userEvent.click(within(dialog).getByRole('button', { name: 'Replace' }))
      await closed()
      await waitFor(() => expect(opener, `focus after ${close}`).toHaveFocus())
    }
  },
}

// Both: the button is still what opens it (and where the cursor returns), the selection is only where it sits.
export const AButtonOpensItBesideASelection: Story = {
  parameters: { viewport: { options: VIEWPORTS }, docs: { description: { story: 'Select some of the text, then press Shorten: the button opens the suggestion, and it sits beside the selection.' } } },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  render: (args) => <Editor args={withoutTrigger(args)} trigger={<Button variant="outline" className="justify-self-start">Shorten</Button>} />,
  play: async ({ canvas, args }) => {
    const editor = canvas.getByRole('textbox', { name: 'Report' })
    const button = canvas.getByRole('button', { name: 'Shorten' })
    editor.focus()
    const range = selectText(editor.firstChild as Text, BEFORE.length, BEFORE.length + PASSAGE.length)
    // Selecting alone opens nothing here. (The stand-in arriving is the sign the selection has been heard.)
    await waitFor(() => expect(spot()).not.toBeNull())
    await expect(page().queryByRole('dialog')).toBeNull()
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    // Being given an anchor did not swap the app's button for another one.
    await expect(canvas.getByRole('button', { name: 'Shorten' })).toBe(button)
    await userEvent.click(button)
    let dialog = await page().findByRole('dialog', { name: TITLE })
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true)
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    await expect(button.getAttribute('aria-controls')).toBe(dialog.id)
    await expect(dialog.id).not.toBe('')
    // Beside the selection, not beside the button that opened it, and not over that button.
    await expectBeside(dialog, () => range.getBoundingClientRect())
    await expect(dialog.getBoundingClientRect().top - button.getBoundingClientRect().bottom).toBeGreaterThan(6)
    // The one button on the page is the app's; the stand-in is not one.
    await expect(canvas.getAllByRole('button')).toEqual([button])
    // The keyboard, as with a wrapped anchor: Shift+Tab from the first button steps back to the button that opened
    // it, the popover stays open, and Tab goes back in to its first button.
    await waitFor(() => expect(dialog).toHaveFocus())
    await userEvent.tab()
    await expect(within(dialog).getByRole('button', { name: 'Discard' })).toHaveFocus()
    await userEvent.tab({ shift: true })
    await waitFor(() => expect(button).toHaveFocus())
    await expect(page().getByRole('dialog', { name: TITLE })).toBe(dialog)
    await userEvent.tab()
    await expect(within(dialog).getByRole('button', { name: 'Discard' })).toHaveFocus()
    await expect(page().getByRole('dialog', { name: TITLE })).toBe(dialog)
    // Escape closes it; the cursor goes back to the button.
    await userEvent.keyboard('{Escape}')
    await closed()
    await waitFor(() => expect(button).toHaveFocus())
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await expect(button).not.toHaveAttribute('aria-controls')
    // A second press on the button closes it, as it does without an anchor.
    await userEvent.click(button)
    dialog = await page().findByRole('dialog', { name: TITLE })
    await waitFor(() => expect(dialog).toHaveFocus())
    await userEvent.click(button)
    await closed()
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false)
    await waitFor(() => expect(button).toHaveFocus())
  },
}

// A few frames of the page being drawn, counted, not timed.
const frames = async (count: number) => { for (let frame = 0; frame < count; frame += 1) await new Promise((resolve) => requestAnimationFrame(resolve)) }
// In a centred Storybook canvas the page itself moves for a moment after an overlay opens. Anything that measures
// "has it moved?" first waits for the fonts (a late one re-flows the text, and the selection with it), then for the
// thing it is anchored to to have kept one box for twenty frames running.
const pageAtRest = async (anchorBox: () => DOMRect) => {
  await document.fonts.ready
  let last = anchorBox()
  for (let same = 0, frame = 0; same < 20 && frame < 300; frame += 1) {
    await frames(1)
    const now = anchorBox()
    same = (['left', 'top', 'right', 'bottom'] as const).every((edge) => Math.abs(now[edge] - last[edge]) < 0.01) ? same + 1 : 0
    last = now
  }
}
// Beside the selection, and still exactly there ten frames on: a stand-in that keeps missing would be moving.
const expectBesideAndStill = async (dialog: HTMLElement, range: Range) => {
  await expectBeside(dialog, () => range.getBoundingClientRect())
  await pageAtRest(() => range.getBoundingClientRect())
  await expectBeside(dialog, () => range.getBoundingClientRect())
  const first = dialog.getBoundingClientRect()
  const standIn = (spot() as HTMLElement).getBoundingClientRect()
  for (let frame = 0; frame < 10; frame += 1) {
    await frames(1)
    const now = dialog.getBoundingClientRect()
    await expect(Math.abs(now.left - first.left)).toBeLessThanOrEqual(1)
    await expect(Math.abs(now.top - first.top)).toBeLessThanOrEqual(1)
    const box = (spot() as HTMLElement).getBoundingClientRect()
    for (const edge of ['left', 'top', 'right', 'bottom'] as const) await expect(Math.abs(box[edge] - standIn[edge])).toBeLessThanOrEqual(1)
  }
  const selected = range.getBoundingClientRect()
  const box = (spot() as HTMLElement).getBoundingClientRect()
  for (const edge of ['left', 'top', 'right', 'bottom'] as const) await expect(Math.abs(box[edge] - selected[edge])).toBeLessThanOrEqual(1)
}
const SCALED = { parameters: { viewport: { options: VIEWPORTS } }, globals: { viewport: { value: 'desktop', isRotated: false } } } as const
const selectInScaledEditor = (canvas: Canvas, length = PASSAGE.length) => {
  const editor = canvas.getByRole('textbox', { name: 'Report' })
  editor.focus()
  return selectText(editor.firstChild as Text, BEFORE.length, BEFORE.length + length)
}

// The editor sits in something scaled (a zoomed canvas, a preview at half size). There a CSS pixel is not a screen
// pixel, so the stand-in has to be told its place and size in the ancestor's pixels.
export const InsideAnAncestorScaledUp: Story = {
  ...SCALED,
  tags: ['!autodocs'],
  render: (args) => <Editor args={withoutTrigger(args)} transform="scale(2)" />,
  play: async ({ canvas }) => {
    const range = selectInScaledEditor(canvas)
    const dialog = await page().findByRole('dialog', { name: TITLE })
    await expect(range.getBoundingClientRect().height).toBeGreaterThan(60)
    await expectBesideAndStill(dialog, range)
  },
}

export const InsideAnAncestorScaledDown: Story = {
  ...SCALED,
  tags: ['!autodocs'],
  render: (args) => <Editor args={withoutTrigger(args)} transform="scale(0.5)" />,
  play: async ({ canvas }) => {
    const range = selectInScaledEditor(canvas)
    const dialog = await page().findByRole('dialog', { name: TITLE })
    await expect(range.getBoundingClientRect().height).toBeLessThan(30)
    await expectBesideAndStill(dialog, range)
  },
}

// The stand-in's size matters as much as its place: with align="end" the popover lines up with its right edge.
export const AlignEndInsideAScaledAncestor: Story = {
  ...SCALED,
  tags: ['!autodocs'],
  args: { align: 'end' },
  render: (args) => <Editor args={withoutTrigger(args)} text={'Q3. ' + AFTER + ' ' + BEFORE + PASSAGE} transform="scale(1.5)" />,
  play: async ({ canvas }) => {
    const editor = canvas.getByRole('textbox', { name: 'Report' })
    editor.focus()
    // The last twenty characters of the first line, found by measuring (where a line ends depends on the font): its
    // right edge is the thing to line up with.
    const text = editor.firstChild as Text
    const probe = document.createRange()
    const lineOf = (index: number) => { probe.setStart(text, index); probe.setEnd(text, index + 1); return probe.getBoundingClientRect().top }
    let end = 1
    while (end < text.length - 1 && Math.abs(lineOf(end) - lineOf(0)) < 2) end += 1
    const range = selectText(text, end - 21, end - 1)
    const dialog = await page().findByRole('dialog', { name: TITLE })
    await expect(range.getClientRects()).toHaveLength(1)
    // Room for the popover to hang leftwards from that edge without being pushed back in from the window's edge.
    await expect(range.getBoundingClientRect().right - dialog.getBoundingClientRect().width).toBeGreaterThanOrEqual(8)
    await waitFor(() => {
      expect(dialog.getAnimations().filter((animation) => animation.playState === 'running')).toHaveLength(0)
      const box = dialog.getBoundingClientRect()
      const selected = range.getBoundingClientRect()
      expect(Math.abs(box.right - selected.right)).toBeLessThanOrEqual(1)
      expect(box.top - selected.bottom).toBeGreaterThanOrEqual(0)
      expect(box.top - selected.bottom).toBeLessThanOrEqual(6)
    })
    await pageAtRest(() => range.getBoundingClientRect())
    for (let frame = 0; frame < 10; frame += 1) {
      await frames(1)
      await expect(Math.abs(dialog.getBoundingClientRect().right - range.getBoundingClientRect().right)).toBeLessThanOrEqual(1)
    }
  },
}

// Not supported, and must fail safe: inside a rotated, skewed or mirrored ancestor the stand-in cannot be laid over
// the selection by moving and sizing an upright box. The popover then sits near the selection, not on it, and what
// matters is that it sits still: the same finite place on every frame.
const expectFiniteAndStill = async (dialog: HTMLElement, anchorBox: () => DOMRect) => {
  await pageAtRest(anchorBox)
  await frames(4)
  const first = dialog.getBoundingClientRect()
  const standIn = (spot() as HTMLElement).getBoundingClientRect()
  for (const box of [first, standIn]) for (const edge of ['left', 'top', 'right', 'bottom'] as const) await expect(Number.isFinite(box[edge])).toBe(true)
  for (const written of ['left', 'top', 'width', 'height'] as const) await expect(Number.isFinite(parseFloat((spot() as HTMLElement).style[written]))).toBe(true)
  // Nothing is being rewritten either: a stand-in that is corrected and corrected back each frame only looks still.
  const style = (spot() as HTMLElement).getAttribute('style')
  let writes = 0
  const watcher = new MutationObserver((records) => { writes += records.length })
  watcher.observe(spot() as HTMLElement, { attributes: true, attributeFilter: ['style'] })
  for (let frame = 0; frame < 10; frame += 1) {
    await frames(1)
    const now = dialog.getBoundingClientRect()
    const box = (spot() as HTMLElement).getBoundingClientRect()
    await expect((spot() as HTMLElement).getAttribute('style')).toBe(style)
    await expect(Math.abs(now.left - first.left)).toBeLessThanOrEqual(0.5)
    await expect(Math.abs(now.top - first.top)).toBeLessThanOrEqual(0.5)
    for (const edge of ['left', 'top', 'right', 'bottom'] as const) await expect(Math.abs(box[edge] - standIn[edge])).toBeLessThanOrEqual(0.5)
  }
  watcher.disconnect()
  await expect(writes).toBe(0)
  // On screen, not flung off it.
  await expect(first.left).toBeGreaterThanOrEqual(0)
  await expect(first.right).toBeLessThanOrEqual(window.innerWidth)
}

export const InsideARotatedAncestorHoldsStill: Story = {
  ...SCALED,
  tags: ['!autodocs'],
  render: (args) => <div className="pt-24 pl-40"><Editor args={withoutTrigger(args)} transform="rotate(30deg)" /></div>,
  play: async ({ canvas }) => {
    const range = selectInScaledEditor(canvas)
    const dialog = await page().findByRole('dialog', { name: TITLE })
    await expectFiniteAndStill(dialog, () => range.getBoundingClientRect())
  },
}

export const InsideAMirroredAncestorHoldsStill: Story = {
  ...SCALED,
  tags: ['!autodocs'],
  render: (args) => <div className="pl-[28rem]"><Editor args={withoutTrigger(args)} transform="scaleX(-1)" /></div>,
  play: async ({ canvas }) => {
    const range = selectInScaledEditor(canvas)
    const dialog = await page().findByRole('dialog', { name: TITLE })
    await expectFiniteAndStill(dialog, () => range.getBoundingClientRect())
  },
}

// An anchor with no size (a caret the app measured as a point) gives nothing to tell the scale by.
function PointAnchor({ args }: { args: AnchorArgs }) {
  const text = React.useRef<HTMLParagraphElement>(null)
  const [open, setOpen] = React.useState(false)
  const anchor = React.useMemo(() => ({
    getBoundingClientRect: () => {
      const box = (text.current as HTMLElement).getBoundingClientRect()
      return new DOMRect(box.left + 40, box.bottom, 0, 0)
    },
  }), [])
  return (
    <div className="grid w-[26rem] max-w-full justify-items-start gap-3 text-sm leading-relaxed text-ink-soft" style={{ transform: 'scale(2)', transformOrigin: 'top left' }}>
      <p ref={text}>{BEFORE + PASSAGE}</p>
      <Button variant="outline" onClick={() => setOpen(true)}>Shorten the paragraph</Button>
      <AiPopover {...args} anchor={anchor} open={open} onOpenChange={(next) => { setOpen(next); args.onOpenChange?.(next) }} />
    </div>
  )
}

export const APointAnchorInsideAScaledAncestorHoldsStill: Story = {
  ...SCALED,
  tags: ['!autodocs'],
  render: (args) => <PointAnchor args={withoutTrigger(args)} />,
  play: async ({ canvas }) => {
    const paragraph = canvas.getByText(BEFORE + PASSAGE)
    await userEvent.click(canvas.getByRole('button', { name: 'Shorten the paragraph' }))
    const dialog = await page().findByRole('dialog', { name: TITLE })
    await expectFiniteAndStill(dialog, () => paragraph.getBoundingClientRect())
  },
}

// Tab past the popover's last button closes it and moves on down the page, as Tab does past any popover.
export const TabPastTheLastButton: Story = {
  ...SCALED,
  tags: ['!autodocs'],
  render: (args) => <Editor args={withoutTrigger(args)} after={<Button variant="outline" className="justify-self-start">Next field</Button>} />,
  play: async ({ canvas, args }) => {
    const editor = canvas.getByRole('textbox', { name: 'Report' })
    selectInScaledEditor(canvas)
    const dialog = await page().findByRole('dialog', { name: TITLE })
    await waitFor(() => expect(dialog).toHaveFocus())
    for (const name of ['Discard', 'Try again', 'Replace']) {
      await userEvent.tab()
      await expect(within(dialog).getByRole('button', { name })).toHaveFocus()
    }
    await userEvent.tab()
    await closed()
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false)
    await waitFor(() => expect(document.activeElement).not.toBe(document.body))
    // Not back to the editor (returnFocus): Tab carries on, to the next stop after where the popover is rendered.
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Next field' })).toHaveFocus())
    await expect(editor).not.toHaveFocus()
  },
}

// With a button and an anchor, Tab from the button goes to the popover's first stop whatever that is: here a link
// in the suggestion, which comes before Discard.
export const TabFromTheButtonReachesALinkInTheSuggestion: Story = {
  ...SCALED,
  tags: ['!autodocs'],
  args: { suggestion: <>Signups fell 12% short in September; see <a href="#changelog" className="underline">the changelog</a>.</> },
  render: (args) => <Editor args={withoutTrigger(args)} trigger={<Button variant="outline" className="justify-self-start">Shorten</Button>} />,
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Shorten' })
    selectInScaledEditor(canvas)
    await waitFor(() => expect(spot()).not.toBeNull())
    await userEvent.click(button)
    const dialog = await page().findByRole('dialog', { name: TITLE })
    await waitFor(() => expect(dialog).toHaveFocus())
    const link = within(dialog).getByRole('link', { name: 'the changelog' })
    // From inside, the link is the first stop.
    await userEvent.tab()
    await expect(link).toHaveFocus()
    // Back to the button, and in again: the same first stop, not the first button after it.
    await userEvent.tab({ shift: true })
    await waitFor(() => expect(button).toHaveFocus())
    await userEvent.tab()
    await expect(link).toHaveFocus()
    await userEvent.tab()
    await expect(within(dialog).getByRole('button', { name: 'Discard' })).toHaveFocus()
  },
}

// An editor that redraws its text leaves the old selection pointing at nothing: it then reports an empty box at the
// window's corner. The popover holds where it was instead of jumping there.
export const HoldsWhenTheSelectionIsLost: Story = {
  ...SCALED,
  tags: ['!autodocs'],
  render: (args) => <Editor args={withoutTrigger(args)} />,
  play: async ({ canvas }) => {
    const editor = canvas.getByRole('textbox', { name: 'Report' })
    const range = selectInScaledEditor(canvas)
    const dialog = await page().findByRole('dialog', { name: TITLE })
    await expectBeside(dialog, () => range.getBoundingClientRect())
    await pageAtRest(() => range.getBoundingClientRect())
    await expectBeside(dialog, () => range.getBoundingClientRect())
    const before = dialog.getBoundingClientRect()
    const kept = (spot() as HTMLElement).getBoundingClientRect()
    // Well clear of the window's corner, where a lost selection would send it.
    await expect(before.top).toBeGreaterThan(40)
    // The editor swaps its text node for a new one with the same words.
    const old = editor.firstChild as Text
    old.replaceWith(document.createTextNode(old.data))
    await frames(6)
    await expect(page().getByRole('dialog', { name: TITLE })).toBe(dialog)
    const after = dialog.getBoundingClientRect()
    await expect(Math.abs(after.left - before.left)).toBeLessThanOrEqual(1)
    await expect(Math.abs(after.top - before.top)).toBeLessThanOrEqual(1)
    const standIn = (spot() as HTMLElement).getBoundingClientRect()
    await expect(Math.abs(standIn.left - kept.left)).toBeLessThanOrEqual(1)
    await expect(Math.abs(standIn.top - kept.top)).toBeLessThanOrEqual(1)
    await expect(Math.abs(standIn.width - kept.width)).toBeLessThanOrEqual(1)
  },
}

// An app's own getBoundingClientRect can fail (its text box was removed, say). The popover stays where it last was,
// nothing on the page breaks, and it follows again once the app can answer.
const FLAKY = { fail: false, top: 0, reused: new DOMRect() }
function FlakyAnchor({ args }: { args: AnchorArgs }) {
  const text = React.useRef<HTMLParagraphElement>(null)
  const [open, setOpen] = React.useState(false)
  // `which` changes when the story asks for "another anchor": a new object, as a new selection would be.
  const [which, setWhich] = React.useState(0)
  React.useEffect(() => {
    const next = () => setWhich((was) => was + 1)
    window.addEventListener('quill-story-new-anchor', next)
    return () => window.removeEventListener('quill-story-new-anchor', next)
  }, [])
  const anchor = React.useMemo(() => ({
    which,
    getBoundingClientRect: () => {
      if (FLAKY.fail) throw new Error('the app could not measure its selection')
      const box = (text.current as HTMLElement).getBoundingClientRect()
      // One rect object, written over each time, as an app sparing itself allocations would.
      FLAKY.reused.x = box.left
      FLAKY.reused.y = box.top + FLAKY.top
      FLAKY.reused.width = box.width
      FLAKY.reused.height = box.height
      return FLAKY.reused
    },
  }), [which])
  return (
    <div className="grid w-[26rem] max-w-full justify-items-start gap-3 text-sm leading-relaxed text-ink-soft">
      <p ref={text}>{BEFORE + PASSAGE}</p>
      <Button variant="outline" onClick={() => setOpen(true)}>Shorten the paragraph</Button>
      <AiPopover {...args} anchor={anchor} open={open} onOpenChange={(next) => { setOpen(next); args.onOpenChange?.(next) }} />
    </div>
  )
}

export const AnAnchorThatCannotBeMeasured: Story = {
  ...SCALED,
  tags: ['!autodocs'],
  render: (args) => <FlakyAnchor args={withoutTrigger(args)} />,
  play: async ({ canvas }) => {
    FLAKY.fail = false
    FLAKY.top = 0
    const paragraph = canvas.getByText(BEFORE + PASSAGE)
    await userEvent.click(canvas.getByRole('button', { name: 'Shorten the paragraph' }))
    const dialog = await page().findByRole('dialog', { name: TITLE })
    await expectBeside(dialog, () => paragraph.getBoundingClientRect())
    await pageAtRest(() => paragraph.getBoundingClientRect())
    await expectBeside(dialog, () => paragraph.getBoundingClientRect())
    const before = dialog.getBoundingClientRect()
    // In development the first failure is reported, once, so the app's bug is not silent.
    const reported = spyOn(console, 'error').mockImplementation(() => {})
    try {
      FLAKY.fail = true
      await frames(6)
      await expect(reported.mock.calls.filter(([message]) => String(message).startsWith('[quill] <AiPopover anchor>'))).toHaveLength(1)
      // The app goes on writing over the rect it handed out. What the popover kept was the numbers, not the object.
      FLAKY.reused.y += 200
      await frames(4)
      await expect(Math.abs(dialog.getBoundingClientRect().top - before.top)).toBeLessThanOrEqual(1)
      // A new anchor that cannot be measured either: the popover stays where it is.
      window.dispatchEvent(new Event('quill-story-new-anchor'))
      await frames(4)
      await expect(Math.abs(dialog.getBoundingClientRect().top - before.top)).toBeLessThanOrEqual(1)
      // Still there, still where it was; the page was not torn down by the error.
      await expect(page().getByRole('dialog', { name: TITLE })).toBe(dialog)
      await expect(paragraph).toBeVisible()
      await expect(Math.abs(dialog.getBoundingClientRect().top - before.top)).toBeLessThanOrEqual(1)
      // A redraw of the popover while the anchor cannot be measured does not break it either.
      await userEvent.click(within(dialog).getByRole('button', { name: 'Try again' }))
      await expect(page().getByRole('dialog', { name: TITLE })).toBe(dialog)
      await expect(reported.mock.calls.filter(([message]) => String(message).startsWith('[quill] <AiPopover anchor>'))).toHaveLength(1)
    } finally {
      FLAKY.fail = false
      reported.mockRestore()
    }
    // The app can answer again, and its selection has moved 24px down: the popover is still following.
    FLAKY.top = 24
    await waitFor(() => expect(Math.abs(dialog.getBoundingClientRect().top - (before.top + 24))).toBeLessThanOrEqual(1))
    FLAKY.top = 0
    await waitFor(() => expect(Math.abs(dialog.getBoundingClientRect().top - before.top)).toBeLessThanOrEqual(1))
  },
}

const LONG_TEXT = Array.from({ length: 14 }, (_, line) => (line === 6 ? PASSAGE : `Line ${line + 1} of the report, about something else entirely.`)).join(' ')

// The selection moves when its text box scrolls; the popover goes with it.
export const AnchorMoves: Story = {
  parameters: { viewport: { options: VIEWPORTS }, docs: { description: { story: 'The text scrolls inside its box. Select some of it, then scroll: the suggestion stays beside the selection.' } } },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  render: (args) => <Editor args={withoutTrigger(args)} text={LONG_TEXT} className="h-32 overflow-y-auto" />,
  play: async ({ canvas }) => {
    const editor = canvas.getByRole('textbox', { name: 'Report' })
    await expect(editor.scrollHeight).toBeGreaterThan(editor.clientHeight + 60)
    const start = LONG_TEXT.indexOf(PASSAGE)
    editor.focus()
    // Brought to the foot of the box, so there is room to scroll it up and keep it in view.
    editor.scrollTop = 0
    const range = selectText(editor.firstChild as Text, start, start + 30)
    editor.scrollTop += range.getBoundingClientRect().bottom - editor.getBoundingClientRect().bottom + 12
    const dialog = await page().findByRole('dialog', { name: TITLE })
    await expectBeside(dialog, () => range.getBoundingClientRect())
    const before = { selection: range.getBoundingClientRect().bottom, popover: dialog.getBoundingClientRect().top }
    editor.scrollTop += 40
    await waitFor(() => expect(Math.abs(range.getBoundingClientRect().bottom - (before.selection - 40))).toBeLessThanOrEqual(1))
    // The popover moved by the same 40px, and is still on the selection.
    await waitFor(() => expect(Math.abs(dialog.getBoundingClientRect().top - (before.popover - 40))).toBeLessThanOrEqual(1))
    await expectBeside(dialog, () => range.getBoundingClientRect())
    // And the stand-in is on the selection, where the popover takes its place from.
    await waitFor(() => {
      const standIn = (spot() as HTMLElement).getBoundingClientRect()
      expect(Math.abs(standIn.top - range.getBoundingClientRect().top)).toBeLessThanOrEqual(1)
      expect(Math.abs(standIn.left - range.getBoundingClientRect().left)).toBeLessThanOrEqual(1)
    })
    // The page changing around the text moves the selection too, with no scroll and no resize to say so (something
    // above it grew). The popover still follows.
    const frame = editor.parentElement as HTMLElement
    const settledAt = { selection: range.getBoundingClientRect().bottom, popover: dialog.getBoundingClientRect().top }
    frame.style.paddingTop = '32px'
    await waitFor(() => expect(Math.abs(range.getBoundingClientRect().bottom - settledAt.selection)).toBeGreaterThanOrEqual(8))
    await waitFor(() => expect(Math.abs(dialog.getBoundingClientRect().top - settledAt.popover - (range.getBoundingClientRect().bottom - settledAt.selection))).toBeLessThanOrEqual(1))
    await expectBeside(dialog, () => range.getBoundingClientRect())
    frame.style.paddingTop = ''
    await waitFor(() => expect(Math.abs(range.getBoundingClientRect().bottom - settledAt.selection)).toBeLessThanOrEqual(1))
    await expectBeside(dialog, () => range.getBoundingClientRect())
  },
}

// A <textarea> has no range to measure, so the app works the selection's box out itself: here with a copy of the
// text box laid over it (same font, padding and width), in which the selected text is an element that can be measured.
const selectionBox = (field: HTMLTextAreaElement) => {
  const copy = document.createElement('div')
  const style = getComputedStyle(field)
  for (const name of ['font', 'letterSpacing', 'lineHeight', 'padding', 'border', 'boxSizing', 'textIndent', 'tabSize'] as const) copy.style[name] = style[name]
  const at = field.getBoundingClientRect()
  Object.assign(copy.style, { position: 'fixed', left: `${at.left}px`, top: `${at.top}px`, width: `${at.width}px`, height: `${at.height}px`, overflow: 'hidden', whiteSpace: 'pre-wrap', overflowWrap: 'break-word', visibility: 'hidden', pointerEvents: 'none' })
  const selected = document.createElement('span')
  selected.textContent = field.value.slice(field.selectionStart, field.selectionEnd)
  copy.append(field.value.slice(0, field.selectionStart), selected, field.value.slice(field.selectionEnd))
  document.body.append(copy)
  copy.scrollTop = field.scrollTop
  const box = selected.getBoundingClientRect()
  copy.remove()
  return box
}

function TextBox({ args }: { args: AnchorArgs }) {
  const field = React.useRef<HTMLTextAreaElement>(null)
  const [text, setText] = React.useState(BEFORE + PASSAGE + AFTER)
  const [open, setOpen] = React.useState(false)
  // The popover asks for the box on every frame while it is open, to follow the text as it moves. Working it out
  // means building the copy, so that is done again only when something it depends on has changed.
  const last = React.useRef<{ key: string; box: DOMRect } | undefined>(undefined)
  const anchor = React.useMemo(() => ({
    getBoundingClientRect: () => {
      const box = field.current
      if (!box) return new DOMRect()
      const at = box.getBoundingClientRect()
      const key = [at.left, at.top, at.width, at.height, box.scrollTop, box.selectionStart, box.selectionEnd, box.value].join('|')
      if (last.current?.key !== key) last.current = { key, box: selectionBox(box) }
      return last.current.box
    },
  }), [])
  // The browser's own `select` event: it fires for a selection made by the mouse, the keyboard or a script alike.
  React.useEffect(() => {
    const box = field.current
    if (!box) return
    const selected = () => { if (box.selectionStart !== box.selectionEnd) setOpen(true) }
    box.addEventListener('select', selected)
    return () => box.removeEventListener('select', selected)
  }, [])
  return (
    <div className="grid w-[26rem] max-w-full gap-3">
      <textarea ref={field} aria-label="Report" rows={4} value={text} onChange={(event) => setText(event.target.value)}
        className="resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm leading-relaxed text-foreground outline-hidden focus-visible:ring-3 focus-visible:ring-ring/50" />
      <AiPopover {...args} anchor={anchor} open={open} returnFocus={field}
        onOpenChange={(next) => { setOpen(next); args.onOpenChange?.(next) }}
        onReplace={() => {
          const box = field.current
          if (box) setText(text.slice(0, box.selectionStart) + SUGGESTION + text.slice(box.selectionEnd))
          args.onReplace()
        }} />
    </div>
  )
}

export const InATextarea: Story = {
  parameters: { viewport: { options: VIEWPORTS }, docs: { description: { story: 'In a plain text box the app works out where the selected text is and passes that box as `anchor`.' } } },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  render: (args) => <TextBox args={withoutTrigger(args)} />,
  play: async ({ canvas, args }) => {
    const field = canvas.getByRole('textbox', { name: 'Report' }) as HTMLTextAreaElement
    await expect(page().queryByRole('dialog')).toBeNull()
    field.focus()
    field.setSelectionRange(BEFORE.length, BEFORE.length + PASSAGE.length)
    const dialog = await page().findByRole('dialog', { name: TITLE })
    // The popover is beside its stand-in, and the stand-in is on the box the app worked out. (That box is not asked
    // for while waiting: working it out changes the page for a moment, and each change to the page makes the wait
    // look again.)
    await expectBeside(dialog, () => (spot() as HTMLElement).getBoundingClientRect())
    const selected = selectionBox(field)
    const standIn = (spot() as HTMLElement).getBoundingClientRect()
    for (const edge of ['left', 'top', 'right', 'bottom'] as const) await expect(Math.abs(standIn[edge] - selected[edge])).toBeLessThanOrEqual(1)
    // And that box is on the selected text: inside the text box, more than one line of it.
    const around = field.getBoundingClientRect()
    await expect(selected.height).toBeGreaterThan(20)
    await expect(selected.top).toBeGreaterThanOrEqual(around.top)
    await expect(selected.bottom).toBeLessThanOrEqual(around.bottom)
    await waitFor(() => expect(dialog).toHaveFocus())
    await userEvent.click(within(dialog).getByRole('button', { name: 'Replace' }))
    await expect(args.onReplace).toHaveBeenCalledTimes(1)
    await closed()
    await expect(field).toHaveValue(BEFORE + SUGGESTION + AFTER)
    await waitFor(() => expect(field).toHaveFocus())
  },
}

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair usage={usage} id="replace-stays-plain"
      doExample={<div className="flex justify-end gap-1.5"><Button variant="ghost">Discard</Button><Button>Replace</Button></div>}
      dontExample={<div className="flex justify-end gap-1.5"><Button variant="ghost">Discard</Button><Button variant="outline"><span className="ai-text font-semibold">Replace</span></Button></div>} />
  ),
}
