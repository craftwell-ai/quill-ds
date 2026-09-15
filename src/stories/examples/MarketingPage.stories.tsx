import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ExampleMarketingPage } from '@registry/examples/example-marketing-page'
import { exampleByName, renderExampleDocs } from '@/usage/examples.mjs'

const meta = {
  title: 'Examples / Marketing page',
  component: ExampleMarketingPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: renderExampleDocs(exampleByName('example-marketing-page')) } },
  },
} satisfies Meta<typeof ExampleMarketingPage>
export default meta
type Story = StoryObj<typeof meta>

export const MarketingPage: Story = {}
