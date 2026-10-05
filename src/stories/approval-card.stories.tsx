import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { ApprovalCard } from '../../registry/lib/approval-card'
import { Icon } from '@/components/ui/icon'
import { usage } from '@/usage/approval-card.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { Button } from '@/components/ui/button'
import { DoDontPair } from './DoDont'
import { tabTo } from './focus-ring'
import { compositeOver, contrastRatio, lineColour, surfaceBehind } from './contrast'

const BODY = 'Hi team, September came in 12% under target, though the quarter still closed 4% ahead. The dip lines up with the pricing page change on the 9th. Chart attached.'
const DETAILS = [
  { label: 'To', value: 'growth@example.com' },
  { label: 'Subject', value: 'September signups: 12% under target' },
]

const meta = {
  title: 'Components / ApprovalCard',
  component: ApprovalCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered', docs: { description: { component: renderUsageDocs(usage) } } },
  decorators: [(Story) => <div className="w-[30rem] max-w-full"><Story /></div>],
  args: {
    title: 'The agent wants to send this email',
    details: DETAILS,
    defaultBody: BODY,
    bodyLabel: 'Email body',
    actionLabel: 'Send email',
    actionIcon: <Icon name="mail" />,
    onApprove: fn(),
    denyLabel: "Don't send",
    onDeny: fn(),
    consequence: 'Goes to 6 people. Nothing is sent until you choose.',
  },
} satisfies Meta<typeof ApprovalCard>

export default meta
type Story = StoryObj<typeof meta>

export const SendEmail: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('group', { name: 'The agent wants to send this email' })).toBeVisible()
    // The main button names the action; there is no generic Approve.
    await expect(canvas.getByRole('button', { name: 'Send email' })).toBeVisible()
    await expect(canvas.queryByRole('button', { name: /approve/i })).toBeNull()
    await expect(canvas.getByText('growth@example.com')).toBeVisible()
    // The app passes "To" and "Subject"; the card ends each label with a colon.
    await expect(canvas.getByText('To:')).toBeVisible()
    await expect(canvas.getByText('Subject:')).toBeVisible()
    await expect(canvas.getByText(BODY)).toBeVisible()
    await expect(canvas.getByText('Goes to 6 people. Nothing is sent until you choose.')).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: "Don't send" }))
    await expect(args.onDeny).toHaveBeenCalled()
    await userEvent.click(canvas.getByRole('button', { name: 'Send email' }))
    await expect(args.onApprove).toHaveBeenCalledWith(BODY)
  },
}

export const ApprovesTheEditedText: Story = {
  play: async ({ canvas, args }) => {
    const edit = canvas.getByRole('button', { name: 'Edit' })
    await expect(edit).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(edit)
    await expect(edit).toHaveAttribute('aria-pressed', 'true')
    const field = canvas.getByRole('textbox', { name: 'Email body' })
    // Opening in place means the cursor is in the field.
    await waitFor(() => expect(field).toHaveFocus())
    await userEvent.clear(field)
    await userEvent.type(field, 'Short version.')
    // Approved while the field is still open: the edited text goes.
    await userEvent.click(canvas.getByRole('button', { name: 'Send email' }))
    await expect(args.onApprove).toHaveBeenLastCalledWith('Short version.')
    // Closed again: the card shows the edit, and that is still what goes.
    await userEvent.click(edit)
    await expect(canvas.queryByRole('textbox')).toBeNull()
    await expect(canvas.getByText('Short version.')).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Send email' }))
    await expect(args.onApprove).toHaveBeenLastCalledWith('Short version.')
    await expect(args.onApprove).toHaveBeenCalledTimes(2)
  },
}

export const BlankBodyCannotBeApproved: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Edit' }))
    const field = canvas.getByRole('textbox', { name: 'Email body' })
    await userEvent.clear(field)
    await userEvent.type(field, '   ')
    await expect(canvas.getByRole('button', { name: 'Send email' })).toBeDisabled()
    await expect(args.onApprove).not.toHaveBeenCalled()
  },
}

