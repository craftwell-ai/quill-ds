import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

const meta = {
  title: 'UI / Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Design tokens
\`--primary\` · \`--secondary\` · \`--destructive\` · \`--muted\` · \`--radius-lg\`

### Rules
Primary (\`default\`) = ink fill. Use for the single most important action on a surface.
Secondary = paper-deep fill; ghost/outline = no fill. One primary per surface.
Focus ring is \`--ring\` (ink), never terracotta.
        `,
      },
    },
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

export const Default: Story = { args: { children: 'Save changes' } }
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
