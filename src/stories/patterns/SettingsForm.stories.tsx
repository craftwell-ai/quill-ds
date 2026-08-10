import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Settings as SettingsBlock } from '@registry/blocks/settings'
import { Button } from '@/components/ui/button'
import { usage } from '@/usage/settings.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Forms / Settings',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Settings: Story = {
  render: () => <SettingsBlock />,
}

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="separate-save-from-cancel"
      doExample={
        <div className="flex w-[300px] justify-end gap-2 rounded-xl border border-border bg-card p-4">
          <Button variant="ghost">Cancel</Button>
          <Button>Save changes</Button>
        </div>
      }
      dontExample={
        <div className="flex w-[300px] justify-end gap-2 rounded-xl border border-border bg-card p-4">
          <Button>Cancel</Button>
          <Button>Save changes</Button>
        </div>
      }
    />
  ),
}
