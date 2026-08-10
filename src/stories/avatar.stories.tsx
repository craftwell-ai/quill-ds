import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar'
import { usage } from '@/usage/avatar.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: 'Avatar diameter',
      table: { defaultValue: { summary: 'default' } },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { size: 'default' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" alt="User" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
}

export const Fallback: Story = {
  args: { size: 'default' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="/no-image.jpg" alt="User" />
      <AvatarFallback>RP</AvatarFallback>
    </Avatar>
  ),
}

export const WithBadge: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-6">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Avatar size={size}>
            <AvatarImage src="https://github.com/shadcn.png" alt="User" />
            <AvatarFallback>CN</AvatarFallback>
            <AvatarBadge />
          </Avatar>
          <span className="text-xs text-ink-muted">{size}</span>
        </div>
      ))}
    </div>
  ),
}

export const Group: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-center gap-6">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <AvatarGroup>
            <Avatar size={size}>
              <AvatarImage src="https://github.com/shadcn.png" alt="Alice" />
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <Avatar size={size}>
              <AvatarImage src="https://avatars.githubusercontent.com/u/1?v=4" alt="Bob" />
              <AvatarFallback>BO</AvatarFallback>
            </Avatar>
            <Avatar size={size}>
              <AvatarFallback>RP</AvatarFallback>
            </Avatar>
            <AvatarGroupCount>+4</AvatarGroupCount>
          </AvatarGroup>
          <span className="text-xs text-ink-muted">{size}</span>
        </div>
      ))}
    </div>
  ),
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-4">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Avatar size={size}>
            <AvatarImage src="https://github.com/shadcn.png" alt="User" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span className="text-xs text-ink-muted">{size}</span>
        </div>
      ))}
      <div className="flex flex-col items-center gap-2">
        <Avatar>
          <AvatarFallback>RP</AvatarFallback>
        </Avatar>
        <span className="text-xs text-ink-muted">fallback</span>
      </div>
    </div>
  ),
}

export const Dark: Story = {
  parameters: { globals: { theme: 'dark' } },
  render: () => (
    <div className="flex gap-3">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="User" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>RP</AvatarFallback>
      </Avatar>
    </div>
  ),
}

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="always-fallback"
      doExample={
        <Avatar>
          <AvatarImage src="/no-image.jpg" alt="User" />
          <AvatarFallback>RP</AvatarFallback>
        </Avatar>
      }
      dontExample={
        <Avatar>
          <AvatarImage src="/no-image.jpg" alt="User" />
        </Avatar>
      }
    />
  ),
}
