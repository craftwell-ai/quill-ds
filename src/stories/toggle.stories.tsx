import type { Meta, StoryObj } from '@storybook/react'
import { Toggle } from '@/components/ui/toggle'
import { BoldIcon, ItalicIcon, UnderlineIcon } from 'lucide-react'

const meta = {
  title: 'UI / Toggle',
  component: Toggle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Design tokens
\`--muted\` · \`--foreground\` · \`--ring\`

### Rules
Toggle is a two-state button (on/off). Use \`defaultPressed\` for uncontrolled, \`pressed\` + \`onPressedChange\` for controlled.
Use \`variant="outline"\` for bordered style. Available sizes: \`sm\`, \`default\`, \`lg\`.
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
      description: 'Toggle size',
      table: { defaultValue: { summary: 'default' } },
    },
    disabled: { control: 'boolean', description: 'Disable the toggle' },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Toggle aria-label="Bold">
      <BoldIcon />
    </Toggle>
  ),
}

export const Outline: Story = {
  render: () => (
    <Toggle variant="outline" aria-label="Bold" defaultPressed>
      <BoldIcon />
    </Toggle>
  ),
}

export const WithText: Story = {
  render: () => (
    <Toggle defaultPressed>
      <BoldIcon />
      Bold
    </Toggle>
  ),
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 items-start">
      <div>
        <p className="text-xs text-ink-muted mb-2">Default</p>
        <div className="flex gap-1">
          <Toggle aria-label="Bold"><BoldIcon /></Toggle>
          <Toggle aria-label="Italic" defaultPressed><ItalicIcon /></Toggle>
          <Toggle aria-label="Underline"><UnderlineIcon /></Toggle>
        </div>
      </div>
      <div>
        <p className="text-xs text-ink-muted mb-2">Outline</p>
        <div className="flex gap-1">
          <Toggle variant="outline" aria-label="Bold"><BoldIcon /></Toggle>
          <Toggle variant="outline" aria-label="Italic" defaultPressed><ItalicIcon /></Toggle>
          <Toggle variant="outline" aria-label="Underline"><UnderlineIcon /></Toggle>
        </div>
      </div>
      <div>
        <p className="text-xs text-ink-muted mb-2">Sizes</p>
        <div className="flex items-center gap-1">
          <Toggle size="sm" aria-label="Bold"><BoldIcon /></Toggle>
          <Toggle size="default" aria-label="Bold"><BoldIcon /></Toggle>
          <Toggle size="lg" aria-label="Bold"><BoldIcon /></Toggle>
        </div>
      </div>
      <div>
        <p className="text-xs text-ink-muted mb-2">Disabled</p>
        <Toggle disabled aria-label="Bold"><BoldIcon /></Toggle>
      </div>
    </div>
  ),
}
