import type { Meta, StoryObj } from '@storybook/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const meta = {
  title: 'UI / Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Design tokens
\`--popover\` · \`--shadow-md\` · \`--radius-lg\`

### Rules
Popover opens on click (not hover — use HoverCard for hover).
Use for inline forms, filters, and contextual editing. Max width 288px. Close button optional if click-outside closes.
        `,
      },
    },
  },
  argTypes: {
    open: { control: 'boolean', description: 'Controlled open state' },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-ink">Quick settings</p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pop-name">Display name</Label>
            <Input id="pop-name" placeholder="Your name" />
          </div>
          <Button size="sm">Save</Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
}
