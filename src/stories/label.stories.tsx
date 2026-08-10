import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { usage } from '@/usage/label.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Label',
  component: Label,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
  argTypes: {
    children: { control: 'text', description: 'Label text' },
    htmlFor: { control: 'text', description: 'Input id association' },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Email address',
    htmlFor: 'email',
  },
  render: (args) => (
    <div className="flex flex-col gap-1.5 w-64">
      <Label {...args} />
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
}

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="newsletter" />
      <Label htmlFor="newsletter">Subscribe to newsletter</Label>
    </div>
  ),
}

export const DisabledState: Story = {
  render: () => (
    // Input must precede Label in DOM order for peer-disabled CSS to apply to the label.
    // flex-col-reverse keeps the visual order as label → input.
    <div className="flex flex-col-reverse gap-1.5 w-64">
      <Input id="disabled-input" className="peer" disabled defaultValue="read-only" />
      <Label htmlFor="disabled-input">Locked field</Label>
    </div>
  ),
}

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="peer-disabled-needs-input-first-in-dom"
      doExample={
        <div className="flex flex-col-reverse gap-1.5 w-64">
          <Input id="dodont-locked-do" className="peer" disabled defaultValue="read-only" />
          <Label htmlFor="dodont-locked-do">Locked field</Label>
        </div>
      }
      dontExample={
        <div className="flex flex-col gap-1.5 w-64">
          <Label htmlFor="dodont-locked-dont">Locked field</Label>
          <Input id="dodont-locked-dont" className="peer" disabled defaultValue="read-only" />
        </div>
      }
    />
  ),
}
