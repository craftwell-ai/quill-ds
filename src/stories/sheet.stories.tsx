import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usage } from '@/usage/sheet.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Sheet',
  component: Sheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
  argTypes: {},
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline">Open Settings</Button>} />
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Account Settings</SheetTitle>
          <SheetDescription>Update your profile details below.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" defaultValue="John Doe" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="john@example.com" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose render={<Button variant="outline" className="w-full" />}>Cancel</SheetClose>
          <Button className="w-full">Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

export const LeftSide: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline">Open Navigation</Button>} />
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Browse course categories.</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4 py-4">
          {['Dashboard', 'Courses', 'Workshops', 'Community', 'Settings'].map((item) => (
            <SheetClose key={item} render={<button className="rounded-md px-3 py-2 text-sm text-left text-ink-soft hover:bg-paper-deep hover:text-ink transition-colors" />}>{item}</SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  ),
}

export const BottomSheet: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline">Share Course</Button>} />
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Share</SheetTitle>
          <SheetDescription>Choose how to share this course.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-2 py-4">
          {['Copy link', 'Share to email', 'Share to social'].map((action) => (
            <SheetClose key={action} render={<Button variant="outline" className="w-full justify-start" />}>{action}</SheetClose>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  ),
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="descriptive-trigger-label"
      doExample={
        <Sheet>
          <SheetTrigger render={<Button variant="outline">Open Settings</Button>} />
        </Sheet>
      }
      dontExample={
        <Sheet>
          <SheetTrigger render={<Button variant="outline">Open</Button>} />
        </Sheet>
      }
    />
  ),
}
