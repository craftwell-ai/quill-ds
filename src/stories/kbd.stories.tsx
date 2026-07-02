import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { Icon } from '@/components/ui/icon'

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
  render: () => <Kbd><Icon name="keyboard_command_key" /></Kbd>,
}

/** Shows Kbd used inline within a prose hint — the primary real-world usage pattern. */
export const InContext: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 text-sm text-muted-foreground">
      <p>
        Press <KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup> to open the command palette.
      </p>
      <p>
        Hit <Kbd>Enter</Kbd> to confirm or <Kbd>Esc</Kbd> to cancel.
      </p>
      <p>
        Use <Kbd>Tab</Kbd> to move between fields and <Kbd>Space</Kbd> to toggle a checkbox.
      </p>
      <p>
        <KbdGroup><Kbd>⇧</Kbd><Kbd>⌘</Kbd><Kbd>P</Kbd></KbdGroup> opens the command palette from anywhere.
      </p>
    </div>
  ),
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 items-center">
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
        <Kbd>Enter</Kbd>
        <Kbd>Esc</Kbd>
        <Kbd>Tab</Kbd>
        <Kbd>Space</Kbd>
        <Kbd>↑</Kbd>
        <Kbd>↓</Kbd>
      </div>
      <div className="flex flex-wrap gap-3 items-center">
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
        <KbdGroup>
          <Kbd><Icon name="keyboard_command_key" /></Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </div>
    </div>
  ),
}
