import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { AiFeedbackForm, FEEDBACK_REASONS } from '../../registry/lib/ai-feedback'
import { AiMessage, type AiFeedback } from '../../registry/lib/ai-message'
import { usage } from '@/usage/ai-feedback.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair, unlessDoDont } from './DoDont'
import { compositeOver, contrastRatio, surfaceBehind } from './contrast'
import { expectFocusRing } from './focus-ring'

const meta = {
  title: 'Components / AiFeedback',
  component: AiFeedbackForm,
  tags: ['autodocs'],
  parameters: { layout: 'centered', docs: { description: { component: renderUsageDocs(usage) } } },
  decorators: [unlessDoDont((Story) => <div className="w-[30rem] max-w-full"><Story /></div>)],
  args: { onSubmit: fn(), onClose: fn() },
} satisfies Meta<typeof AiFeedbackForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    const form = canvas.getByRole('group', { name: 'What was wrong?' })
    const reasons = within(form).getByRole('group', { name: 'Reasons' })
    await expect(within(reasons).getAllByRole('button')).toHaveLength(6)
    for (const chip of within(reasons).getAllByRole('button')) await expect(chip).toHaveAttribute('aria-pressed', 'false')
    await expect(within(form).getByRole('textbox', { name: 'Tell us more (optional)' })).toBeVisible()
    await expect(within(form).getByText('Sends this answer with your note.')).toBeVisible()
    await expect(within(form).getByRole('button', { name: 'Send feedback' })).toBeDisabled()
    await expect(within(form).getByRole('button', { name: 'Close' })).toBeVisible()
  },
}

// Send waits for a reason or real text; either one is enough, and text is never required.
export const SendWaits: Story = {
  play: async ({ canvas, args }) => {
    const send = canvas.getByRole('button', { name: 'Send feedback' })
    const note = canvas.getByRole('textbox', { name: 'Tell us more (optional)' })
    await userEvent.type(note, '   ')
    await expect(send).toBeDisabled()
    await userEvent.type(note, 'The August number is wrong. ')
    await expect(send).toBeEnabled()
    await userEvent.clear(note)
    await expect(send).toBeDisabled()
    const tooLong = canvas.getByRole('button', { name: 'Too long' })
    await userEvent.click(tooLong)
    await expect(tooLong).toHaveAttribute('aria-pressed', 'true')
    await expect(send).toBeEnabled()
    // A second press un-picks it.
    await userEvent.click(tooLong)
    await expect(send).toBeDisabled()
    await userEvent.click(canvas.getByRole('button', { name: 'Wrong tone' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Wrong or made up' }))
    await userEvent.type(note, '  The August number is wrong.  ')
    await userEvent.click(send)
    // Reasons come back in the list's order, not the order they were pressed; the note is trimmed.
    await expect(args.onSubmit).toHaveBeenCalledTimes(1)
    await expect(args.onSubmit).toHaveBeenCalledWith({ reasons: ['Wrong or made up', 'Wrong tone'], note: 'The August number is wrong.' })
  },
}

export const FocusAfterSend: Story = {
  play: async ({ canvas, canvasElement }) => {
    // The live region is there, empty and taking no room, before anything is sent.
    const status = canvas.getByRole('status')
    await expect(status).toBeEmptyDOMElement()
    await userEvent.click(canvas.getByRole('button', { name: 'Other' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Send feedback' }))
    await expect(status).toHaveTextContent('Thanks, that helps.')
    // Same node: the text arrived into a region that was already on the page.
    await expect(canvas.getByRole('status')).toBe(status)
    await waitFor(() => expect(status).toHaveFocus())
    // The form itself is gone: no chips, no field, no card around one line.
    await expect(canvas.queryByRole('group')).toBeNull()
    await expect(canvas.queryByRole('textbox')).toBeNull()
    const root = canvasElement.querySelector('[data-slot="feedback-form"]') as HTMLElement
    await expect(getComputedStyle(root).borderTopWidth).toBe('0px')
    // The focus ring hugs the words: the box is only as wide as its text, and the text keeps the form's left edge.
    await expect(status.getBoundingClientRect().width).toBeLessThan(root.getBoundingClientRect().width / 2)
    const words = status.querySelector('p') as HTMLElement
    await expect(Math.abs(words.getBoundingClientRect().left - root.getBoundingClientRect().left)).toBeLessThanOrEqual(0.5)
  },
}

export const ControlledSent: Story = {
  args: { sent: false },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Other' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Send feedback' }))
    await expect(args.onSubmit).toHaveBeenCalledTimes(1)
    // The app said "not sent" and has not changed its mind: the form stays.
    await expect(canvas.getByRole('button', { name: 'Send feedback' })).toBeVisible()
  },
}

export const AlreadySent: Story = {
  args: { sent: true, sentMessage: 'Thanks. We read every note.' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('Thanks. We read every note.')
    // Arriving already sent is not a reason to grab the cursor.
    await expect(canvas.getByRole('status')).not.toHaveFocus()
  },
}

export const RepeatedReasons: Story = {
  args: { reasons: ['Too long', 'Too long', 'Other'], onClose: undefined, disclosure: '' },
  play: async ({ canvas, args }) => {
    const [first, second] = canvas.getAllByRole('button', { name: 'Too long' })
    await userEvent.click(second)
    await expect(first).toHaveAttribute('aria-pressed', 'false')
    await expect(second).toHaveAttribute('aria-pressed', 'true')
    // No callback, no dead Close button; an empty disclosure draws no line.
    await expect(canvas.queryByRole('button', { name: 'Close' })).toBeNull()
    await expect(canvas.queryByText('Sends this answer with your note.')).toBeNull()
    await userEvent.click(canvas.getByRole('button', { name: 'Send feedback' }))
    await expect(args.onSubmit).toHaveBeenCalledWith({ reasons: ['Too long'], note: '' })
  },
}

export const NoReasons: Story = {
  args: { reasons: [] },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('group', { name: 'Reasons' })).toBeNull()
    await userEvent.type(canvas.getByRole('textbox'), 'Missing the source.')
    await expect(canvas.getByRole('button', { name: 'Send feedback' })).toBeEnabled()
  },
}

