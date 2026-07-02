import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Icon } from '@/components/ui/icon'

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
Use \`spacing={0}\` for a connected/segmented button appearance.
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
  args: {
    multiple: true,
  },
  render: (args) => (
    <ToggleGroup defaultValue={['bold']} {...args}>
      <ToggleGroupItem value="bold" aria-label="Bold"><Icon name="format_bold" /></ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic"><Icon name="format_italic" /></ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline"><Icon name="format_underlined" /></ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const SingleSelect: Story = {
  render: () => (
    <ToggleGroup defaultValue={['center']}>
      <ToggleGroupItem value="left" aria-label="Align left"><Icon name="format_align_left" /></ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center"><Icon name="format_align_center" /></ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right"><Icon name="format_align_right" /></ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Outline: Story = {
  render: () => (
    <ToggleGroup variant="outline" multiple defaultValue={['bold', 'italic']}>
      <ToggleGroupItem value="bold" aria-label="Bold"><Icon name="format_bold" /></ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic"><Icon name="format_italic" /></ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline"><Icon name="format_underlined" /></ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Connected: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Use `spacing={0}` for a connected segmented-button appearance. Works with both `default` and `outline` variants.',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4 items-start">
      <ToggleGroup spacing={0} defaultValue={['center']}>
        <ToggleGroupItem value="left" aria-label="Align left"><Icon name="format_align_left" /></ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center"><Icon name="format_align_center" /></ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right"><Icon name="format_align_right" /></ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup variant="outline" spacing={0} multiple defaultValue={['bold']}>
        <ToggleGroupItem value="bold" aria-label="Bold"><Icon name="format_bold" /></ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic"><Icon name="format_italic" /></ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline"><Icon name="format_underlined" /></ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6 items-start">
      <div>
        <p className="text-xs text-ink-muted mb-2">Default (multi-select)</p>
        <ToggleGroup multiple defaultValue={['bold']}>
          <ToggleGroupItem value="bold" aria-label="Bold"><Icon name="format_bold" /></ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic"><Icon name="format_italic" /></ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline"><Icon name="format_underlined" /></ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div>
        <p className="text-xs text-ink-muted mb-2">Outline (single-select)</p>
        <ToggleGroup variant="outline" defaultValue={['center']}>
          <ToggleGroupItem value="left" aria-label="Align left"><Icon name="format_align_left" /></ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center"><Icon name="format_align_center" /></ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right"><Icon name="format_align_right" /></ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div>
        <p className="text-xs text-ink-muted mb-2">Connected (spacing={0})</p>
        <ToggleGroup spacing={0} defaultValue={['left']}>
          <ToggleGroupItem value="left" aria-label="Align left"><Icon name="format_align_left" /></ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center"><Icon name="format_align_center" /></ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right"><Icon name="format_align_right" /></ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div>
        <p className="text-xs text-ink-muted mb-2">Vertical</p>
        <ToggleGroup orientation="vertical" multiple defaultValue={['bold']}>
          <ToggleGroupItem value="bold" aria-label="Bold"><Icon name="format_bold" /></ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic"><Icon name="format_italic" /></ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline"><Icon name="format_underlined" /></ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div>
        <p className="text-xs text-ink-muted mb-2">Small</p>
        <ToggleGroup size="sm" multiple defaultValue={['bold']}>
          <ToggleGroupItem value="bold" aria-label="Bold"><Icon name="format_bold" /></ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic"><Icon name="format_italic" /></ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline"><Icon name="format_underlined" /></ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div>
        <p className="text-xs text-ink-muted mb-2">Large</p>
        <ToggleGroup size="lg" multiple defaultValue={['bold']}>
          <ToggleGroupItem value="bold" aria-label="Bold"><Icon name="format_bold" /></ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic"><Icon name="format_italic" /></ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline"><Icon name="format_underlined" /></ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  ),
}
