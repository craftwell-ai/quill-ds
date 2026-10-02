import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
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

export const IgnoresEnterKeyCode229: Story = {
  args: { size: 'sm' },
  play: async ({ canvas, args }) => {
    const box = canvas.getByRole('textbox', { name: 'Message' })
    await userEvent.type(box, 'ni')
    // WebKit confirms an IME word with Enter, isComposing false and keyCode 229.
    const evt = new KeyboardEvent('keydown', { key: 'Enter', keyCode: 229, bubbles: true })
    if (evt.keyCode !== 229) Object.defineProperty(evt, 'keyCode', { get: () => 229 })
    box.dispatchEvent(evt)
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

export const WithAttachments: Story = {
  args: {
    defaultValue: 'Compare signups against the targets in the deck.',
    attachments: [
      { id: 'a1', name: 'Q3 board deck.pdf', meta: '2.4 MB', kind: 'PDF' },
      { id: 'a2', name: 'signups-sept.csv', meta: '812 rows', kind: 'CSV' },
    ],
    tools: [{ id: 't1', label: 'Analyze data' }],
    onRemoveAttachment: fn(),
    onRemoveTool: fn(),
    onFilesDropped: fn(),
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Q3 board deck.pdf' }))
    await expect(args.onRemoveAttachment).toHaveBeenCalledWith('a1')
    await userEvent.click(canvas.getByRole('button', { name: 'Turn off Analyze data' }))
    await expect(args.onRemoveTool).toHaveBeenCalledWith('t1')
  },
}

export const WithModes: Story = {
  args: {
    modes: [
      { value: 'ask', label: 'Ask', ai: true, placeholder: 'Ask anything. Type / for skills, @ to add context' },
      { value: 'agent', label: 'Agent', placeholder: 'What should your agent take on?' },
    ],
    onModeChange: fn(),
  },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('tab', { name: 'Ask', selected: true })).toBeVisible()
    await userEvent.click(canvas.getByRole('tab', { name: 'Agent' }))
    await expect(args.onModeChange).toHaveBeenCalledWith('agent')
    await expect(canvas.getByRole('textbox', { name: 'Message' })).toHaveAttribute('placeholder', 'What should your agent take on?')
  },
}

export const SlashCommands: Story = {
  args: {
    size: 'sm',
    commands: [
      { value: 'summarize', label: '/summarize', description: 'Condense a doc or thread', trigger: '/', ai: true },
      { value: 'remind', label: '/remind', description: 'Set a reminder', trigger: '/' },
      { value: 'q3-deck', label: 'Q3 board deck', description: 'Document', trigger: '@' },
    ],
    onCommand: fn(),
  },
  play: async ({ canvas, args }) => {
    const box = canvas.getByRole('textbox', { name: 'Message' })
    await userEvent.type(box, '/su')
    const option = await canvas.findByRole('option', { name: /summarize/ })
    await userEvent.keyboard('{Enter}')
    await expect(args.onCommand).toHaveBeenCalledWith(expect.objectContaining({ value: 'summarize' }))
    await expect(box).toHaveValue('/summarize ')
    await expect(args.onSubmit).not.toHaveBeenCalled() // Enter picked the command, it did not send
    void option
  },
}

export const MenuAnnouncesActiveOption: Story = {
  args: {
    size: 'sm',
    commands: [
      { value: 'summarize', label: '/summarize', trigger: '/' },
      { value: 'remind', label: '/remind', trigger: '/' },
    ],
  },
  play: async ({ canvas }) => {
    const box = canvas.getByRole('textbox', { name: 'Message' })
    await userEvent.type(box, '/')
    const options = await canvas.findAllByRole('option')
    await waitFor(() => expect(box).toHaveAttribute('aria-activedescendant', options[0].id))
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(box).toHaveAttribute('aria-activedescendant', options[1].id))
    await expect(options[1]).toHaveAttribute('aria-selected', 'true')
    await expect(box).not.toHaveAttribute('aria-expanded')
  },
}

export const ClickingAnOptionKeepsFocus: Story = {
  args: {
    size: 'sm',
    commands: [{ value: 'summarize', label: '/summarize', trigger: '/' }],
    onCommand: fn(),
  },
  play: async ({ canvas, args }) => {
    const box = canvas.getByRole('textbox', { name: 'Message' })
    await userEvent.type(box, '/')
    await userEvent.click(await canvas.findByRole('option', { name: /summarize/ }))
    await expect(args.onCommand).toHaveBeenCalled()
    await expect(box).toHaveValue('/summarize ')
    await expect(box).toHaveFocus()
  },
}

const ALL_COMMANDS = [
  { value: 'summarize', label: '/summarize', trigger: '/' as const },
  { value: 'remind', label: '/remind', trigger: '/' as const },
  { value: 'search', label: '/search', trigger: '/' as const },
]

