import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent } from 'storybook/test'
import { PromptComposer } from '../../registry/lib/prompt-composer'
import { usage } from '@/usage/prompt-composer.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / PromptComposer',
  component: PromptComposer,
  tags: ['autodocs'],
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
  args: { onSubmit: fn(), onStop: fn() },
  argTypes: {
    size: { control: 'select', options: ['lg', 'sm'] },
    status: { control: 'select', options: ['idle', 'working', 'disabled', 'error'] },
  },
  decorators: [(Story) => <div className="mx-auto max-w-xl"><Story /></div>],
} satisfies Meta<typeof PromptComposer>

export default meta
type Story = StoryObj<typeof meta>

export const Large: Story = { args: { size: 'lg', placeholder: 'Ask anything' } }
export const Small: Story = { args: { size: 'sm', placeholder: 'Ask about this account' } }

export const SendsOnEnter: Story = {
  args: { size: 'sm' },
  play: async ({ canvas, args }) => {
    const box = canvas.getByRole('textbox', { name: 'Message' })
    await userEvent.type(box, '   ')
    await userEvent.keyboard('{Enter}')
    await expect(args.onSubmit).not.toHaveBeenCalled() // whitespace never sends
    await userEvent.clear(box)
    await userEvent.type(box, 'Summarize my week')
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}')
    await expect(args.onSubmit).not.toHaveBeenCalled() // Shift+Enter is a new line
    await userEvent.keyboard('{Enter}')
    await expect(args.onSubmit).toHaveBeenCalledWith('Summarize my week\n')
  },
}

export const IgnoresEnterWhileComposing: Story = {
  args: { size: 'sm' },
  play: async ({ canvas, args }) => {
    const box = canvas.getByRole('textbox', { name: 'Message' })
    await userEvent.type(box, 'ni')
    box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true }))
    await expect(args.onSubmit).not.toHaveBeenCalled()
  },
}

export const Working: Story = {
  args: { status: 'working', defaultValue: 'Draft the Q3 summary' },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('textbox', { name: 'Message' }))
    await userEvent.keyboard('{Enter}')
    await expect(args.onSubmit).not.toHaveBeenCalled() // never sends while working
    await userEvent.click(canvas.getByRole('button', { name: 'Stop' }))
    await expect(args.onStop).toHaveBeenCalledOnce()
  },
}

export const Disabled: Story = { args: { status: 'disabled', placeholder: 'Assistant is offline' } }

export const ErrorState: Story = {
  args: { status: 'error', error: "Couldn't reach the assistant. Try again in a moment.", defaultValue: 'Summarize this' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent("Couldn't reach the assistant")
  },
}

export const WithMic: Story = { args: { onMic: fn() } }

export const DoDont: Story = {
  render: (args) => (
    <div className="grid gap-6">
      <DoDontPair usage={usage} id="edge-not-ring"
        doExample={<PromptComposer {...args} size="sm" />}
        dontExample={<div className="rounded-3xl p-1.5" style={{ background: 'linear-gradient(115deg, var(--ai-from), var(--ai-via), var(--ai-to))' }}><PromptComposer {...args} size="sm" /></div>} />
      <DoDontPair usage={usage} id="send-stays-solid"
        doExample={<PromptComposer {...args} size="sm" defaultValue="Draft a reply" />}
        dontExample={<div className="flex items-center gap-2 rounded-2xl border p-2"><span className="flex-1 text-sm">Draft a reply</span><span className="size-8 rounded-full" style={{ background: 'linear-gradient(115deg, var(--ai-from), var(--ai-via), var(--ai-to))' }} /></div>} />
    </div>
  ),
}
