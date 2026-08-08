import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CookieConsent as CookieConsentBlock } from '@registry/blocks/cookie-consent'
import { usage } from '@/usage/cookie-consent.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / State / Cookie consent',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const CookieConsent: Story = {
  render: () => <CookieConsentBlock />,
}
