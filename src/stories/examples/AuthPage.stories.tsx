import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ExampleAuthPage } from '@registry/examples/example-auth-page'
import { exampleByName, renderExampleDocs } from '@/usage/examples.mjs'

const meta = {
  title: 'Examples / Auth page',
  component: ExampleAuthPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: renderExampleDocs(exampleByName('example-auth-page')) } },
  },
} satisfies Meta<typeof ExampleAuthPage>
export default meta
type Story = StoryObj<typeof meta>

export const AuthPage: Story = {}
