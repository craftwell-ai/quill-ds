import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const meta = {
  title: 'Patterns / Auth / Sign up',
  parameters: { layout: 'centered' },
} satisfies Meta
export default meta
type Story = StoryObj

export const Signup: Story = {
  render: () => (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Start your 14-day free trial — no card required.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="su-name">Full name</Label>
          <Input id="su-name" placeholder="Ada Lovelace" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="su-email">Work email</Label>
          <Input id="su-email" type="email" placeholder="you@company.com" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="su-password">Password</Label>
          <Input id="su-password" type="password" placeholder="At least 8 characters" />
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button className="w-full">Create account</Button>
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <a href="#" className="text-primary underline underline-offset-4">
            Sign in
          </a>
        </p>
      </CardFooter>
    </Card>
  ),
}
