import type { Meta, StoryObj } from '@storybook/react'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { CommandIcon } from 'lucide-react'

const meta = {
  title: 'UI / Kbd',
  component: Kbd,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Design tokens
\`--muted\` · \`--muted-foreground\` · \`--radius-sm\`

### Rules
\`Kbd\` renders a keyboard key badge. Use for hotkeys in tooltips, menus, and shortcut references.
Wrap multiple keys in \`KbdGroup\` for compound shortcuts (⌘K, ⇧⌘P).
        `,
      },
    },
  },
  argTypes: {
    children: { control: 'text', description: 'Key label' },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Kbd>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { children: 'K' } }
export const Symbol: Story = { args: { children: '⌘' } }
export const WithIcon: Story = {
  render: () => <Kbd><CommandIcon /></Kbd>,
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>⇧</Kbd>
        <Kbd>⌘</Kbd>
        <Kbd>P</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>Alt</Kbd>
        <Kbd>Del</Kbd>
      </KbdGroup>
    </div>
  ),
}
