import type { Meta, StoryObj } from '@storybook/react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

const meta = {
  title: 'UI / Label',
  component: Label,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Design tokens
\`--ink\` · \`--ink-muted\` (disabled)

### Rules
Always associate Label with its control via \`htmlFor\`/\`id\` or co-location.
Label automatically dims when its associated peer input is disabled.
        `,
      },
    },
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
  render: () => (
    <div className="flex flex-col gap-1.5 w-64">
      <Label htmlFor="email">Email address</Label>
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
    <div className="flex flex-col gap-1.5 w-64">
      <Label htmlFor="disabled-input">Locked field</Label>
      <Input id="disabled-input" disabled defaultValue="read-only" />
    </div>
  ),
}
