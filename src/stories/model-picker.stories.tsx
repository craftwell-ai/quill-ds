import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { ModelPicker, type ModelOption } from '../../registry/lib/model-picker'
import { PromptComposer } from '../../registry/lib/prompt-composer'
import { usage } from '@/usage/model-picker.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const MODELS: ModelOption[] = [
  { value: 'quick', label: 'Quick', description: 'Fast answers, fewer credits' },
  { value: 'balanced', label: 'Balanced', description: 'Good for most work', badge: 'New' },
  { value: 'deep', label: 'Deep', description: 'Thinks longer on hard problems · more credits' },
]

const meta = {
  title: 'Components / ModelPicker',
  component: ModelPicker,
  tags: ['autodocs'],
  parameters: { layout: 'centered', docs: { description: { component: renderUsageDocs(usage) } } },
  args: { models: MODELS, value: 'auto', onValueChange: fn() },
} satisfies Meta<typeof ModelPicker>

export default meta
type Story = StoryObj<typeof meta>

export const InTheComposer: Story = {
  render: function Render(args) {
    const [value, setValue] = React.useState(args.value)
    return (
      <div className="w-[34rem] max-w-full">
        <PromptComposer size="sm" onSubmit={() => {}} trailing={<ModelPicker {...args} value={value} onValueChange={(v) => { setValue(v); args.onValueChange(v) }} />} />
      </div>
    )
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Model: Auto' }))
    const page = within(document.body)
    const deep = await page.findByRole('menuitemradio', { name: /Deep/ })
    await expect(page.getByRole('menuitemradio', { name: /Auto/ })).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(deep)
    await expect(args.onValueChange).toHaveBeenCalledWith('deep')
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Model: Deep' })).toBeVisible())
  },
}
export const WithoutAuto: Story = {
  args: { auto: false, value: 'balanced' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Model: Balanced' })).toBeVisible()
  },
}
export const UnknownValueFallsBack: Story = {
  args: { value: 'retired-model' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Model: Auto' })).toBeVisible()
  },
}

const centreY = (box: Element) => {
  const rect = box.getBoundingClientRect()
  return rect.top + rect.height / 2
}

// Where the capital letters themselves sit: box centre can match while small caps still look low,
// so measure the ink (baseline minus half the cap height) as well as the box.
const capsCentreY = (element: HTMLElement, sample: string) => {
  const style = getComputedStyle(element)
  const context = document.createElement('canvas').getContext('2d')!
  context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
  const metrics = context.measureText(sample)
  const rect = element.getBoundingClientRect()
  const lineHeight = parseFloat(style.lineHeight) || rect.height
  const baseline = rect.top + (rect.height - lineHeight) / 2 + (lineHeight - (metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent)) / 2 + metrics.fontBoundingBoxAscent
  return baseline - (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2
}

// The badge once sat low beside the name; the check mark must share the same centre line.
export const BadgeAndCheckAlignWithName: Story = {
  args: { value: 'balanced' },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Model: Balanced' }))
    const page = within(document.body)
    const item = await page.findByRole('menuitemradio', { name: /Balanced/ })
    const name = item.querySelector('[data-model-name]') as HTMLElement
    const badge = within(item).getByText('New')
    await expect(Math.abs(centreY(badge) - centreY(name))).toBeLessThanOrEqual(1)
    await expect(Math.abs(capsCentreY(badge, 'NEW') - capsCentreY(name, 'B'))).toBeLessThanOrEqual(1)
    const check = item.querySelector('[data-slot="dropdown-menu-radio-item-indicator"]') as HTMLElement
    await expect(Math.abs(centreY(check) - centreY(name))).toBeLessThanOrEqual(1)
  },
}
export const DoDont: Story = {
  args: { models: MODELS, value: 'auto', onValueChange: fn() },
  render: () => (
    <DoDontPair usage={usage} id="say-what-it-is-for"
      doExample={<ul className="grid gap-1 text-sm">{MODELS.map((m) => <li key={m.value}><b>{m.label}</b> <span className="text-muted-foreground">· {m.description}</span></li>)}</ul>}
      dontExample={<ul className="grid gap-1 text-sm"><li><b>q-2-mini</b></li><li><b>b-4</b></li><li><b>d-4-pro</b></li></ul>} />
  ),
}
