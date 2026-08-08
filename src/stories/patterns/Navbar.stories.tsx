import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Navbar as NavbarBlock } from '@registry/blocks/navbar'
import { usage } from '@/usage/navbar.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Nav / Navbar',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Navbar: Story = {
  render: () => <NavbarBlock />,
}
