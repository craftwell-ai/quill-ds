import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { OTHER_ANSWER, QuestionCard, type QuestionOption } from '../../registry/lib/question-card'
import { Button } from '@/components/ui/button'
import { usage } from '@/usage/question-card.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'
import { compositeOver, contrastRatio, surfaceBehind } from './contrast'
import { tabTo } from './focus-ring'

const QUESTION = 'Who should get the September report?'
// The field is named by the question and the free-text option it belongs to.
const FIELD_NAME = `${QUESTION}: Someone else`
// The recommended option is second here on purpose: the card must move it to the top.
const OPTIONS: QuestionOption[] = [
  { value: 'leadership', label: 'Leadership', description: '3 people. Shorter version, numbers only.' },
  { value: 'growth', label: 'The growth team', description: '6 people. They own signups and asked for it last month.' },
]

const meta = {
  title: 'Components / QuestionCard',
  component: QuestionCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered', docs: { description: { component: renderUsageDocs(usage) } } },
  decorators: [(Story) => <div className="w-[30rem] max-w-full"><Story /></div>],
  args: {
    question: QUESTION,
    options: OPTIONS,
    recommended: 'growth',
    otherLabel: 'Someone else',
    otherDescription: 'Tell the agent who.',
    otherPlaceholder: 'e.g. Priya and the pricing team',
    onAnswerChange: fn(),
    onContinue: fn(),
    onSkip: fn(),
  },
} satisfies Meta<typeof QuestionCard>

export default meta
type Story = StoryObj<typeof meta>

const centreY = (rect: DOMRect) => rect.top + rect.height / 2

export const Default: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('group', { name: QUESTION })).toBeVisible()
    const radios = within(canvas.getByRole('radiogroup', { name: QUESTION })).getAllByRole('radio')
    await expect(radios).toHaveLength(3)
    // The recommendation comes first, says so in its name, and the free-text row is last.
    await expect(radios[0]).toHaveAccessibleName('The growth team Recommended')
    await expect(radios[0]).toHaveAccessibleDescription('6 people. They own signups and asked for it last month.')
    await expect(radios[1]).toHaveAccessibleName('Leadership')
    await expect(radios[2]).toHaveAccessibleName('Someone else')
    const go = canvas.getByRole('button', { name: 'Continue' })
    await expect(go).toBeDisabled()
    // The whole row is the target, not only the 16px radio.
    await userEvent.click(canvas.getByText('3 people. Shorter version, numbers only.'))
    await expect(radios[1]).toHaveAttribute('aria-checked', 'true')
    await expect(go).toBeEnabled()
    await userEvent.click(go)
    await expect(args.onContinue).toHaveBeenCalledWith({ value: 'leadership' })
  },
}

export const FreeTextRow: Story = {
  play: async ({ canvas, args }) => {
    const go = canvas.getByRole('button', { name: 'Continue' })
    await expect(canvas.queryByRole('textbox')).toBeNull()
    await userEvent.click(canvas.getByText('Someone else'))
    const field = canvas.getByRole('textbox', { name: FIELD_NAME })
    await expect(field).toHaveAttribute('placeholder', 'e.g. Priya and the pricing team')
    await expect(field).toHaveAccessibleDescription('Tell the agent who.')
    await expect(go).toBeDisabled()
    // Spaces are not an answer.
    await userEvent.type(field, '   ')
    await expect(go).toBeDisabled()
    await userEvent.type(field, 'Priya')
    await expect(go).toBeEnabled()
    // Choosing another row and coming back keeps what was typed.
    await userEvent.click(canvas.getByText('Leadership'))
    await expect(canvas.queryByRole('textbox')).toBeNull()
    await userEvent.click(canvas.getByText('Someone else'))
    await expect(canvas.getByRole('textbox', { name: FIELD_NAME })).toHaveValue('   Priya')
    await userEvent.click(go)
    await expect(args.onContinue).toHaveBeenCalledWith({ value: OTHER_ANSWER, text: 'Priya' })
  },
}

export const EnterInTheFieldContinues: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByText('Someone else'))
    const field = canvas.getByRole('textbox', { name: FIELD_NAME })
    await userEvent.click(field)
    await userEvent.keyboard('{Enter}')
    await expect(args.onContinue).not.toHaveBeenCalled()
    await userEvent.keyboard('Priya{Enter}')
    await expect(args.onContinue).toHaveBeenCalledWith({ value: OTHER_ANSWER, text: 'Priya' })
  },
}

