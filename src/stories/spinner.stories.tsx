import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Spinner } from '@/components/ui/spinner'
import { usage } from '@/usage/spinner.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
  argTypes: { className: { table: { disable: true } } },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-2 text-sm text-ink-soft">
      <Spinner className="size-4" />
      <span>Saving changes…</span>
    </div>
  ),
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6 items-start">
      <div>
        <p className="text-xs text-ink-muted mb-3">Sizes</p>
        <div className="flex items-center gap-4">
          <Spinner className="size-3" />
          <Spinner className="size-4" />
          <Spinner className="size-6" />
          <Spinner className="size-8" />
        </div>
      </div>
      <div>
        <p className="text-xs text-ink-muted mb-3">Colors</p>
        <div className="flex items-center gap-4">
          <Spinner className="text-ink" />
          <Spinner className="text-ink-muted" />
          <Spinner className="text-primary" />
          <Spinner className="text-destructive" />
        </div>
      </div>
      <div>
        <p className="text-xs text-ink-muted mb-3">In context</p>
        <div className="flex items-center gap-2 text-sm text-ink-soft">
          <Spinner className="size-4" />
          <span>Saving changes…</span>
        </div>
      </div>
    </div>
  ),
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="pair-with-context-text"
      doExample={
        <div className="flex items-center gap-2 text-sm text-ink-soft">
          <Spinner className="size-4" />
          <span>Saving changes…</span>
        </div>
      }
      dontExample={
        <div className="flex items-center gap-2 text-sm text-ink-soft">
          <Spinner className="size-4" />
        </div>
      }
    />
  ),
}
