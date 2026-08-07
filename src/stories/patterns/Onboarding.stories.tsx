import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Onboarding as OnboardingBlock } from '@registry/blocks/onboarding'
import { usage } from '@/usage/onboarding.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / State / Onboarding checklist',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Onboarding: Story = {
  render: () => <OnboardingBlock />,
}
