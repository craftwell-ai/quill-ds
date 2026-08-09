import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { usage } from '@/usage/drawer.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
  argTypes: {},
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filter courses</DrawerTitle>
          <DrawerDescription>Narrow results by category, level, and duration.</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 py-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Category</Label>
            <Input id="category" placeholder="e.g. Design, Engineering" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="level">Level</Label>
            <Input id="level" placeholder="e.g. Beginner, Intermediate" />
          </div>
        </div>
        <DrawerFooter>
          <Button className="w-full">Apply filters</Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">Reset</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}

export const SideDrawer: Story = {
  render: () => (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline">Open side panel</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Course details</DrawerTitle>
          <DrawerDescription>Review and update the selected course information.</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 py-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="course-title">Course title</Label>
            <Input id="course-title" placeholder="Introduction to Typography" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="instructor">Instructor</Label>
            <Input id="instructor" placeholder="Jane Smith" />
          </div>
        </div>
        <DrawerFooter>
          <Button className="w-full">Save changes</Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="label-matches-direction"
      doExample={
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button variant="outline">Open side panel</Button>
          </DrawerTrigger>
        </Drawer>
      }
      dontExample={
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button variant="outline">Open drawer</Button>
          </DrawerTrigger>
        </Drawer>
      }
    />
  ),
}
