import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { usage } from '@/usage/textarea.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
  argTypes: {
    disabled: { control: 'boolean', description: 'Disable the textarea' },
    placeholder: { control: 'text', description: 'Placeholder text' },
    rows: { control: { type: 'number', min: 2, max: 12 }, description: 'Visible rows' },
    className: { table: { disable: true } },
  },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="bio">Bio</Label>
      <Textarea id="bio" placeholder="Tell us about yourself…" rows={4} />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="bio-dis">Bio</Label>
      <Textarea id="bio-dis" defaultValue="Currently not editable." rows={3} disabled />
    </div>
  ),
}

export const WithError: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="bio-err">Course description</Label>
      <Textarea id="bio-err" aria-invalid rows={3} defaultValue="Too short." />
      <p className="text-xs text-destructive">Description must be at least 50 characters.</p>
    </div>
  ),
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <div className="flex flex-col gap-2">
        <Label htmlFor="av-default">Default</Label>
        <Textarea id="av-default" placeholder="Enter text…" rows={3} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="av-filled">Filled</Label>
        <Textarea id="av-filled" defaultValue="This course covers the basics of watercolor painting, from washes to wet-on-wet techniques." rows={3} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="av-error">Error</Label>
        <Textarea id="av-error" aria-invalid defaultValue="Too short." rows={2} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="av-disabled" className="text-ink-muted">Disabled</Label>
        <Textarea id="av-disabled" defaultValue="Not editable." rows={2} disabled />
      </div>
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
        <div className="flex flex-col gap-2">
          <Label htmlFor="dodont-bio">Bio</Label>
          <Textarea id="dodont-bio" placeholder="Tell us about yourself…" rows={3} />
        </div>
      }
      dontExample={<Textarea placeholder="Tell us about yourself…" rows={3} />}
    />
  ),
}
