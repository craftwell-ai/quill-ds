import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { AiMessage, UserMessage } from '../../registry/lib/ai-message'
import { AiThinking } from '../../registry/lib/ai-thinking'
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
