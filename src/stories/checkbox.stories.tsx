'use client'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { usage } from '@/usage/checkbox.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disables the checkbox',
      table: { defaultValue: { summary: 'false' } },
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Initial checked state (uncontrolled)',
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
}

export const Checked: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="checked" defaultChecked />
      <Label htmlFor="checked">Already agreed</Label>
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="disabled" {...args} />
      <Label htmlFor="disabled">Unavailable option</Label>
    </div>
  ),
}

export const Invalid: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="invalid" aria-invalid={true} />
      <Label htmlFor="invalid">Required field</Label>
    </div>
  ),
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      {[
        { id: 'av1', label: 'Unchecked', checked: false, disabled: false, invalid: false },
        { id: 'av2', label: 'Checked', checked: true, disabled: false, invalid: false },
        { id: 'av3', label: 'Disabled unchecked', checked: false, disabled: true, invalid: false },
        { id: 'av4', label: 'Disabled checked', checked: true, disabled: true, invalid: false },
        { id: 'av5', label: 'Invalid', checked: false, disabled: false, invalid: true },
      ].map(({ id, label, checked, disabled, invalid }) => (
        <div key={id} className="flex items-center gap-2">
          <Checkbox
            id={id}
            defaultChecked={checked}
            disabled={disabled}
            aria-invalid={invalid || undefined}
          />
          <Label htmlFor={id}>{label}</Label>
        </div>
      ))}
    </div>
  ),
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="pair-with-label"
      doExample={
        <div className="flex items-center gap-2">
          <Checkbox id="usage-checkbox-do" />
          <Label htmlFor="usage-checkbox-do">Accept terms and conditions</Label>
        </div>
      }
      dontExample={
        <div className="flex items-center gap-2">
          <Checkbox />
          <span>Accept terms and conditions</span>
        </div>
      }
    />
  ),
}
