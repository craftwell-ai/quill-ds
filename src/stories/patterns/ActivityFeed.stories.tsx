import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ActivityFeed as ActivityFeedBlock } from '@registry/blocks/activity-feed'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { usage } from '@/usage/activity-feed.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Data / Activity feed',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const ActivityFeed: Story = {
  render: () => <ActivityFeedBlock />,
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="time-is-relative"
      doExample={
        <Card className="w-[320px]">
          <CardContent className="pt-6">
            <ol className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>AL</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm">
                    <span className="font-medium text-foreground">Ada Lovelace</span>{' '}
                    <span className="text-muted-foreground">published</span>{' '}
                    <span className="font-medium text-foreground">Field Notes · Issue № 004</span>
                  </p>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm">
                    <span className="font-medium text-foreground">John Doe</span>{' '}
                    <span className="text-muted-foreground">commented on</span>{' '}
                    <span className="font-medium text-foreground">Botanical pigment studies</span>
                  </p>
                  <span className="text-xs text-muted-foreground">Yesterday</span>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      }
      dontExample={
        <Card className="w-[320px]">
          <CardContent className="pt-6">
            <ol className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>AL</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm">
                    <span className="font-medium text-foreground">Ada Lovelace</span>{' '}
                    <span className="text-muted-foreground">published</span>{' '}
                    <span className="font-medium text-foreground">Field Notes · Issue № 004</span>
                  </p>
                  <span className="text-xs text-muted-foreground">July 12, 2026, 9:14 AM</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm">
                    <span className="font-medium text-foreground">John Doe</span>{' '}
                    <span className="text-muted-foreground">commented on</span>{' '}
                    <span className="font-medium text-foreground">Botanical pigment studies</span>
                  </p>
                  <span className="text-xs text-muted-foreground">July 11, 2026, 3:00 PM</span>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      }
    />
  ),
}
