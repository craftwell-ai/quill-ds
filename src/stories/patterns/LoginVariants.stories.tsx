import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SplitPanel as SplitPanelBlock } from '@registry/blocks/login-split-panel'
import { Minimal as MinimalBlock } from '@registry/blocks/login-minimal'
import { usage as splitPanelUsage } from '@/usage/login-split-panel.usage.mjs'
import { usage as minimalUsage } from '@/usage/login-minimal.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Auth / Login variants',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta
export default meta
type Story = StoryObj

/** Official blocks: login with a brand side panel. */
export const SplitPanel: Story = {
  parameters: {
    docs: { description: { story: renderUsageDocs(splitPanelUsage) } },
  },
  render: () => <SplitPanelBlock />,
}

/** Official blocks: bare, centered login — no card chrome. */
export const Minimal: Story = {
  parameters: {
    layout: 'centered',
    docs: { description: { story: renderUsageDocs(minimalUsage) } },
  },
  render: () => <MinimalBlock />,
}
