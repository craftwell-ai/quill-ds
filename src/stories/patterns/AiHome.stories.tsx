import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent } from 'storybook/test'
import { AiHome } from '@registry/blocks/ai-home'
import { usage } from '@/usage/ai-home.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / AI / AI Home',
  component: AiHome,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: renderUsageDocs(usage) } } },
  args: { onSubmit: fn() },
} satisfies Meta<typeof AiHome>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'What should we work on?' })).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: /Plan my week/ }))
    await expect(canvas.getByRole('textbox', { name: 'Message' })).toHaveValue('Plan my week around my meetings')
  },
}
