import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent } from 'storybook/test'
import { AiChat } from '@registry/blocks/ai-chat'
import { usage } from '@/usage/ai-chat.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / AI / AI Chat',
  component: AiChat,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: renderUsageDocs(usage) } } },
  args: { onSubmit: fn() },
} satisfies Meta<typeof AiChat>

export default meta
type Story = StoryObj<typeof meta>

// The test runner sizes its page from these (addon-vitest reads the viewport global).
const VIEWPORTS = {
  desktop: { name: 'Desktop 1024', styles: { width: '1024px', height: '800px' }, type: 'desktop' },
  phone: { name: 'Phone 375', styles: { width: '375px', height: '812px' }, type: 'mobile' },
} as const

export const Default: Story = {
  parameters: { viewport: { options: VIEWPORTS } },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('navigation', { name: 'Chats' })).toBeVisible()
    await expect(canvas.getByRole('region', { name: 'Conversation' })).toHaveTextContent('4% ahead')
    await expect(canvas.getByRole('button', { name: 'Q3 deck, source: Q3 board deck.pdf' })).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Compare with Q2' }))
    const box = canvas.getByRole('textbox', { name: 'Message' })
    await expect(box).toHaveValue('Compare with Q2')
    await userEvent.keyboard('{Enter}')
    await expect(args.onSubmit).toHaveBeenCalledWith('Compare with Q2')
    await expect(canvas.getAllByRole('status').at(-1)).toHaveTextContent('Thinking')
    await userEvent.click(canvas.getByRole('button', { name: 'Stop' }))
    await expect(canvas.getByText('You stopped this answer.')).toBeVisible()
  },
}

export const Phone: Story = {
  parameters: { viewport: { options: VIEWPORTS } },
  globals: { viewport: { value: 'phone', isRotated: false } },
  play: async ({ canvas, canvasElement }) => {
    // A display:none nav has no accessible name, so role queries cannot find it; select it by its label.
    await expect(canvasElement.querySelector('nav[aria-label="Chats"]')).not.toBeVisible()
    await expect(canvas.getByRole('region', { name: 'Conversation' })).toBeVisible()
    await expect(window.innerWidth).toBeLessThanOrEqual(375)
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth)
  },
}