export const MenuShrinksUnderTheCursor: Story = {
  args: { size: 'sm', onCommand: fn() },
  render: (args) => {
    const [commands, setCommands] = React.useState(ALL_COMMANDS)
    return (
      <>
        <PromptComposer {...args} commands={commands} />
        <button type="button" onClick={() => setCommands(ALL_COMMANDS.slice(0, 2))}>Fewer commands</button>
      </>
    )
  },
  play: async ({ canvas, args }) => {
    const box = canvas.getByRole('textbox', { name: 'Message' })
    await userEvent.type(box, '/')
    await canvas.findAllByRole('option')
    await userEvent.keyboard('{ArrowDown}{ArrowDown}') // last of three
    await userEvent.click(canvas.getByRole('button', { name: 'Fewer commands' }))
    box.focus()
    await userEvent.keyboard('{Enter}') // must not throw: the active index was past the end
    // The list changed, so the highlight went back to the first remaining option.
    await expect(args.onCommand).toHaveBeenCalledWith(expect.objectContaining({ value: 'summarize' }))
  },
}

export const EscapeClosesMenuKeepsText: Story = {
  args: { size: 'sm', commands: ALL_COMMANDS },
  play: async ({ canvas }) => {
    const box = canvas.getByRole('textbox', { name: 'Message' })
    await userEvent.type(box, '/su')
    await canvas.findByRole('option', { name: /summarize/ })
    await userEvent.keyboard('{Escape}')
    await expect(box).toHaveValue('/su') // the person's text is never changed to close the menu
    await waitFor(() => expect(canvas.queryByRole('option')).toBeNull())
    await userEvent.type(box, 'm')
    await expect(await canvas.findByRole('option', { name: /summarize/ })).toBeVisible() // typing reopens it
  },
}

export const SendKeepsFocus: Story = {
  args: { size: 'sm' },
  play: async ({ canvas, args }) => {
    const box = canvas.getByRole('textbox', { name: 'Message' })
    await userEvent.type(box, 'Summarize my week')
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }))
    await expect(args.onSubmit).toHaveBeenCalledWith('Summarize my week')
    // Send is now disabled (the box is empty); focus must come back to the box, not drop to the page.
    await expect(box).toHaveFocus()
  },
}

const drag = (target: Element, type: 'dragover' | 'dragleave', relatedTarget?: EventTarget | null) =>
  target.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, relatedTarget: relatedTarget ?? null }))

export const DropHintSurvivesMovingOntoChildren: Story = {
  args: { onFilesDropped: fn() },
  play: async ({ canvas }) => {
    const box = canvas.getByRole('textbox', { name: 'Message' })
    const target = box.closest('[data-slot="prompt-composer"]') as HTMLElement
    drag(target, 'dragover')
    await expect(await canvas.findByText('Drop files to attach')).toBeVisible()
    // The pointer moved from the box onto the textarea inside it: still dragging over the box.
    drag(target, 'dragleave', box)
    await new Promise((resolve) => setTimeout(resolve, 50)) // let React re-render before looking
    await expect(canvas.getByText('Drop files to attach')).toBeVisible()
    // Leaving the box for the page ends it.
    drag(target, 'dragleave', document.body)
    await waitFor(() => expect(canvas.queryByText('Drop files to attach')).toBeNull())
  },
}

export const DisabledIgnoresDrops: Story = {
  args: { status: 'disabled', onFilesDropped: fn() },
  play: async ({ canvas, args }) => {
    const target = canvas.getByRole('textbox', { name: 'Message' }).closest('[data-slot="prompt-composer"]') as HTMLElement
    const accepted = !drag(target, 'dragover') // preventDefault on dragover is what makes an element a drop target
    await expect(accepted).toBe(false)
    await expect(canvas.queryByText('Drop files to attach')).toBeNull()
    await expect(args.onFilesDropped).not.toHaveBeenCalled()
  },
}

export const AutoFocus: Story = {
  args: { size: 'sm', autoFocus: true },
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByRole('textbox', { name: 'Message' })).toHaveFocus())
  },
}

export const Notebook: Story = {
  args: { variant: 'notebook', placeholder: 'Start writing what you need…' },
  play: async ({ canvas }) => {
    const box = canvas.getByRole('textbox', { name: 'Message' })
    const page = canvas.getByRole('textbox', { name: 'Message' }).closest('[data-slot="prompt-composer"]') as HTMLElement
    // Focus must be visible without the AI edge: the page's border or shadow changes.
    const before = getComputedStyle(page)
    const [borderBefore, shadowBefore] = [before.borderTopColor, before.boxShadow]
    await userEvent.type(box, 'Write a launch brief for the October release')
    await expect(canvas.getByText('8 words')).toBeVisible()
    // Visible, not announced: a live region would read the count after every word.
    await expect(canvas.getByText('8 words').closest('[aria-live]')).toBeNull()
    const after = getComputedStyle(page)
    await expect(after.borderTopColor !== borderBefore || after.boxShadow !== shadowBefore).toBe(true)
    // The ruling is drawn on the textarea: its offset must equal the top padding, and lines are 32px, or text and rules drift apart.
    const style = getComputedStyle(box)
    await expect(style.lineHeight).toBe('32px')
    await expect(style.backgroundPositionY).toBe(style.paddingTop)
    await expect(style.backgroundAttachment).toContain('local')
  },
}

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
