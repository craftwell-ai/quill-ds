import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SidebarNav as SidebarNavBlock } from '@registry/blocks/sidebar-nav'
import { usage } from '@/usage/sidebar-nav.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Shells / Sidebar navigation',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const SidebarNav: Story = {
  render: () => <SidebarNavBlock />,
}