export const Destructive: Story = {
  args: {
    title: 'The agent wants to delete 3 draft reports',
    details: undefined,
    defaultBody: undefined,
    actionLabel: 'Delete 3 drafts',
    actionIcon: <Icon name="delete" />,
    denyLabel: 'Keep them',
    consequence: "This can't be undone.",
    destructive: true,
  },
  play: async ({ canvas, canvasElement, args }) => {
    const action = canvas.getByRole('button', { name: 'Delete 3 drafts' })
    // The stock destructive Button, not a hand-coloured one.
    await expect(action).toHaveAttribute('data-slot', 'button')
    await expect(action.className).toContain('bg-destructive/10')
    // Nothing to show and nothing to edit: no tile, no Edit.
    await expect(canvasElement.querySelector('[data-slot="proposal"]')).toBeNull()
    await expect(canvas.queryByRole('button', { name: 'Edit' })).toBeNull()
    await userEvent.click(action)
    await expect(args.onApprove).toHaveBeenCalledWith(undefined)
  },
}

export const NoDenyCallbackHidesTheButton: Story = {
  args: { onDeny: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button', { name: "Don't send" })).toBeNull()
    await expect(canvas.getAllByRole('button')).toHaveLength(2)
  },
}

export const NotEditable: Story = {
  args: { editable: false },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button', { name: 'Edit' })).toBeNull()
  },
}

// The app owns the text: the card shows what it is given and reports every edit.
export const ControlledBody: Story = {
  args: { defaultBody: undefined, onBodyChange: fn() },
  render: function Render(args) {
    const [body, setBody] = React.useState('First draft.')
    return <ApprovalCard {...args} body={body} onBodyChange={(next) => { setBody(next); args.onBodyChange?.(next) }} />
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Edit' }))
    await userEvent.type(canvas.getByRole('textbox', { name: 'Email body' }), ' More.')
    await expect(args.onBodyChange).toHaveBeenLastCalledWith('First draft. More.')
    await userEvent.click(canvas.getByRole('button', { name: 'Send email' }))
    await expect(args.onApprove).toHaveBeenLastCalledWith('First draft. More.')
  },
}

// The outcome arrives into a region that was already there, and the buttons go.
export const OutcomeIsAnnounced: Story = {
  render: function Render(args) {
    const [outcome, setOutcome] = React.useState<string>()
    return <ApprovalCard {...args} outcome={outcome} onApprove={(body) => { args.onApprove(body); setOutcome('Sent to 6 people.') }} />
  },
  play: async ({ canvas, canvasElement }) => {
    const region = canvas.getByRole('status')
    await expect(region.textContent).toBe('')
    // A real box that takes no space while empty.
    await expect(getComputedStyle(region).display).not.toBe('contents')
    await expect(getComputedStyle(region).display).not.toBe('none')
    const card = canvasElement.querySelector('[data-slot="approval-card"]') as HTMLElement
    const before = card.getBoundingClientRect().height
    region.style.display = 'none'
    await expect(card.getBoundingClientRect().height).toBe(before)
    region.style.display = ''
    await userEvent.click(canvas.getByRole('button', { name: 'Send email' }))
    await expect(canvas.getByRole('status')).toBe(region)
    await expect(region).toHaveTextContent('Sent to 6 people.')
    await expect(canvas.queryByRole('button')).toBeNull()
    await expect(canvas.queryByText('Goes to 6 people. Nothing is sent until you choose.')).toBeNull()
    // What was approved stays readable.
    await expect(canvas.getByText(BODY)).toBeVisible()
  },
}

export const RepeatedDetailLabels: Story = {
  args: { details: [{ label: 'Cc', value: 'ana@example.com' }, { label: 'Cc', value: 'lee@example.com' }] },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText('Cc:')).toHaveLength(2)
    await expect(canvas.getByText('lee@example.com')).toBeVisible()
  },
}

// The card adds the colon, so every app gets the same labels. Only a label that already ends in a colon or a
// question mark (in any script) is left as it is: no "Subject::", no "Send a copy?:". An abbreviation's full stop is
// not the end of a label, so "Qty." gets its colon like its neighbours. An empty label does not become a lone colon,
// and a label that is not text (a plain-JS app can pass a node) is drawn as given.
export const DetailLabelsEndWithOneColon: Story = {
  args: {
    details: [
      { label: 'To', value: 'growth@example.com' },
      { label: 'Subject:', value: 'September signups' },
      { label: 'Amount: ', value: '$240.00' },
      { label: 'Send a copy to you?', value: 'Yes' },
      { label: 'Total：', value: '¥2,400' },
      { label: 'Qty.', value: '3' },
      { label: 'Acct. No.', value: '0042' },
      { label: '送りますか？', value: 'はい' },
      { label: 'هل ترسل؟', value: 'نعم' },
      { label: '', value: 'A value with no label' },
      { label: <em>Via</em> as unknown as string, value: 'Email' },
    ],
  },
  play: async ({ canvasElement }) => {
    const labels = Array.from(canvasElement.querySelectorAll('dt')).map((term) => term.textContent)
    await expect(labels).toEqual(['To:', 'Subject:', 'Amount:', 'Send a copy to you?', 'Total：', 'Qty.:', 'Acct. No.:', '送りますか？', 'هل ترسل؟', '', 'Via'])
  },
}

