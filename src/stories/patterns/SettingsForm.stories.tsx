import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Settings as SettingsBlock } from '@registry/blocks/settings'
import { Button } from '@/components/ui/button'
import { usage } from '@/usage/settings.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Forms / Settings',
  component: SettingsBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta<typeof SettingsBlock>
export default meta
type Story = StoryObj<typeof meta>

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
        <div className="flex w-[300px] justify-end gap-2 rounded-xl bg-card ring-1 ring-foreground/10 p-4">
          <Button variant="ghost">Cancel</Button>
          <Button>Save changes</Button>
        </div>
      }
      dontExample={
        <div className="flex w-[300px] justify-end gap-2 rounded-xl bg-card ring-1 ring-foreground/10 p-4">
          <Button>Cancel</Button>
          <Button>Save changes</Button>
        </div>
      }
    />
  ),
}
