import type { Meta, StoryObj } from '@storybook/react'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { BookOpenIcon } from 'lucide-react'

const meta = {
  title: 'UI / Empty',
  component: Empty,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Rules
Empty state component for zero-data surfaces. Always include a title, a short description, and a primary action.
The icon/illustration in \`EmptyMedia\` should be contextual to the content type.
        `,
      },
    },
  },
  argTypes: {
    className: { table: { disable: true } },
  },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
} satisfies Meta<typeof Empty>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia><BookOpenIcon className="size-8 text-ink-muted" /></EmptyMedia>
        <EmptyTitle>No courses yet</EmptyTitle>
        <EmptyDescription>You haven't created any courses. Start building your first skill deck.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Create course</Button>
        <Button variant="outline">Browse templates</Button>
      </EmptyContent>
    </Empty>
  ),
}
