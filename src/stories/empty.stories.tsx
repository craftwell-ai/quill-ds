import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

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
        <EmptyMedia><Icon name="menu_book" className="size-8 text-ink-muted" /></EmptyMedia>
        <EmptyTitle>No courses yet</EmptyTitle>
        <EmptyDescription>You haven’t created any courses. Start building your first skill deck.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button className="w-full">Create course</Button>
        <Button variant="outline" className="w-full">Browse templates</Button>
      </EmptyContent>
    </Empty>
  ),
}

export const IconVariant: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon"><Icon name="folder_open" /></EmptyMedia>
        <EmptyTitle>No files uploaded</EmptyTitle>
        <EmptyDescription>Upload your first file to get started. Supported formats include PDF, DOCX, and MP4.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button className="w-full">Upload file</Button>
        <Button variant="outline" className="w-full">Learn more</Button>
      </EmptyContent>
    </Empty>
  ),
}
