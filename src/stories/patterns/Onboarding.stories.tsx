import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Onboarding as OnboardingBlock } from '@registry/blocks/onboarding'
import { usage } from '@/usage/onboarding.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

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

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="show-progress-as-a-fraction-and-a-bar"
      doExample={
        <div className="flex w-64 flex-col gap-1.5 rounded-xl border border-border bg-card p-4">
          <span className="text-sm text-muted-foreground">2 of 4 complete</span>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 rounded-full bg-primary" />
          </div>
        </div>
      }
      dontExample={
        <div className="flex w-64 flex-col gap-1.5 rounded-xl border border-border bg-card p-4">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 rounded-full bg-primary" />
          </div>
        </div>
      }
    />
  ),
}
