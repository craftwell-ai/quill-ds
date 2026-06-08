import type { Meta, StoryObj } from '@storybook/react'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const meta = {
  title: 'UI / HoverCard',
  component: HoverCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Design tokens
\`--popover\` · \`--shadow-sm\` · \`--radius-lg\`

### Rules
HoverCard shows on mouse hover (not click). Use for preview info — author bios, link previews, expanded metadata.
Never use for interactive actions — hover is unreliable on touch devices.
        `,
      },
    },
  },
  argTypes: {
    openDelay: { control: 'number', description: 'ms before opening', table: { defaultValue: { summary: '700' } } },
    closeDelay: { control: 'number', description: 'ms before closing', table: { defaultValue: { summary: '300' } } },
  },
} satisfies Meta<typeof HoverCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <a href="#" className="text-sm underline-offset-4 hover:underline">@ryanphillips</a>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="flex gap-3">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>RP</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-ink">Ryan Phillips</p>
            <p className="text-xs text-ink-muted">Founder, Quill Design System</p>
            <p className="text-xs text-ink-soft mt-2">Building tools for makers and teachers.</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
}
