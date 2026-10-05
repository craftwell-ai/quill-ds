import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { expectFocusRing } from './focus-ring'
import { AiNotice } from '../../registry/lib/ai-notice'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usage } from '@/usage/ai-notice.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / AiNotice',
  component: AiNotice,
  tags: ['autodocs'],
  parameters: { layout: 'centered', docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof AiNotice>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/can make mistakes/)).toBeVisible()
  },
}
export const WithLink: Story = {
  args: { link: { href: '#how-we-use-ai', label: 'How we use AI' } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'How we use AI' })).toHaveAttribute('href', '#how-we-use-ai')
  },
}
export const LinkShowsFocusRing: Story = {
  args: { link: { href: '#how-we-use-ai', label: 'How we use AI' } },
  play: async ({ canvas }) => {
    await expectFocusRing(canvas.getByRole('link', { name: 'How we use AI' }))
  },
}
export const DoDont: Story = {
  render: () => (
    <DoDontPair usage={usage} id="quiet-line-not-banner"
      doExample={<AiNotice />}
      dontExample={<Alert><AlertDescription>The assistant can make mistakes. Check important details.</AlertDescription></Alert>} />
  ),
}
