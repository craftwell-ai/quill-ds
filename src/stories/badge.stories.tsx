import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '@/components/ui/badge'

const meta = {
  title: 'UI / Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Design tokens
\`--primary\` · \`--secondary\` · \`--destructive\` · \`--border\` · \`--radius-full\`

### Rules
Badges are non-interactive status indicators. For clickable tags use a \`ghost\` or \`outline\` Badge wrapped in an anchor.
Keep badge text to 1–3 words. Don't stack more than 3 badges in a row without a container with \`flex-wrap\`.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
      description: 'Visual style',
      table: { defaultValue: { summary: 'default' } },
    },
    children: {
      control: 'text',
      description: 'Badge label',
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { variant: 'default', children: 'New' } }
export const Secondary: Story = { args: { variant: 'secondary', children: 'Beta' } }
export const Destructive: Story = { args: { variant: 'destructive', children: 'Error' } }
export const Outline: Story = { args: { variant: 'outline', children: 'Draft' } }
export const Ghost: Story = { args: { variant: 'ghost', children: 'Archive' } }

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-2 items-center">
      {(['default', 'secondary', 'destructive', 'outline', 'ghost'] as const).map((v) => (
        <Badge key={v} variant={v}>{v}</Badge>
      ))}
    </div>
  ),
}