export const ArrowKeysChoose: Story = {
  play: async ({ canvas }) => {
    const radios = canvas.getAllByRole('radio')
    await tabTo(radios[0])
    await userEvent.keyboard('{ArrowDown}')
    await expect(radios[1]).toHaveFocus()
    await expect(radios[1]).toHaveAttribute('aria-checked', 'true')
    await userEvent.keyboard('{ArrowDown}')
    await expect(radios[2]).toHaveFocus()
    await expect(radios[2]).toHaveAttribute('aria-checked', 'true')
    // The field appeared but did not steal the cursor, so the arrows still work.
    await expect(canvas.getByRole('textbox', { name: FIELD_NAME })).not.toHaveFocus()
    await userEvent.keyboard('{ArrowUp}')
    await expect(radios[1]).toHaveFocus()
    await expect(radios[1]).toHaveAttribute('aria-checked', 'true')
    // The group is one Tab stop: Tab leaves it for the next control.
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Continue' })).toHaveFocus()
  },
}

// In the field the arrow keys belong to the caret: at either end of the text they must not jump to another option.
export const ArrowKeysStayInTheField: Story = {
  play: async ({ canvas }) => {
    const other = canvas.getAllByRole('radio')[2]
    await userEvent.click(canvas.getByText('Someone else'))
    const field = canvas.getByRole('textbox', { name: FIELD_NAME })
    await tabTo(field)
    // Empty field: the caret is at both ends at once.
    await userEvent.keyboard('{ArrowDown}{ArrowUp}')
    await expect(canvas.getByRole('textbox', { name: FIELD_NAME })).toBe(field)
    await expect(field).toHaveFocus()
    await expect(other).toHaveAttribute('aria-checked', 'true')
    await userEvent.keyboard('Priya{ArrowRight}{ArrowDown}')
    await expect(field).toHaveFocus()
    await expect(other).toHaveAttribute('aria-checked', 'true')
    await userEvent.keyboard('{Home}{ArrowLeft}{ArrowUp}')
    await expect(canvas.getByRole('textbox', { name: FIELD_NAME })).toBe(field)
    await expect(field).toHaveFocus()
    await expect(other).toHaveAttribute('aria-checked', 'true')
    await expect(field).toHaveValue('Priya')
  },
}

// From the chosen free-text radio, Tab goes into its field and Shift+Tab comes back.
export const TabMovesBetweenRadioAndField: Story = {
  play: async ({ canvas }) => {
    const radios = canvas.getAllByRole('radio')
    const other = radios[2]
    // Chosen by keyboard, as the person this test is about would: arrows from the first radio.
    await tabTo(radios[0])
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    await expect(other).toHaveFocus()
    await expect(other).toHaveAttribute('aria-checked', 'true')
    await userEvent.tab()
    await expect(canvas.getByRole('textbox', { name: FIELD_NAME })).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect(other).toHaveFocus()
  },
}

// Safari confirms an input-method word with Enter, isComposing false and keyCode 229: that is not "continue".
export const IgnoresEnterKeyCode229: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByText('Someone else'))
    const field = canvas.getByRole('textbox', { name: FIELD_NAME })
    await userEvent.type(field, 'ni')
    const evt = new KeyboardEvent('keydown', { key: 'Enter', keyCode: 229, bubbles: true })
    if (evt.keyCode !== 229) Object.defineProperty(evt, 'keyCode', { get: () => 229 })
    field.dispatchEvent(evt)
    await expect(args.onContinue).not.toHaveBeenCalled()
  },
}

// One press is one change, whether it lands on the radio or on the row around it.
export const OnePressOneChange: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getAllByRole('radio')[1])
    await expect(args.onAnswerChange).toHaveBeenCalledTimes(1)
    await expect(args.onAnswerChange).toHaveBeenLastCalledWith({ value: 'leadership' })
    await userEvent.click(canvas.getByText('6 people. They own signups and asked for it last month.'))
    await expect(args.onAnswerChange).toHaveBeenCalledTimes(2)
    await expect(args.onAnswerChange).toHaveBeenLastCalledWith({ value: 'growth' })
    // Pressing the row that is already chosen changes nothing.
    await userEvent.click(canvas.getByText('The growth team'))
    await expect(args.onAnswerChange).toHaveBeenCalledTimes(2)
  },
}

export const Skip: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Skip, let the agent decide' }))
    await expect(args.onSkip).toHaveBeenCalled()
    await expect(args.onContinue).not.toHaveBeenCalled()
  },
}

