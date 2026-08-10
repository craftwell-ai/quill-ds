import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProfileCard as ProfileCardBlock } from '@registry/blocks/profile-card'
import { usage } from '@/usage/profile-card.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Data / Profile card',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const ProfileCard: Story = {
  render: () => <ProfileCardBlock />,
}

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="stats-need-context"
      doExample={
        <div className="flex w-[320px] items-center justify-around rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col items-center">
            <span className="text-base font-medium text-foreground">24</span>
            <span className="text-xs text-muted-foreground">Projects</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-base font-medium text-foreground">1.2k</span>
            <span className="text-xs text-muted-foreground">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-base font-medium text-foreground">318</span>
            <span className="text-xs text-muted-foreground">Following</span>
          </div>
        </div>
      }
      dontExample={
        <div className="flex w-[320px] items-center justify-around rounded-lg border border-border bg-card p-4">
          <span className="text-base font-medium text-foreground">24</span>
          <span className="text-base font-medium text-foreground">1.2k</span>
          <span className="text-base font-medium text-foreground">318</span>
        </div>
      }
    />
  ),
}
