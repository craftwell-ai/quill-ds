import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Signup as SignupBlock } from '@registry/blocks/signup'
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
import { usage } from '@/usage/signup.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Auth / Sign up',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Signup: Story = {
  render: () => <SignupBlock />,
}

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="state-the-offer"
      doExample={
        <Card className="w-[300px]">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Start your 14-day free trial — no card required.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dodont-signup-do-email">Work email</Label>
              <Input id="dodont-signup-do-email" type="email" placeholder="you@company.com" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Create account</Button>
          </CardFooter>
        </Card>
      }
      dontExample={
        <Card className="w-[300px]">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dodont-signup-dont-email">Work email</Label>
              <Input id="dodont-signup-dont-email" type="email" placeholder="you@company.com" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Create account</Button>
          </CardFooter>
        </Card>
      }
    />
  ),
}
