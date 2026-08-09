import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { usage } from '@/usage/switch.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
  argTypes: {
    disabled: { control: 'boolean', description: 'Disable the switch', table: { defaultValue: { summary: 'false' } } },
    defaultChecked: { control: 'boolean', description: 'Default on/off state' },
    size: { control: 'select', options: ['default', 'sm'], description: 'Size variant', table: { defaultValue: { summary: 'default' } } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="notifications" defaultChecked />
      <Label htmlFor="notifications">Email notifications</Label>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Switch id="off-dis" disabled />
        <Label htmlFor="off-dis" className="text-ink-muted">Off (disabled)</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="on-dis" defaultChecked disabled />
        <Label htmlFor="on-dis" className="text-ink-muted">On (disabled)</Label>
      </div>
    </div>
  ),
}

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Default</p>
        <div className="flex items-center gap-2">
          <Switch id="size-default" defaultChecked />
          <Label htmlFor="size-default">Push notifications</Label>
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Small</p>
        <div className="flex items-center gap-2">
          <Switch id="size-sm" size="sm" defaultChecked />
          <Label htmlFor="size-sm">Push notifications</Label>
        </div>
      </div>
    </div>
  ),
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      {[
        { id: 'sw-1', label: 'Email notifications', checked: true, disabled: false },
        { id: 'sw-2', label: 'Push notifications', checked: false, disabled: false },
        { id: 'sw-3', label: 'Dark mode', checked: true, disabled: true },
        { id: 'sw-4', label: 'Beta features', checked: false, disabled: true },
      ].map(({ id, label, checked, disabled }) => (
        <div key={id} className="flex items-center gap-2">
          <Switch id={id} defaultChecked={checked} disabled={disabled} />
          <Label htmlFor={id} className={disabled ? 'text-ink-muted' : ''}>{label}</Label>
        </div>
      ))}
    </div>
  ),
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="pair-with-label"
      doExample={
        <div className="flex items-center gap-2">
          <Switch id="usage-switch-do" defaultChecked />
          <Label htmlFor="usage-switch-do">Email notifications</Label>
        </div>
      }
      dontExample={
        <div className="flex items-center gap-2">
          <Switch defaultChecked />
          <span>Email notifications</span>
        </div>
      }
    />
  ),
}
