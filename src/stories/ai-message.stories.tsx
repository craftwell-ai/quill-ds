import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, spyOn, userEvent, waitFor } from 'storybook/test'
import { AiMessage, UserMessage } from '../../registry/lib/ai-message'
import { AiThinking } from '../../registry/lib/ai-thinking'
import { Citation } from '../../registry/lib/citations'
import { usage } from '@/usage/ai-message.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / AiMessage',
  component: AiMessage,
  tags: ['autodocs'],
  parameters: { layout: 'centered', docs: { description: { component: renderUsageDocs(usage) } } },
  decorators: [(Story) => <div className="grid w-[36rem] max-w-full gap-4"><Story /></div>],
  args: { children: <p>September missed target by 12%, but July and August each beat it, so the quarter still closed 4% ahead.</p> },
} satisfies Meta<typeof AiMessage>

export default meta
type Story = StoryObj<typeof meta>

export const Reply: Story = {
  args: { onRetry: fn(), onFeedback: fn() },
  render: (args) => (<><UserMessage>How did signups do against target this quarter?</UserMessage><AiMessage {...args} /></>),
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('article')).toHaveTextContent('4% ahead')
    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }))
    await expect(args.onRetry).toHaveBeenCalled()
    const bad = canvas.getByRole('button', { name: 'Bad answer' })
    await userEvent.click(bad)
    await expect(bad).toHaveAttribute('aria-pressed', 'true')
    await expect(args.onFeedback).toHaveBeenLastCalledWith('down')
    await userEvent.click(bad)
    await expect(bad).toHaveAttribute('aria-pressed', 'false')
    await expect(args.onFeedback).toHaveBeenLastCalledWith(null)
  },
}
export const AvatarAlignsWithName: Story = {
  play: async ({ canvas }) => {
    const article = canvas.getByRole('article')
    const avatar = article.querySelector('[data-slot="reply-avatar"]') as HTMLElement
    const nameRow = article.querySelector('[data-slot="reply-name"]') as HTMLElement
    const a = avatar.getBoundingClientRect()
    const n = nameRow.getBoundingClientRect()
    // The 28px avatar and the name row share one centre line.
    await expect(Math.abs((a.top + a.bottom) / 2 - (n.top + n.bottom) / 2)).toBeLessThanOrEqual(1)
  },
}
export const WithThinking: Story = {
  args: { thinking: <AiThinking status="done" seconds={8} steps={['Loaded signups-sept.csv', 'Compared with targets']} /> },
}
export const Streaming: Story = {
  args: { streaming: true, thinking: <AiThinking status="done" seconds={8} />, children: <p>September missed target by 12%, but July and August each beat</p> },
  play: async ({ canvas }) => {
    const article = canvas.getByRole('article')
    await expect(article).toHaveAttribute('aria-busy', 'true')
    await expect(canvas.queryByRole('button', { name: 'Copy' })).toBeNull()
    // The caret sits on the last line of text, not on a line of its own.
    const caret = article.querySelector('[data-slot="caret"]') as HTMLElement
    const para = caret.parentElement!.querySelector('p:last-of-type') as HTMLElement
    const c = caret.getBoundingClientRect(), p = para.getBoundingClientRect()
    await expect(c.top).toBeGreaterThanOrEqual(p.top - 2)
    await expect(c.bottom).toBeLessThanOrEqual(p.bottom + 2)
  },
}
export const StreamingNoAnswerYet: Story = {
  args: { streaming: true, thinking: <AiThinking status="working" />, children: undefined },
  play: async ({ canvas }) => {
    const article = canvas.getByRole('article')
    await expect(article).toHaveAttribute('aria-busy', 'true')
    // No caret beside an empty body while the AI is still thinking.
    await expect(article.querySelector('[data-slot="caret"]')).toBeNull()
  },
}
export const Stopped: Story = {
  args: { stopped: true, children: <p>September missed target by 12%, but July</p> },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('You stopped this answer.')).toBeVisible()
  },
}
// The status region is already on the page before the text arrives, so the text is announced rather than just appearing.
export const StoppedIsAnnounced: Story = {
  render: function Render(args) {
    const [stopped, setStopped] = React.useState(false)
    return (
      <>
        <AiMessage {...args} stopped={stopped} />
        <button type="button" onClick={() => setStopped(true)}>Stop</button>
      </>
    )
  },
  play: async ({ canvas }) => {
    const region = canvas.getByRole('status')
    await expect(region.textContent).toBe('')
    await userEvent.click(canvas.getByRole('button', { name: 'Stop' }))
    await expect(canvas.getByRole('status')).toBe(region)
    await expect(region).toHaveTextContent('You stopped this answer.')
  },
}
export const StoppedNoAnswer: Story = {
  args: { stopped: true, children: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('You stopped this answer.')).toBeVisible()
    // Nothing was written, so there is nothing to copy.
    await expect(canvas.queryByRole('button', { name: 'Copy' })).toBeNull()
    // And no actions at all, so no empty group for a screen reader to announce.
    await expect(canvas.queryByRole('group', { name: 'Reply actions' })).toBeNull()
  },
}
export const CopyWorks: Story = {
  play: async ({ canvas }) => {
    const writeText = fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    await userEvent.click(canvas.getByRole('button', { name: 'Copy' }))
    await expect(writeText).toHaveBeenCalledWith(expect.stringContaining('4% ahead'))
    await expect(canvas.getByRole('button', { name: 'Copied' })).toBeVisible()
  },
}
const COPIED_MS = 2000
// Records the id of every 2 s timer the component starts, so a test can see which ones it cancelled.
const watchCopiedTimers = () => {
  const setSpy = spyOn(window, 'setTimeout')
  const clearSpy = spyOn(window, 'clearTimeout')
  const copiedTimerIds = () => setSpy.mock.calls
    .map((call, index) => (call[1] === COPIED_MS ? setSpy.mock.results[index].value : undefined))
    .filter((id) => id !== undefined)
  const stop = () => { setSpy.mockRestore(); clearSpy.mockRestore() }
  return { clearSpy, copiedTimerIds, stop }
}
export const CopyTimerRestartsOnReClick: Story = {
  play: async ({ canvas }) => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: fn().mockResolvedValue(undefined) }, configurable: true })
    const { clearSpy, copiedTimerIds, stop } = watchCopiedTimers()
    try {
      await userEvent.click(canvas.getByRole('button', { name: 'Copy' }))
      await userEvent.click(await canvas.findByRole('button', { name: 'Copied' }))
      await waitFor(() => expect(copiedTimerIds()).toHaveLength(2))
      // The first timer must be cancelled, or it flips the label back early.
      await expect(clearSpy).toHaveBeenCalledWith(copiedTimerIds()[0])
    } finally {
      stop()
    }
  },
}
export const CopyTimerClearedOnUnmount: Story = {
  render: function Render(args) {
    const [shown, setShown] = React.useState(true)
    return (
      <>
        {shown ? <AiMessage {...args} /> : null}
        <button type="button" onClick={() => setShown(false)}>Remove</button>
      </>
    )
  },
  play: async ({ canvas }) => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: fn().mockResolvedValue(undefined) }, configurable: true })
    const { clearSpy, copiedTimerIds, stop } = watchCopiedTimers()
    try {
      await userEvent.click(canvas.getByRole('button', { name: 'Copy' }))
      await waitFor(() => expect(copiedTimerIds()).toHaveLength(1))
      await userEvent.click(canvas.getByRole('button', { name: 'Remove' }))
      await expect(clearSpy).toHaveBeenCalledWith(copiedTimerIds()[0])
    } finally {
      stop()
    }
  },
}
// Content decides whether there is an answer, not how many children were passed.
export const EmptyAnswersCountAsNoAnswer: Story = {
  args: { streaming: false },
  render: () => (
    <div className="grid gap-4">
      <AiMessage name="Empty string">{''}</AiMessage>
      <AiMessage name="Whitespace">{'  \n '}</AiMessage>
      <AiMessage name="Empty fragment"><></></AiMessage>
      <AiMessage name="Empty paragraph"><p>{''}</p></AiMessage>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.queryByRole('button', { name: 'Copy' })).toBeNull()
    await expect(canvasElement.querySelector('[data-slot="reply-body"]')).toBeNull()
  },
}
export const CaretWaitsForText: Story = {
  render: () => (
    <div className="grid gap-4">
      <AiMessage streaming name="Waiting"><p>{''}</p></AiMessage>
      <AiMessage streaming name="Writing"><p>September missed</p></AiMessage>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [waiting, writing] = Array.from(canvasElement.querySelectorAll('article'))
    await expect(waiting.querySelector('[data-slot="caret"]')).toBeNull()
    await expect(writing.querySelector('[data-slot="caret"]')).not.toBeNull()
  },
}
export const CopyLeavesChipsOut: Story = {
  args: {
    children: (
      <>
        <p>September missed target by 12%<Citation source={{ title: 'signups-sept.csv', label: 'signups-sept' }} /> but July and August beat it<Citation source={{ title: 'Q3 board deck.pdf', label: 'Q3 deck' }} />.</p>
        <p>So the quarter closed 4% ahead.</p>
      </>
    ),
  },
  play: async ({ canvas }) => {
    const writeText = fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    await userEvent.click(canvas.getByRole('button', { name: 'Copy' }))
    const copied = writeText.mock.calls[0][0] as string
    await expect(copied).not.toContain('signups-sept')
    await expect(copied).not.toContain('Q3 deck')
    await expect(copied.replace(/\s+/g, ' ').trim()).toBe('September missed target by 12% but July and August beat it. So the quarter closed 4% ahead.')
  },
}
export const ThumbShowsPressed: Story = {
  args: { onFeedback: fn() },
  play: async ({ canvas }) => {
    const good = canvas.getByRole('button', { name: 'Good answer' })
    const bad = canvas.getByRole('button', { name: 'Bad answer' })
    const before = getComputedStyle(good).backgroundColor
    await userEvent.click(good)
    await expect(good).toHaveAttribute('aria-pressed', 'true')
    await userEvent.unhover(good)
    // The button eases its colours, so wait for the transition to land.
    await waitFor(() => expect(getComputedStyle(good).backgroundColor).not.toBe(getComputedStyle(bad).backgroundColor))
    await expect(getComputedStyle(good).backgroundColor).not.toBe(before)
  },
}
export const CopyKeepsListItems: Story = {
  args: { children: <ul className="list-disc pl-5"><li>First item</li><li>Second item</li></ul> },
  play: async ({ canvas }) => {
    const writeText = fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    await userEvent.click(canvas.getByRole('button', { name: 'Copy' }))
    await expect(writeText.mock.calls[0][0]).toBe('First item\nSecond item')
  },
}
export const CopyKeepsBareText: Story = {
  args: { children: <>Hello <strong>world</strong></> },
  play: async ({ canvas }) => {
    const writeText = fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    await userEvent.click(canvas.getByRole('button', { name: 'Copy' }))
    await expect(writeText.mock.calls[0][0]).toBe('Hello world')
  },
}
export const CopyRefused: Story = {
  play: async ({ canvas }) => {
    const writeText = fn().mockRejectedValue(new Error('NotAllowedError'))
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    await userEvent.click(canvas.getByRole('button', { name: 'Copy' }))
    await waitFor(() => expect(writeText).toHaveBeenCalled())
    await expect(canvas.getByRole('button', { name: 'Copy' })).toBeVisible()
  },
}
export const DoDont: Story = {
  render: () => (
    <DoDontPair usage={usage} id="answer-stays-plain"
      doExample={<AiMessage><p>The quarter closed 4% ahead.</p></AiMessage>}
      dontExample={<AiMessage><p className="ai-text font-semibold">The quarter closed 4% ahead.</p></AiMessage>} />
  ),
}