// The proposal tile is read-only content, so it takes the soft divider line, not the control line that marks things
// to press or type in. What tells it apart from the card is its FILL (the page colour inside the card colour) plus
// that hairline, so this checks the fill is there and differs from the card, and that the line is the 1px divider.
// No contrast floor is asserted: the soft line is not meant to reach 3:1, and the tile holds no control.
// Measured 2026-10-05, fill vs card · hairline vs card:
//   Dawn 1.08:1 · 1.25:1    Dusk 1.10:1 · 1.33:1    Classic Light 1.07:1 · 1.29:1
//   Classic Dark 1.11:1 · 1.37:1    Intelligent 1.09:1 · 1.31:1
// (Until 0.19.0 the tile wore the control line and this test held it to 3:1; that floor now belongs to controls only.)
export const ProposalTakesTheDividerLine: Story = {
  play: async ({ canvasElement }) => {
    const tile = canvasElement.querySelector('[data-slot="proposal"]') as HTMLElement
    const surface = surfaceBehind(tile)
    const backdrop = `rgb(${surface.join(' ')})`
    const style = getComputedStyle(tile)
    await expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    const fill = compositeOver(style.backgroundColor, backdrop)
    await expect(fill).not.toEqual(surface)
    await expect(style.borderTopWidth).toBe('1px')
    await expect(style.borderTopStyle).toBe('solid')
    await expect(style.borderTopColor).toBe(lineColour(tile, 'border-border'))
    const hairline = compositeOver(style.borderTopColor, backdrop)
    console.log(`approval-card proposal tile: fill vs card ${contrastRatio(fill, surface).toFixed(2)}:1 · hairline vs card ${contrastRatio(hairline, surface).toFixed(2)}:1`)
  },
}

// Approving is an ordinary decision: stock buttons, no gradient anywhere on them.
export const ButtonsArePlain: Story = {
  play: async ({ canvas }) => {
    for (const button of canvas.getAllByRole('button')) {
      await expect(button).toHaveAttribute('data-slot', 'button')
      await expect(getComputedStyle(button).backgroundImage).toBe('none')
    }
  },
}

// Pressing the main button removes the button that had focus; the person must not be dropped on the page body.
export const FocusStaysInTheCardOnDecision: Story = {
  render: function Render(args) {
    const [outcome, setOutcome] = React.useState<string>()
    return <ApprovalCard {...args} outcome={outcome} onApprove={(body) => { args.onApprove(body); setOutcome('Sent to 6 people.') }} />
  },
  play: async ({ canvas, canvasElement }) => {
    await tabTo(canvas.getByRole('button', { name: 'Send email' }))
    await userEvent.keyboard('{Enter}')
    const card = canvasElement.querySelector('[data-slot="approval-card"]') as HTMLElement
    await expect(canvas.queryByRole('button')).toBeNull()
    await expect(card.contains(document.activeElement)).toBe(true)
    await expect(document.activeElement).toBe(canvas.getByRole('status'))
  },
}

export const FocusStaysInTheCardAfterDeny: Story = {
  render: function Render(args) {
    const [outcome, setOutcome] = React.useState<string>()
    return <ApprovalCard {...args} outcome={outcome} onDeny={() => setOutcome('Not sent.')} />
  },
  play: async ({ canvas }) => {
    await tabTo(canvas.getByRole('button', { name: "Don't send" }))
    await userEvent.keyboard('{Enter}')
    await expect(canvas.queryByRole('button')).toBeNull()
    await expect(document.activeElement).toBe(canvas.getByRole('status'))
  },
}

const OUTCOME_SIGNAL = 'quill-story-outcome'

