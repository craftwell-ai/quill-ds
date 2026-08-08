import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TabsPage as TabsPageBlock } from '@registry/blocks/tabs-page'
import { usage } from '@/usage/tabs-page.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Shells / Tabs page',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const TabsPage: Story = {
  render: () => <TabsPageBlock />,
}
