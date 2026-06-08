import type { Meta, StoryObj } from '@storybook/react'
import { NativeSelect, NativeSelectOption, NativeSelectOptGroup } from '@/components/ui/native-select'

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

Use \`NativeSelectOption\` and \`NativeSelectOptGroup\` sub-components for consistent theming across light and dark modes.
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
    <NativeSelect defaultValue="" aria-label="Category">
      <NativeSelectOption value="" disabled>Select category…</NativeSelectOption>
      <NativeSelectOption value="art">Art & Drawing</NativeSelectOption>
      <NativeSelectOption value="craft">Craft & Making</NativeSelectOption>
      <NativeSelectOption value="writing">Writing</NativeSelectOption>
      <NativeSelectOption value="music">Music</NativeSelectOption>
    </NativeSelect>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="sort-select" className="text-sm font-medium">
        Sort by
      </label>
      <NativeSelect id="sort-select" defaultValue="newest">
        <NativeSelectOption value="newest">Newest first</NativeSelectOption>
        <NativeSelectOption value="oldest">Oldest first</NativeSelectOption>
        <NativeSelectOption value="az">A–Z</NativeSelectOption>
        <NativeSelectOption value="za">Z–A</NativeSelectOption>
      </NativeSelect>
    </div>
  ),
}

export const WithGroups: Story = {
  render: () => (
    <NativeSelect defaultValue="" aria-label="Topic">
      <NativeSelectOption value="" disabled>Choose a topic…</NativeSelectOption>
      <NativeSelectOptGroup label="Visual Arts">
        <NativeSelectOption value="drawing">Drawing</NativeSelectOption>
        <NativeSelectOption value="painting">Painting</NativeSelectOption>
        <NativeSelectOption value="photography">Photography</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Written Arts">
        <NativeSelectOption value="fiction">Fiction</NativeSelectOption>
        <NativeSelectOption value="poetry">Poetry</NativeSelectOption>
        <NativeSelectOption value="journalism">Journalism</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Performing Arts">
        <NativeSelectOption value="music">Music</NativeSelectOption>
        <NativeSelectOption value="theatre">Theatre</NativeSelectOption>
        <NativeSelectOption value="dance">Dance</NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  ),
}

export const Small: Story = {
  render: () => (
    <NativeSelect size="sm" defaultValue="newest" aria-label="Sort order">
      <NativeSelectOption value="newest">Newest first</NativeSelectOption>
      <NativeSelectOption value="oldest">Oldest first</NativeSelectOption>
      <NativeSelectOption value="az">A–Z</NativeSelectOption>
    </NativeSelect>
  ),
}

export const Disabled: Story = {
  render: () => (
    <NativeSelect disabled defaultValue="none" aria-label="Category">
      <NativeSelectOption value="none">No categories available</NativeSelectOption>
    </NativeSelect>
  ),
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <NativeSelect defaultValue="" aria-label="Default size select">
        <NativeSelectOption value="" disabled>Default size</NativeSelectOption>
        <NativeSelectOption value="1">Option 1</NativeSelectOption>
        <NativeSelectOption value="2">Option 2</NativeSelectOption>
      </NativeSelect>
      <NativeSelect size="sm" defaultValue="" aria-label="Small size select">
        <NativeSelectOption value="" disabled>Small size</NativeSelectOption>
        <NativeSelectOption value="1">Option 1</NativeSelectOption>
        <NativeSelectOption value="2">Option 2</NativeSelectOption>
      </NativeSelect>
      <NativeSelect disabled defaultValue="none" aria-label="Disabled select">
        <NativeSelectOption value="none">Disabled</NativeSelectOption>
      </NativeSelect>
      <NativeSelect defaultValue="" aria-label="Grouped select">
        <NativeSelectOption value="" disabled>With groups…</NativeSelectOption>
        <NativeSelectOptGroup label="Group A">
          <NativeSelectOption value="a1">Item A1</NativeSelectOption>
          <NativeSelectOption value="a2">Item A2</NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="Group B">
          <NativeSelectOption value="b1">Item B1</NativeSelectOption>
          <NativeSelectOption value="b2">Item B2</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
    </div>
  ),
}
