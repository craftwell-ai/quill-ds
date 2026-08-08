import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FileUpload as FileUploadBlock } from '@registry/blocks/file-upload'
import { usage } from '@/usage/file-upload.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Forms / File upload',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const FileUpload: Story = {
  render: () => <FileUploadBlock />,
}
