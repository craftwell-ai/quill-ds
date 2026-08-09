import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SignupSocial as SignupSocialBlock } from '@registry/blocks/signup-social'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { usage } from '@/usage/signup-social.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Auth / Signup — social first',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const SignupSocial: Story = {
  render: () => <SignupSocialBlock />,
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="providers-lead-fallback-follows"
      doExample={
        <div className="flex w-[260px] flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full">
              Continue with GitHub
            </Button>
            <Button variant="outline" className="w-full">
              Continue with Google
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or with email</span>
            <Separator className="flex-1" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dodont-signupsocial-do-email">Email</Label>
            <Input id="dodont-signupsocial-do-email" type="email" placeholder="you@example.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dodont-signupsocial-do-password">Password</Label>
            <Input
              id="dodont-signupsocial-do-password"
              type="password"
              placeholder="At least 12 characters"
            />
          </div>
        </div>
      }
      dontExample={
        <div className="flex w-[260px] flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dodont-signupsocial-dont-email">Email</Label>
            <Input id="dodont-signupsocial-dont-email" type="email" placeholder="you@example.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dodont-signupsocial-dont-password">Password</Label>
            <Input
              id="dodont-signupsocial-dont-password"
              type="password"
              placeholder="At least 12 characters"
            />
          </div>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full">
              Continue with GitHub
            </Button>
            <Button variant="outline" className="w-full">
              Continue with Google
            </Button>
          </div>
        </div>
      }
    />
  ),
}