export const ChipShowsFocusRing: Story = {
  play: async ({ canvas }) => {
    await expectFocusRing(canvas.getByRole('button', { name: 'Wrong or made up' }))
  },
}

// A chip is a control: its outline has to read at 3:1 on the card in every theme, picked or not.
export const ChipsReadAsShapes: Story = {
  play: async ({ canvas, canvasElement }) => {
    const card = canvasElement.querySelector('[data-slot="feedback-form"]') as HTMLElement
    const surface = compositeOver(getComputedStyle(card).backgroundColor, `rgb(${surfaceBehind(card).join(' ')})`)
    const idle = canvas.getByRole('button', { name: 'Too long' })
    const picked = canvas.getByRole('button', { name: 'Wrong tone' })
    await userEvent.click(picked)
    for (const [name, chip] of [['idle', idle], ['picked', picked]] as const) {
      const line = compositeOver(getComputedStyle(chip).borderTopColor, `rgb(${surface.join(' ')})`)
      console.log(`ai-feedback ${name} chip outline ${contrastRatio(line, surface).toFixed(2)}:1`)
      await expect(contrastRatio(line, surface)).toBeGreaterThanOrEqual(3)
    }
    // The picked chip's words still read on its ink fill.
    const fill = compositeOver(getComputedStyle(picked).backgroundColor, `rgb(${surface.join(' ')})`)
    const words = compositeOver(getComputedStyle(picked).color, `rgb(${fill.join(' ')})`)
    await expect(contrastRatio(words, fill)).toBeGreaterThanOrEqual(4.5)
  },
}

// The form in its real place: under the answer, opened by the thumbs-down.
function UnderAnAnswer({ onSubmit }: { onSubmit: (value: { reasons: string[]; note: string }) => void }) {
  const [feedback, setFeedback] = React.useState<AiFeedback>(null)
  const [open, setOpen] = React.useState(true)
  return (
    <AiMessage feedback={feedback} onFeedback={(value) => { setFeedback(value); setOpen(true) }}
      feedbackForm={open ? <AiFeedbackForm onSubmit={onSubmit} onClose={() => setOpen(false)} /> : undefined}>
      <p>September missed target by 12%, but the quarter closed 4% ahead.</p>
    </AiMessage>
  )
}

