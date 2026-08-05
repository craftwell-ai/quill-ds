import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { expect } from 'storybook/test'
import { usage } from '@/usage/button.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'],
      description: 'Visual style variant',
      table: { defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
      description: 'Button size',
      table: { defaultValue: { summary: 'default' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
      table: { defaultValue: { summary: 'false' } },
    },
    children: { control: 'text' },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: 'Save changes' },
  play: async ({ canvasElement }) => {
    const wrapper = canvasElement.querySelector('[data-theme]')
    if (!wrapper) throw new Error('themed wrapper not found')
    expect(wrapper.getBoundingClientRect().height).toBeLessThan(window.innerHeight)
  },
}
export const Outline: Story = { args: { variant: 'outline', children: 'Cancel' } }
export const Secondary: Story = { args: { variant: 'secondary', children: 'Secondary' } }
export const Ghost: Story = { args: { variant: 'ghost', children: 'Ghost' } }
export const Destructive: Story = { args: { variant: 'destructive', children: 'Delete' } }
export const Link: Story = { args: { variant: 'link', children: 'View details' } }
export const Disabled: Story = { args: { disabled: true, children: 'Disabled' } }

export const WithIcon: Story = {
  args: { children: 'Add lesson' },
  render: (args) => (
    <Button {...args}>
      <Icon name="add" data-icon="inline-start" />
      {args.children}
    </Button>
  ),
}

export const IconOnly: Story = {
  args: { size: 'icon', 'aria-label': 'Next' },
  render: (args) => (
    <Button {...args}>
      <Icon name="arrow_forward" />
    </Button>
  ),
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-2 items-center">
      {(['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'] as const).map((v) => (
        <Button key={v} variant={v}>{v}</Button>
      ))}
    </div>
  ),
}

export const AllSizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 items-center">
        {(['xs', 'sm', 'default', 'lg'] as const).map((s) => (
          <Button key={s} size={s}>Size {s}</Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        {(['icon-xs', 'icon-sm', 'icon', 'icon-lg'] as const).map((s) => (
          <Button key={s} size={s} aria-label={`Icon ${s}`}>
            <Icon name="arrow_forward" />
          </Button>
        ))}
      </div>
    </div>
  ),
}

export const Dark: Story = {
  parameters: { globals: { theme: 'dark' } },
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(['default', 'outline', 'secondary', 'ghost', 'destructive'] as const).map((v) => (
        <Button key={v} variant={v}>{v}</Button>
      ))}
    </div>
  ),
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="one-primary"
      doExample={
        <div className="flex gap-2">
          <Button>Save changes</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      }
      dontExample={
        <div className="flex gap-2">
          <Button>Save changes</Button>
          <Button>Cancel</Button>
        </div>
      }
    />
  ),
}
