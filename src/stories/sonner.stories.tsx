'use client'
import type { Meta, StoryObj } from '@storybook/react'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const meta = {
  title: 'UI / Sonner',
  component: Toaster,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Design tokens
\`--popover\` · \`--popover-foreground\` · \`--border\` · \`--radius\`

### Rules
Add a single \`<Toaster />\` at your app root. Trigger toasts with the \`toast()\` function from \`sonner\`.
Use typed variants (\`toast.success\`, \`toast.error\`, etc.) for semantic meaning.
        `,
      },
    },
  },
  argTypes: { className: { table: { disable: true } } },
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast('Course saved successfully.')}>
      Show toast
    </Button>
  ),
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => toast('Course saved.')}>Default</Button>
      <Button variant="outline" onClick={() => toast.success('Published!')}>Success</Button>
      <Button variant="outline" onClick={() => toast.info('New workshop available.')}>Info</Button>
      <Button variant="outline" onClick={() => toast.warning('Draft not saved.')}>Warning</Button>
      <Button variant="outline" onClick={() => toast.error('Upload failed.')}>Error</Button>
      <Button variant="outline" onClick={() => toast.loading('Uploading…')}>Loading</Button>
    </div>
  ),
}

export const WithAction: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast('Course deleted.', {
          action: {
            label: 'Undo',
            onClick: () => toast.success('Restored!'),
          },
        })
      }
    >
      Delete with undo
    </Button>
  ),
}
