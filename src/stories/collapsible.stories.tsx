'use client'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { useState } from 'react'

const meta = {
  title: 'UI / Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Rules
Collapsible is a lower-level primitive than Accordion — use it when you need a single toggle
without the item/trigger/content structure. Pair with a chevron icon that rotates on open.
        `,
      },
    },
  },
  argTypes: {
    open: { control: 'boolean', description: 'Controlled open state' },
    defaultOpen: { control: 'boolean', description: 'Initial open state' },
    className: { table: { disable: true } },
  },
  decorators: [(Story) => <div className="w-72"><Story /></div>],
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink">Repositories (3)</span>
          <CollapsibleTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Toggle repositories" />}>
            <Icon name="keyboard_arrow_down" className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="mt-2 space-y-1">
          <div className="text-sm text-ink-soft px-2 py-1.5 rounded-md bg-paper-deep">quill-ds</div>
          <div className="text-sm text-ink-soft px-2 py-1.5 rounded-md bg-paper-deep">quill-docs</div>
          <div className="text-sm text-ink-soft px-2 py-1.5 rounded-md bg-paper-deep">quill-api</div>
        </CollapsibleContent>
      </Collapsible>
    )
  },
}

export const DefaultOpen: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink">Repositories (3)</span>
          <CollapsibleTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Toggle repositories" />}>
            <Icon name="keyboard_arrow_down" className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="mt-2 space-y-1">
          <div className="text-sm text-ink-soft px-2 py-1.5 rounded-md bg-paper-deep">quill-ds</div>
          <div className="text-sm text-ink-soft px-2 py-1.5 rounded-md bg-paper-deep">quill-docs</div>
          <div className="text-sm text-ink-soft px-2 py-1.5 rounded-md bg-paper-deep">quill-api</div>
        </CollapsibleContent>
      </Collapsible>
    )
  },
}
