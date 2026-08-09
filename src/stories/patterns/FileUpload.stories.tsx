import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FileUpload as FileUploadBlock } from '@registry/blocks/file-upload'
import { Progress } from '@/components/ui/progress'
import { usage } from '@/usage/file-upload.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

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

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="progress-is-per-file"
      doExample={
        <ul className="flex w-[320px] flex-col gap-3" aria-label="Upload queue">
          {[
            { name: 'brand-lockups.zip', progress: 82 },
            { name: 'field-notes-issue-001.pdf', progress: 34 },
          ].map((f) => (
            <li key={f.name} className="flex flex-col gap-1">
              <span className="truncate text-sm font-medium text-foreground">{f.name}</span>
              <Progress value={f.progress} aria-label={`Uploading ${f.name}`} />
            </li>
          ))}
        </ul>
      }
      dontExample={
        <div className="flex w-[320px] flex-col gap-3">
          <ul className="flex flex-col gap-1" aria-label="Upload queue">
            {['brand-lockups.zip', 'field-notes-issue-001.pdf'].map((name) => (
              <li key={name} className="truncate text-sm font-medium text-foreground">
                {name}
              </li>
            ))}
          </ul>
          <Progress value={58} aria-label="Uploading files" />
        </div>
      }
    />
  ),
}
