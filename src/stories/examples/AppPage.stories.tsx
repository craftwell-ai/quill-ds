import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ExampleAppPage } from '@registry/examples/example-app-page'
import { exampleByName, renderExampleDocs } from '@/usage/examples.mjs'

const meta = {
  title: 'Examples / App page',
  component: ExampleAppPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: renderExampleDocs(exampleByName('example-app-page')) } },
  },
} satisfies Meta<typeof ExampleAppPage>
export default meta
type Story = StoryObj<typeof meta>

export const AppPage: Story = {}
