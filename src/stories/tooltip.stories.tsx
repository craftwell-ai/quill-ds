import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

const meta = {
  title: 'UI / Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Design tokens
\`--foreground\` · \`--background\` · \`--radius-md\`

### Rules
Wrap your tree with \`TooltipProvider\` (usually at app root).
Tooltip appears on hover/focus — not on click. Use \`side\` on \`TooltipContent\` to control placement.
Use the \`render\` prop on \`TooltipTrigger\` to forward to a custom element (Base UI pattern).
        `,
      },
    },
  },
  argTypes: {},
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline">Hover me</Button>} />
      <TooltipContent>Save your progress</TooltipContent>
    </Tooltip>
  ),
}

export const IconTrigger: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger
        render={
          <button className="rounded-full p-1 text-ink-muted hover:text-ink" aria-label="More information">
            <Icon name="info" className="size-4" />
          </button>
        }
      />
      <TooltipContent>This course is recommended for beginners.</TooltipContent>
    </Tooltip>
  ),
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-4">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger render={<Button variant="outline" size="sm">{side}</Button>} />
          <TooltipContent side={side}>Tooltip on {side}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
}
