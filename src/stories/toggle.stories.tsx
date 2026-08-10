import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Toggle } from '@/components/ui/toggle'
import { Icon } from '@/components/ui/icon'
import { usage } from '@/usage/toggle.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Toggle',
  component: Toggle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
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
  args: {
    'aria-label': 'Bold',
    children: <Icon name="format_bold" />,
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    'aria-label': 'Bold',
    defaultPressed: true,
    children: <Icon name="format_bold" />,
  },
}

export const WithText: Story = {
  args: {
    'aria-label': 'Bold',
    defaultPressed: true,
    children: (
      <>
        <Icon name="format_bold" />
        Bold
      </>
    ),
  },
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 items-start">
      <div>
        <p className="text-xs text-ink-muted mb-2">Default</p>
        <div className="flex gap-1">
          <Toggle aria-label="Bold"><Icon name="format_bold" /></Toggle>
          <Toggle aria-label="Italic" defaultPressed><Icon name="format_italic" /></Toggle>
          <Toggle aria-label="Underline"><Icon name="format_underlined" /></Toggle>
        </div>
      </div>
      <div>
        <p className="text-xs text-ink-muted mb-2">Outline</p>
        <div className="flex gap-1">
          <Toggle variant="outline" aria-label="Bold"><Icon name="format_bold" /></Toggle>
          <Toggle variant="outline" aria-label="Italic" defaultPressed><Icon name="format_italic" /></Toggle>
          <Toggle variant="outline" aria-label="Underline"><Icon name="format_underlined" /></Toggle>
        </div>
      </div>
      <div>
        <p className="text-xs text-ink-muted mb-2">Sizes</p>
        <div className="flex items-center gap-1">
          <Toggle size="sm" aria-label="Bold"><Icon name="format_bold" /></Toggle>
          <Toggle size="default" aria-label="Bold"><Icon name="format_bold" /></Toggle>
          <Toggle size="lg" aria-label="Bold"><Icon name="format_bold" /></Toggle>
        </div>
      </div>
      <div>
        <p className="text-xs text-ink-muted mb-2">Disabled</p>
        <Toggle disabled aria-label="Bold"><Icon name="format_bold" /></Toggle>
      </div>
    </div>
  ),
}

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="standalone-needs-outline"
      doExample={<Toggle variant="outline" aria-label="Bold"><Icon name="format_bold" /></Toggle>}
      dontExample={<Toggle aria-label="Bold"><Icon name="format_bold" /></Toggle>}
    />
  ),
}