export const NoSkipCallbackHidesTheButton: Story = {
  args: { onSkip: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('button')).toHaveLength(1)
  },
}

// A recommendation no option has, a repeated value, a row that borrows the free-text value, and a chosen value no row has.
export const OddInputs: Story = {
  args: {
    options: [...OPTIONS, { value: 'growth', label: 'Growth again' }, { value: OTHER_ANSWER, label: 'Borrowed' }],
    recommended: 'nobody',
    answer: { value: 'retired' },
  },
  play: async ({ canvas }) => {
    const radios = canvas.getAllByRole('radio')
    await expect(radios).toHaveLength(3)
    await expect(canvas.queryByText('Recommended')).toBeNull()
    await expect(canvas.queryByText('Growth again')).toBeNull()
    await expect(canvas.queryByText('Borrowed')).toBeNull()
    // Order is as given when nothing is recommended.
    await expect(radios[0]).toHaveAccessibleName('Leadership')
    for (const radio of radios) await expect(radio).toHaveAttribute('aria-checked', 'false')
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeDisabled()
  },
}

export const NoOptions: Story = {
  args: { options: [], recommended: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('radio')).toHaveLength(1)
    await expect(canvas.getByRole('radio')).toHaveAccessibleName('Someone else')
  },
}

export const OutcomeIsAnnounced: Story = {
  render: function Render(args) {
    const [outcome, setOutcome] = React.useState<string>()
    return <QuestionCard {...args} outcome={outcome} onContinue={(answer) => { args.onContinue(answer); setOutcome('Sending it to the growth team.') }} />
  },
  play: async ({ canvas, canvasElement, args }) => {
    const region = canvas.getByRole('status')
    await expect(region.textContent).toBe('')
    await expect(getComputedStyle(region).display).not.toBe('contents')
    await expect(getComputedStyle(region).display).not.toBe('none')
    const card = canvasElement.querySelector('[data-slot="question-card"]') as HTMLElement
    const before = card.getBoundingClientRect().height
    region.style.display = 'none'
    await expect(card.getBoundingClientRect().height).toBe(before)
    region.style.display = ''
    await userEvent.click(canvas.getByText('The growth team'))
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))
    await expect(canvas.getByRole('status')).toBe(region)
    await expect(region).toHaveTextContent('Sending it to the growth team.')
    await expect(canvas.queryByRole('button')).toBeNull()
    // The choice stays shown and can no longer be changed.
    const changes = (args.onAnswerChange as ReturnType<typeof fn>).mock.calls.length
    await userEvent.click(canvas.getByText('3 people. Shorter version, numbers only.'))
    await expect(args.onAnswerChange).toHaveBeenCalledTimes(changes)
    await expect(canvas.getAllByRole('radio')[0]).toHaveAttribute('aria-checked', 'true')
  },
}

// Pressing Continue removes the button that had focus; the person must not be dropped on the page body.
export const FocusStaysInTheCardOnDecision: Story = {
  render: function Render(args) {
    const [outcome, setOutcome] = React.useState<string>()
    return <QuestionCard {...args} outcome={outcome} onContinue={(answer) => { args.onContinue(answer); setOutcome('Sending it to the growth team.') }} />
  },
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByText('The growth team'))
    const go = canvas.getByRole('button', { name: 'Continue' })
    await tabTo(go)
    await userEvent.keyboard('{Enter}')
    const card = canvasElement.querySelector('[data-slot="question-card"]') as HTMLElement
    await expect(canvas.queryByRole('button')).toBeNull()
    await expect(card.contains(document.activeElement)).toBe(true)
    await expect(document.activeElement).toBe(canvas.getByRole('status'))
  },
}

