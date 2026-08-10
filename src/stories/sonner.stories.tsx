'use client'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { toast } from 'sonner'
import { usage } from '@/usage/sonner.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Sonner',
  component: Toaster,
  tags: ['autodocs'],
  // No local <Toaster/> here — the global preview decorator already mounts one.
  // A second toast region trips axe's landmark-unique rule (duplicate landmarks).
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
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

// Static mocks of a fired Sonner toast — matching the real markup's box model
// (16px padding, 6px icon gap, popover surface, border, shadow-md) so the
// DoDont pair can show the icon-vs-no-icon contrast without a transient,
// click-triggered toast that DoDontPair's static render can't capture.
function MockToast({ withIcon }: { withIcon: boolean }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-popover p-4 text-[13px] text-popover-foreground shadow-md">
      {withIcon && <Icon name="check_circle" className="size-4 shrink-0" />}
      <span>Course published.</span>
    </div>
  )
}

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="typed-variant-matches-meaning"
      doExample={<MockToast withIcon />}
      dontExample={<MockToast withIcon={false} />}
    />
  ),
}
