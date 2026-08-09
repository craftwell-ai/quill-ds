import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { usage } from '@/usage/radio-group.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
  argTypes: {
    defaultValue: { control: 'text', description: 'Default selected value' },
    disabled: { control: 'boolean', description: 'Disable all items' },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { defaultValue: 'beginner' },
  render: (args) => (
    <RadioGroup {...args}>
      {[
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' },
      ].map(({ value, label }) => (
        <div key={value} className="flex items-center gap-2">
          <RadioGroupItem value={value} id={`radio-${value}`} />
          <Label htmlFor={`radio-${value}`}>{label}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
}

export const Disabled: Story = {
  args: { defaultValue: 'beginner', disabled: true },
  render: (args) => (
    <RadioGroup {...args}>
      {[
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
      ].map(({ value, label }) => (
        <div key={value} className="flex items-center gap-2">
          <RadioGroupItem value={value} id={`radio-d-${value}`} />
          <Label htmlFor={`radio-d-${value}`}>{label}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
}

export const WithError: Story = {
  args: { defaultValue: undefined },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <RadioGroup {...args}>
        {[
          { value: 'monthly', label: 'Monthly billing' },
          { value: 'annual', label: 'Annual billing' },
        ].map(({ value, label }) => (
          <div key={value} className="flex items-center gap-2">
            <RadioGroupItem
              value={value}
              id={`radio-err-${value}`}
              aria-invalid
            />
            <Label htmlFor={`radio-err-${value}`}>{label}</Label>
          </div>
        ))}
      </RadioGroup>
      <p className="text-sm text-destructive">Please select a billing plan to continue.</p>
    </div>
  ),
}

export const Controlled: Story = {
  args: {},
  render: () => {
    const [plan, setPlan] = useState('standard')
    return (
      <div className="flex flex-col gap-3">
        <RadioGroup value={plan} onValueChange={setPlan}>
          {[
            { value: 'starter', label: 'Starter — Free' },
            { value: 'standard', label: 'Standard — $12/mo' },
            { value: 'pro', label: 'Pro — $29/mo' },
          ].map(({ value, label }) => (
            <div key={value} className="flex items-center gap-2">
              <RadioGroupItem value={value} id={`radio-c-${value}`} />
              <Label htmlFor={`radio-c-${value}`}>{label}</Label>
            </div>
          ))}
        </RadioGroup>
        <p className="text-sm text-muted-foreground">Selected plan: <strong>{plan}</strong></p>
      </div>
    )
  },
}

export const AllVariants: Story = {
  args: {},
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-muted-foreground">Default</p>
        <RadioGroup defaultValue="beginner">
          {[
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'advanced', label: 'Advanced' },
          ].map(({ value, label }) => (
            <div key={value} className="flex items-center gap-2">
              <RadioGroupItem value={value} id={`radio-av-${value}`} />
              <Label htmlFor={`radio-av-${value}`}>{label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-muted-foreground">Disabled</p>
        <RadioGroup defaultValue="beginner" disabled>
          {[
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
          ].map(({ value, label }) => (
            <div key={value} className="flex items-center gap-2">
              <RadioGroupItem value={value} id={`radio-av-dis-${value}`} />
              <Label htmlFor={`radio-av-dis-${value}`}>{label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-muted-foreground">Error / Invalid</p>
        <div className="flex flex-col gap-2">
          <RadioGroup defaultValue={undefined}>
            {[
              { value: 'monthly', label: 'Monthly billing' },
              { value: 'annual', label: 'Annual billing' },
            ].map(({ value, label }) => (
              <div key={value} className="flex items-center gap-2">
                <RadioGroupItem value={value} id={`radio-av-err-${value}`} aria-invalid />
                <Label htmlFor={`radio-av-err-${value}`}>{label}</Label>
              </div>
            ))}
          </RadioGroup>
          <p className="text-sm text-destructive">Please select a billing plan to continue.</p>
        </div>
      </div>
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
        <RadioGroup defaultValue="beginner">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="beginner" id="usage-radio-do" />
            <Label htmlFor="usage-radio-do">Beginner</Label>
          </div>
        </RadioGroup>
      }
      dontExample={
        <RadioGroup defaultValue="beginner">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="beginner" />
            <span>Beginner</span>
          </div>
        </RadioGroup>
      }
    />
  ),
}