export const UnderTheAnswer: Story = {
  render: (args) => <UnderAnAnswer onSubmit={args.onSubmit} />,
  play: async ({ canvas, canvasElement }) => {
    // Nothing until the thumbs-down is pressed.
    await expect(canvas.queryByRole('group', { name: 'What was wrong?' })).toBeNull()
    const down = canvas.getByRole('button', { name: 'Bad answer' })
    await userEvent.click(down)
    const form = canvas.getByRole('group', { name: 'What was wrong?' })
    // Pressing the thumb does not throw the cursor into the form; the next Tab goes there.
    await expect(down).toHaveFocus()
    await userEvent.tab()
    await expect(form).toContainElement(document.activeElement as HTMLElement)
    // It lines up with the answer's text, not with the avatar.
    const body = canvasElement.querySelector('[data-slot="reply-body"]') as HTMLElement
    await expect(Math.abs(form.getBoundingClientRect().left - body.getBoundingClientRect().left)).toBeLessThanOrEqual(0.5)
    await expect(form.getBoundingClientRect().top).toBeGreaterThan(down.getBoundingClientRect().bottom)
    // Thumbs-up, or un-pressing, takes the form away.
    await userEvent.click(canvas.getByRole('button', { name: 'Good answer' }))
    await expect(canvas.queryByRole('group', { name: 'What was wrong?' })).toBeNull()
  },
}

export const CloseReturnsToThumb: Story = {
  render: (args) => <UnderAnAnswer onSubmit={args.onSubmit} />,
  play: async ({ canvas }) => {
    const down = canvas.getByRole('button', { name: 'Bad answer' })
    await userEvent.click(down)
    await userEvent.tab()
    await userEvent.click(canvas.getByRole('button', { name: 'Close' }))
    await expect(canvas.queryByRole('group', { name: 'What was wrong?' })).toBeNull()
    // Close is gone with the form; the cursor goes back to what opened it, still pressed.
    await waitFor(() => expect(down).toHaveFocus())
    await expect(down).toHaveAttribute('aria-pressed', 'true')
  },
}

// The app takes the form away on its own, from a timer or a server event, after the person clicked blank page. Focus is on the page, not in the form.
export const AppRemovesTheFormQuietly: Story = {
  render: (args) => {
    const Harness = () => {
      const [open, setOpen] = React.useState(true)
      React.useEffect(() => { (window as unknown as { removeFormQuietly?: () => void }).removeFormQuietly = () => setOpen(false) }, [])
      return (
        <AiMessage feedback="down" onFeedback={() => {}} feedbackForm={open ? <AiFeedbackForm onSubmit={args.onSubmit} onClose={() => setOpen(false)} /> : undefined}>
          <p>September missed target by 12%, but the quarter closed 4% ahead.</p>
        </AiMessage>
      )
    }
    return <Harness />
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Bad answer' }))
    await userEvent.tab()
    await expect(canvas.getByRole('group', { name: 'What was wrong?' })).toContainElement(document.activeElement as HTMLElement)
    // Blank page: the focused control blurs with nowhere to go.
    await userEvent.click(document.body)
    await expect(document.body).toHaveFocus()
    ;(window as unknown as { removeFormQuietly: () => void }).removeFormQuietly()
    await waitFor(() => expect(canvas.queryByRole('group', { name: 'What was wrong?' })).toBeNull())
    // Give the effect its turn, then check the cursor was not pulled to the thumb.
    await new Promise((resolve) => setTimeout(resolve, 50))
    await expect(canvas.getByRole('button', { name: 'Bad answer' })).not.toHaveFocus()
  },
}

// "Sent" arrives from the app after the person already clicked elsewhere: the cursor is theirs, not the thank-you line's.
export const LateSentDoesNotGrabFocus: Story = {
  render: (args) => {
    const Harness = () => {
      const [sent, setSent] = React.useState(false)
      React.useEffect(() => { (window as unknown as { flipSent?: () => void }).flipSent = () => setSent(true) }, [])
      return <AiFeedbackForm onSubmit={args.onSubmit} sent={sent} />
    }
    return <Harness />
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Other' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Send feedback' }))
    await userEvent.click(document.body)
    await expect(document.body).toHaveFocus()
    ;(window as unknown as { flipSent: () => void }).flipSent()
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Thanks, that helps.'))
    await new Promise((resolve) => setTimeout(resolve, 50))
    await expect(canvas.getByRole('status')).not.toHaveFocus()
  },
}

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: (args) => (
    <DoDontPair usage={usage} id="six-reasons-at-most"
      doExample={<div className="w-[26rem] max-w-full"><AiFeedbackForm onSubmit={args.onSubmit} /></div>}
      dontExample={<div className="w-[26rem] max-w-full"><AiFeedbackForm onSubmit={args.onSubmit}
        reasons={[...FEEDBACK_REASONS, 'Too short', 'Out of date', 'Repeats itself', 'Bad formatting', 'Wrong language', 'Too formal', 'Too casual', 'Slow', 'Ignored my file']} /></div>} />
  ),
}
