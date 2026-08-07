import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CommandPalette as CommandPaletteBlock } from '@registry/blocks/command-palette'
import { usage } from '@/usage/command-palette.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Nav / Command palette',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const CommandPalette: Story = {
  render: () => <CommandPaletteBlock />,
}
