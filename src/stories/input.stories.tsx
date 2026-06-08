import type { Meta, StoryObj } from '@storybook/react'
import { Input } from '@/components/ui/input'

const meta = {
  title: 'UI / Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Design tokens
\`--input\` (border) · \`--ring\` (focus) · \`--radius-lg\`

### Rules
Input height is 32px (h-8). For validation errors, set \`aria-invalid="true"\` — this applies the destructive ring.
Pair with \`Field\`, \`FieldLabel\`, and \`FieldError\` for form usage. Don't use placeholder as a label.
        `,
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'url', 'tel'],
      description: 'HTML input type',
      table: { defaultValue: { summary: 'text' } },
    },
    placeholder: { control: 'text', description: 'Placeholder text' },
    disabled: { control: 'boolean', description: 'Disables the input', table: { defaultValue: { summary: 'false' } } },
    className: { table: { disable: true } },
  },
  decorators: [(Story) => <div className="w-72"><Story /></div>],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { placeholder: 'Enter text…' } }
export const WithValue: Story = { args: { defaultValue: 'Watercolor Basics' } }
export const Disabled: Story = { args: { disabled: true, defaultValue: 'Disabled input' } }
export const Invalid: Story = { render: () => <Input aria-invalid="true" defaultValue="bad@value" /> }
export const Password: Story = { args: { type: 'password', placeholder: 'Enter password…' } }

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 w-72">
      <Input placeholder="Default" />
      <Input defaultValue="With value" />
      <Input disabled defaultValue="Disabled" />
      <Input aria-invalid="true" defaultValue="Invalid" />
    </div>
  ),
}
