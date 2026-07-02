import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'

const meta = {
  title: 'Patterns / Data / Profile card',
  parameters: { layout: 'centered' },
} satisfies Meta
export default meta
type Story = StoryObj

export const ProfileCard: Story = {
  render: () => (
    <Card className="w-[340px]">
      <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted text-xl font-medium text-muted-foreground">
          AL
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-medium text-foreground">Ada Lovelace</span>
          <span className="text-sm text-muted-foreground">Principal Engineer</span>
          <Badge variant="secondary">Pro</Badge>
        </div>
        <div className="flex w-full items-center justify-around pt-2">
          {[
            { label: 'Projects', value: '24' },
            { label: 'Followers', value: '1.2k' },
            { label: 'Following', value: '318' },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <span className="text-base font-medium text-foreground">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="gap-2 pt-4">
        <Button className="flex-1">
          <Icon name="add" size={16} /> Follow
        </Button>
        <Button variant="outline" className="flex-1">
          <Icon name="mail" size={16} /> Message
        </Button>
      </CardFooter>
    </Card>
  ),
}
