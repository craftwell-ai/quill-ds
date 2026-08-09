import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Slider } from '@/components/ui/slider'
import { usage } from '@/usage/slider.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
  argTypes: {
    disabled: { control: 'boolean', description: 'Disable the slider', table: { defaultValue: { summary: 'false' } } },
    min: { control: { type: 'number' }, description: 'Minimum value', table: { defaultValue: { summary: '0' } } },
    max: { control: { type: 'number' }, description: 'Maximum value', table: { defaultValue: { summary: '100' } } },
    step: { control: { type: 'number' }, description: 'Step increment', table: { defaultValue: { summary: '1' } } },
    className: { table: { disable: true } },
  },
  decorators: [(Story) => <div className="w-72 px-2"><Story /></div>],
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState([50])
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs text-ink-muted">
          <span>Volume</span>
          <span>{value[0]}</span>
        </div>
        <Slider {...args} value={value} onValueChange={(v) => setValue(Array.isArray(v) ? v : [v])} />
      </div>
    )
  },
  args: { min: 0, max: 100, step: 1 },
}

export const Range: Story = {
  args: { defaultValue: [20, 80] },
}

export const Disabled: Story = {
  args: { defaultValue: [40], disabled: true },
}

export const Steps: Story = {
  args: { defaultValue: [3], min: 1, max: 10, step: 1 },
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-ink-muted">Default</p>
        <Slider defaultValue={[50]} />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-ink-muted">Range</p>
        <Slider defaultValue={[25, 75]} />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-ink-muted">Steps (1–10)</p>
        <Slider defaultValue={[5]} min={1} max={10} step={1} />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-ink-muted">Disabled</p>
        <Slider defaultValue={[60]} disabled />
      </div>
    </div>
  ),
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  decorators: [(Story) => <div className="w-[640px]"><Story /></div>],
  render: () => (
    <DoDontPair
      usage={usage}
      id="pair-with-visible-readout"
      doExample={
        <div className="flex flex-col gap-1.5 w-full">
          <div className="flex justify-between text-xs text-ink-muted">
            <span>Volume</span>
            <span>50</span>
          </div>
          <Slider defaultValue={[50]} />
        </div>
      }
      dontExample={
        <div className="w-full">
          <Slider defaultValue={[50]} />
        </div>
      }
    />
  ),
}
