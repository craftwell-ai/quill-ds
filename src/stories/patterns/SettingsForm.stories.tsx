import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Settings as SettingsBlock } from '@registry/blocks/settings'
import { usage } from '@/usage/settings.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

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
