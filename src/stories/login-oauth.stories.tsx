import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LoginOauth } from '../../registry/blocks/login-oauth'
import { usage } from '@/usage/login-oauth.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Blocks / Login with OAuth',
  component: LoginOauth,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta<typeof LoginOauth>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