// Nothing in the card was pressed: the outcome arrives on its own (the agent timed out, someone decided on another
// screen) while the person reads elsewhere. The card sits below the fold, so a focus move would also scroll the page.
export const OutcomeArrivingOnItsOwnLeavesFocusAlone: Story = {
  render: function Render(args) {
    const [outcome, setOutcome] = React.useState<string>()
    // The timer starts on a signal from the play function, so it cannot fire before the test has put focus on the page.
    React.useEffect(() => {
      let timer: number | undefined
      const start = () => { timer = window.setTimeout(() => setOutcome('Decided somewhere else.'), 50) }
      window.addEventListener(OUTCOME_SIGNAL, start)
      return () => { window.removeEventListener(OUTCOME_SIGNAL, start); window.clearTimeout(timer) }
    }, [])
    return (
      <div>
        <div className="h-[150vh]" />
        <ApprovalCard {...args} outcome={outcome} />
      </div>
    )
  },
  play: async ({ canvas }) => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    window.scrollTo(0, 0)
    await expect(document.activeElement).toBe(document.body)
    await expect(document.documentElement.scrollHeight).toBeGreaterThan(window.innerHeight)
    window.dispatchEvent(new Event(OUTCOME_SIGNAL))
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Decided somewhere else.'))
    // The text is on the page before React runs the card's effects; give a focus move the time to happen.
    await new Promise((resolve) => window.setTimeout(resolve, 100))
    await expect(document.activeElement).toBe(document.body)
    await expect(window.scrollY).toBe(0)
  },
}

export const FocusElsewhereIsNotStolen: Story = {
  render: function Render(args) {
    const [outcome, setOutcome] = React.useState<string>()
    return (
      <div className="grid gap-3">
        <ApprovalCard {...args} outcome={outcome} />
        <Button type="button" variant="outline" onClick={() => setOutcome('Decided somewhere else.')}>Decide from outside</Button>
      </div>
    )
  },
  play: async ({ canvas }) => {
    const outside = canvas.getByRole('button', { name: 'Decide from outside' })
    await tabTo(outside)
    await userEvent.keyboard('{Enter}')
    await expect(canvas.getByRole('status')).toHaveTextContent('Decided somewhere else.')
    await expect(outside).toHaveFocus()
  },
}

// An unbroken string (a URL, a hash) must wrap inside the tile, not push past the card.
export const LongUnbrokenTextStaysInside: Story = {
  args: {
    defaultBody: `https://example.com/${'a'.repeat(160)}`,
    details: [{ label: 'Link', value: 'b'.repeat(160) }],
  },
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('[data-slot="approval-card"]') as HTMLElement
    const tile = canvasElement.querySelector('[data-slot="proposal"]') as HTMLElement
    await expect(tile.scrollWidth).toBeLessThanOrEqual(tile.clientWidth)
    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth)
    await expect(tile.getBoundingClientRect().right).toBeLessThanOrEqual(card.getBoundingClientRect().right)
  },
}

// A body the app holds, with no way to hear about edits, would give a field nothing updates.
export const ControlledWithoutCallbackHidesEdit: Story = {
  args: { defaultBody: undefined, body: BODY, onBodyChange: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button', { name: 'Edit' })).toBeNull()
    await expect(canvas.getByText(BODY)).toBeVisible()
  },
}

// A blank body and nothing else to show would be an empty bordered box.
export const BlankBodyWithNoDetailsHasNoTile: Story = {
  args: { details: undefined, defaultBody: '' },
  play: async ({ canvasElement, canvas }) => {
    await expect(canvasElement.querySelector('[data-slot="proposal"]')).toBeNull()
    await expect(canvas.getByRole('button', { name: 'Send email' })).toBeDisabled()
    // Edit still opens a field to type into.
    await userEvent.click(canvas.getByRole('button', { name: 'Edit' }))
    await expect(canvas.getByRole('textbox', { name: 'Email body' })).toBeVisible()
  },
}

export const DoDont: Story = {
  render: (args) => (
    <DoDontPair usage={usage} id="button-names-the-action"
      doExample={<ApprovalCard {...args} defaultBody={undefined} />}
      dontExample={<ApprovalCard {...args} defaultBody={undefined} actionLabel="Approve" actionIcon={undefined} />} />
  ),
}
