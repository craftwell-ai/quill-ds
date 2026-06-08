import type { Meta, StoryObj } from '@storybook/react'
import { NativeSelect } from '@/components/ui/native-select'

const meta = {
  title: 'UI / NativeSelect',
  component: NativeSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Rules
NativeSelect renders a styled HTML \`<select>\`. Use for simple option lists where accessibility
and mobile-native scrolling matter more than custom rendering. For searchable or complex options, use \`Select\` or \`Combobox\`.
        `,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'sm'],
      description: 'Select height',
      table: { defaultValue: { summary: 'default' } },
    },
    disabled: { control: 'boolean', description: 'Disable the select' },
    className: { table: { disable: true } },
  },
  decorators: [(Story) => <div className="w-64"><Story /></div>],
} satisfies Meta<typeof NativeSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <NativeSelect defaultValue="">
      <option value="" disabled>Select category…</option>
      <option value="art">Art & Drawing</option>
      <option value="craft">Craft & Making</option>
      <option value="writing">Writing</option>
      <option value="music">Music</option>
    </NativeSelect>
  ),
}

export const Small: Story = {
  render: () => (
    <NativeSelect size="sm">
      <option value="newest">Newest first</option>
      <option value="oldest">Oldest first</option>
      <option value="az">A–Z</option>
    </NativeSelect>
  ),
}

export const Disabled: Story = {
  render: () => (
    <NativeSelect disabled>
      <option>Unavailable</option>
    </NativeSelect>
  ),
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 w-64">
      <NativeSelect>
        <option>Default size</option>
        <option>Option 2</option>
      </NativeSelect>
      <NativeSelect size="sm">
        <option>Small size</option>
        <option>Option 2</option>
      </NativeSelect>
      <NativeSelect disabled>
        <option>Disabled</option>
      </NativeSelect>
    </div>
  ),
}
