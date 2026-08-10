import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ContactForm as ContactFormBlock } from '@registry/blocks/contact-form'
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
import { usage } from '@/usage/contact-form.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Forms / Contact form',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const ContactForm: Story = {
  render: () => <ContactFormBlock />,
}

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="set-response-expectations"
      doExample={
        <Card className="w-[300px]">
          <CardHeader>
            <CardTitle>Get in touch</CardTitle>
            <CardDescription>We usually reply within one working day.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5">
            <Label htmlFor="dodont-contactform-do-email">Email</Label>
            <Input id="dodont-contactform-do-email" type="email" placeholder="you@example.com" />
          </CardContent>
          <CardFooter>
            <Button className="w-full">Send message</Button>
          </CardFooter>
        </Card>
      }
      dontExample={
        <Card className="w-[300px]">
          <CardHeader>
            <CardTitle>Get in touch</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5">
            <Label htmlFor="dodont-contactform-dont-email">Email</Label>
            <Input id="dodont-contactform-dont-email" type="email" placeholder="you@example.com" />
          </CardContent>
          <CardFooter>
            <Button className="w-full">Send message</Button>
          </CardFooter>
        </Card>
      }
    />
  ),
}
