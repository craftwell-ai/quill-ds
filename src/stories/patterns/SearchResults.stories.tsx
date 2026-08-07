import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SearchResults as SearchResultsBlock } from '@registry/blocks/search-results'
import { usage } from '@/usage/search-results.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Data / Search results',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const SearchResults: Story = {
  render: () => <SearchResultsBlock />,
}
