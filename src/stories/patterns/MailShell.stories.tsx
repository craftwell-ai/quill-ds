import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MailShell as MailShellBlock } from '@registry/blocks/mail-shell'
import { usage } from '@/usage/mail-shell.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Shells / Mail inbox',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const MailShell: Story = {
  render: () => <MailShellBlock />,
}
