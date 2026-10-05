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
import { usage } from '@/usage/empty.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair, inColumn } from './DoDont'

// One width for the component's own stories and for each example in its Do/Don't pair.
const COLUMN = 'w-80'

const meta = {
  title: 'Components / Empty',
  component: Empty,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
  argTypes: {
    className: { table: { disable: true } },
  },
  decorators: [inColumn(COLUMN)],
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

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair exampleClassName={COLUMN}
      usage={usage}
      id="complete-empty-state"
      doExample={
        <Empty>
          <EmptyHeader>
            <EmptyMedia><Icon name="menu_book" className="size-8 text-ink-muted" /></EmptyMedia>
            <EmptyTitle>No courses yet</EmptyTitle>
            <EmptyDescription>You haven’t created any courses. Start building your first skill deck.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>Create</Button>
          </EmptyContent>
        </Empty>
      }
      dontExample={
        <Empty>
          <EmptyHeader>
            <EmptyMedia><Icon name="menu_book" className="size-8 text-ink-muted" /></EmptyMedia>
            <EmptyTitle>No courses yet</EmptyTitle>
          </EmptyHeader>
        </Empty>
      }
    />
  ),
}
