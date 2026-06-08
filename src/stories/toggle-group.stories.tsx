import type { Meta, StoryObj } from '@storybook/react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { BoldIcon, ItalicIcon, UnderlineIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon } from 'lucide-react'

const meta = {
  title: 'UI / ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Design tokens
\`--muted\` · \`--foreground\` · \`--input\` · \`--ring\`

### Rules
Use \`multiple\` for multi-select (e.g. text formatting), omit it (defaults false) for single-select (e.g. alignment).
\`defaultValue\` is an array of selected item values.
Inherits \`variant\` and \`size\` from the group — set on \`ToggleGroup\`, not individual items.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
      description: 'Visual style',
      table: { defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: 'Item size',
      table: { defaultValue: { summary: 'default' } },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof ToggleGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ToggleGroup defaultValue={['bold']}>
      <ToggleGroupItem value="bold" aria-label="Bold"><BoldIcon /></ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic"><ItalicIcon /></ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline"><UnderlineIcon /></ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const SingleSelect: Story = {
  render: () => (
    <ToggleGroup defaultValue={['center']}>
      <ToggleGroupItem value="left" aria-label="Align left"><AlignLeftIcon /></ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center"><AlignCenterIcon /></ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right"><AlignRightIcon /></ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Outline: Story = {
  render: () => (
    <ToggleGroup variant="outline" defaultValue={['bold', 'italic']}>
      <ToggleGroupItem value="bold" aria-label="Bold"><BoldIcon /></ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic"><ItalicIcon /></ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline"><UnderlineIcon /></ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6 items-start">
      <div>
        <p className="text-xs text-ink-muted mb-2">Default (multi-select)</p>
        <ToggleGroup defaultValue={['bold']}>
          <ToggleGroupItem value="bold" aria-label="Bold"><BoldIcon /></ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic"><ItalicIcon /></ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline"><UnderlineIcon /></ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div>
        <p className="text-xs text-ink-muted mb-2">Outline (single-select)</p>
        <ToggleGroup variant="outline" defaultValue={['center']}>
          <ToggleGroupItem value="left" aria-label="Align left"><AlignLeftIcon /></ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center"><AlignCenterIcon /></ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right"><AlignRightIcon /></ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div>
        <p className="text-xs text-ink-muted mb-2">Small</p>
        <ToggleGroup size="sm" defaultValue={['bold']}>
          <ToggleGroupItem value="bold" aria-label="Bold"><BoldIcon /></ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic"><ItalicIcon /></ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline"><UnderlineIcon /></ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  ),
}
