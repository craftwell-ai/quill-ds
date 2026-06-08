import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const meta = {
  title: 'UI / Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Design tokens
\`--input\` · \`--ring\` · \`--radius-lg\`

### Rules
Textarea is a styled HTML \`<textarea>\`. Always pair with a \`Label\`.
Use \`aria-invalid\` for validation error styling. Set \`rows\` to control initial height.
        `,
      },
    },
  },
  argTypes: {
    disabled: { control: 'boolean', description: 'Disable the textarea' },
    placeholder: { control: 'text', description: 'Placeholder text' },
    rows: { control: { type: 'number', min: 2, max: 12 }, description: 'Visible rows' },
    className: { table: { disable: true } },
  },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="bio">Bio</Label>
      <Textarea id="bio" placeholder="Tell us about yourself…" rows={4} />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="bio-dis">Bio</Label>
      <Textarea id="bio-dis" defaultValue="Currently not editable." rows={3} disabled />
    </div>
  ),
}

export const WithError: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="bio-err">Course description</Label>
      <Textarea id="bio-err" aria-invalid rows={3} defaultValue="Too short." />
      <p className="text-xs text-destructive">Description must be at least 50 characters.</p>
    </div>
  ),
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <div className="flex flex-col gap-2">
        <Label>Default</Label>
        <Textarea placeholder="Enter text…" rows={3} />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Filled</Label>
        <Textarea defaultValue="This course covers the basics of watercolor painting, from washes to wet-on-wet techniques." rows={3} />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Error</Label>
        <Textarea aria-invalid defaultValue="Too short." rows={2} />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-ink-muted">Disabled</Label>
        <Textarea defaultValue="Not editable." rows={2} disabled />
      </div>
    </div>
  ),
}