// Enter in the free-text field is the same decision as pressing Continue. The field locks (and so drops focus) as the
// outcome arrives; the person keeps their place on the outcome line.
export const FocusStaysInTheCardAfterEnterInTheField: Story = {
  render: function Render(args) {
    const [outcome, setOutcome] = React.useState<string>()
    return <QuestionCard {...args} outcome={outcome} onContinue={(answer) => { args.onContinue(answer); setOutcome('Sending it to Priya.') }} />
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByText('Someone else'))
    await userEvent.type(canvas.getByRole('textbox', { name: FIELD_NAME }), 'Priya{Enter}')
    await expect(canvas.getByRole('status')).toHaveTextContent('Sending it to Priya.')
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
        <QuestionCard {...args} outcome={outcome} />
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
        <QuestionCard {...args} outcome={outcome} />
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

// A chosen answer the app holds, with no way to hear about changes, would give rows that do nothing.
export const ControlledWithoutCallbackLocksTheRows: Story = {
  args: { answer: { value: 'leadership' }, onAnswerChange: undefined },
  play: async ({ canvas }) => {
    const radios = canvas.getAllByRole('radio')
    await expect(radios[0]).toHaveAttribute('aria-checked', 'false')
    await expect(radios[1]).toHaveAttribute('aria-checked', 'true')
    for (const radio of radios) await expect(radio).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(canvas.getByText('The growth team'))
    await expect(radios[1]).toHaveAttribute('aria-checked', 'true')
  },
}

export const LongUnbrokenTextWraps: Story = {
  args: {
    question: 'Which of ' + 'x'.repeat(90) + ' should get it?',
    options: [{ value: 'long', label: 'y'.repeat(90), description: 'z'.repeat(120) }],
    recommended: undefined,
  },
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByText('y'.repeat(90)))
    const card = canvasElement.querySelector('[data-slot="question-card"]') as HTMLElement
    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth)
    for (const row of canvasElement.querySelectorAll('[data-slot="question-option"]')) {
      await expect((row as HTMLElement).scrollWidth).toBeLessThanOrEqual((row as HTMLElement).clientWidth)
    }
  },
}

// The tag once sat low beside a name (Phase 2); the radio must sit on the title's line too.
export const RadioAndTagSitOnTheTitleLine: Story = {
  play: async ({ canvas, canvasElement }) => {
    const row = canvasElement.querySelector('[data-slot="question-option"]') as HTMLElement
    const title = (row.querySelector('[data-slot="option-title"]') as HTMLElement).getBoundingClientRect()
    const radio = within(row).getByRole('radio').getBoundingClientRect()
    const tag = canvas.getByText('Recommended').getBoundingClientRect()
    // Measured against the title's line box (not its glyphs): a glyph box is a pixel off from the line, which hid a top-aligned radio.
    console.log(`question-card radio ${Math.abs(centreY(radio) - centreY(title)).toFixed(2)}px, tag ${Math.abs(centreY(tag) - centreY(title)).toFixed(2)}px off the title line`)
    await expect(Math.abs(centreY(radio) - centreY(title))).toBeLessThanOrEqual(0.5)
    await expect(Math.abs(centreY(tag) - centreY(title))).toBeLessThanOrEqual(1)
  },
}

// The stock moss tag, never a hand-rolled grey pill (which all but vanished in the dark themes).
export const RecommendedIsTheStockTag: Story = {
  play: async ({ canvas }) => {
    const tag = canvas.getByText('Recommended')
    await expect(tag).toHaveAttribute('data-slot', 'badge')
    const row = tag.closest('[data-slot="question-option"]') as HTMLElement
    const surface = compositeOver(getComputedStyle(row).backgroundColor, `rgb(${surfaceBehind(row).join(' ')})`)
    const fill = compositeOver(getComputedStyle(tag).backgroundColor, `rgb(${surface.join(' ')})`)
    const text = compositeOver(getComputedStyle(tag).color, `rgb(${fill.join(' ')})`)
    console.log(`question-card tag shape ${contrastRatio(fill, surface).toFixed(2)}:1, text ${contrastRatio(text, fill).toFixed(2)}:1`)
    await expect(contrastRatio(fill, surface)).toBeGreaterThanOrEqual(1.2)
    await expect(contrastRatio(text, fill)).toBeGreaterThanOrEqual(4.5)
  },
}

// An option row is a control: its outline has to be seen at 3:1 in every theme.
export const OptionRowsReadAsShapes: Story = {
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelectorAll('[data-slot="question-option"]')[1] as HTMLElement
    const surface = surfaceBehind(row)
    const outline = compositeOver(getComputedStyle(row).borderTopColor, `rgb(${surface.join(' ')})`)
    const ratio = contrastRatio(outline, surface)
    console.log(`question-card option outline ${ratio.toFixed(2)}:1`)
    await expect(ratio).toBeGreaterThanOrEqual(3)
  },
}

export const DoDont: Story = {
  render: (args) => (
    <DoDontPair usage={usage} id="explain-each-option"
      doExample={<QuestionCard {...args} />}
      dontExample={(
        <div className="grid gap-2.5 rounded-xl border border-border bg-card px-4 py-3.5 text-sm">
          <p className="font-semibold">{QUESTION}</p>
          <div className="flex gap-1.5"><Button variant="outline">Growth</Button><Button variant="outline">Leadership</Button></div>
        </div>
      )} />
  ),
}
