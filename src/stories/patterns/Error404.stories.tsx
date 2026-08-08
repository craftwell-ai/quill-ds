import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Error404 as Error404Block } from '@registry/blocks/error-404'
import { usage } from '@/usage/error-404.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / State / Error 404',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Error404: Story = {
  render: () => <Error404Block />,
}
