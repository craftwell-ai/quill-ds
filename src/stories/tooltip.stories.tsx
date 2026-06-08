import type { Meta, StoryObj } from '@storybook/react'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { InfoIcon } from 'lucide-react'

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
Use \`asChild\` on \`TooltipTrigger\` to forward to a custom element.
        `,
      },
    },
  },
  argTypes: { className: { table: { disable: true } } },
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
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>Save your progress</TooltipContent>
    </Tooltip>
  ),
}

export const IconTrigger: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="rounded-full p-1 text-ink-muted hover:text-ink" aria-label="More information">
          <InfoIcon className="size-4" />
        </button>
      </TooltipTrigger>
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
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">{side}</Button>
          </TooltipTrigger>
          <TooltipContent side={side}>Tooltip on {side}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
}
