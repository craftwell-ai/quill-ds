import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuCheckboxItem,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenuShortcut,
} from '@/components/ui/context-menu'
import { usage } from '@/usage/context-menu.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
  argTypes: {},
} satisfies Meta<typeof ContextMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-24 w-64 items-center justify-center rounded-lg border border-dashed border-border text-sm text-ink-muted">
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Open<ContextMenuShortcut>⌘O</ContextMenuShortcut></ContextMenuItem>
        <ContextMenuItem>Duplicate<ContextMenuShortcut>⌘D</ContextMenuShortcut></ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Copy link</ContextMenuItem>
            <ContextMenuItem>Send via email</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
}

export const WithCheckboxItems: Story = {
  render: () => {
    const [showGrid, setShowGrid] = useState(true)
    const [showRulers, setShowRulers] = useState(false)
    const [snapToGrid, setSnapToGrid] = useState(true)

    return (
      <ContextMenu>
        <ContextMenuTrigger className="flex h-24 w-64 items-center justify-center rounded-lg border border-dashed border-border text-sm text-ink-muted">
          Right-click here
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>View options</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
            Show grid
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem checked={showRulers} onCheckedChange={setShowRulers}>
            Show rulers
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem checked={snapToGrid} onCheckedChange={setSnapToGrid}>
            Snap to grid
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  },
}

export const WithRadioItems: Story = {
  render: () => {
    const [view, setView] = useState('comfortable')

    return (
      <ContextMenu>
        <ContextMenuTrigger className="flex h-24 w-64 items-center justify-center rounded-lg border border-dashed border-border text-sm text-ink-muted">
          Right-click here
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Density</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuRadioGroup value={view} onValueChange={setView}>
            <ContextMenuRadioItem value="compact">Compact</ContextMenuRadioItem>
            <ContextMenuRadioItem value="comfortable">Comfortable</ContextMenuRadioItem>
            <ContextMenuRadioItem value="spacious">Spacious</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    )
  },
}

export const AllVariants: Story = {
  render: () => {
    const [bookmarked, setBookmarked] = useState(false)
    const [pinned, setPinned] = useState(true)
    const [sort, setSort] = useState('date')

    return (
      <ContextMenu>
        <ContextMenuTrigger className="flex h-24 w-64 items-center justify-center rounded-lg border border-dashed border-border text-sm text-ink-muted">
          Right-click here
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuLabel>File</ContextMenuLabel>
            <ContextMenuItem>Open<ContextMenuShortcut>⌘O</ContextMenuShortcut></ContextMenuItem>
            <ContextMenuItem>Rename<ContextMenuShortcut>F2</ContextMenuShortcut></ContextMenuItem>
            <ContextMenuItem>Duplicate<ContextMenuShortcut>⌘D</ContextMenuShortcut></ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuGroup>
            <ContextMenuLabel>Organize</ContextMenuLabel>
            <ContextMenuCheckboxItem checked={bookmarked} onCheckedChange={setBookmarked}>
              Bookmarked
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem checked={pinned} onCheckedChange={setPinned}>
              Pinned to top
            </ContextMenuCheckboxItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuGroup>
            <ContextMenuLabel>Sort by</ContextMenuLabel>
            <ContextMenuRadioGroup value={sort} onValueChange={setSort}>
              <ContextMenuRadioItem value="date">Date modified</ContextMenuRadioItem>
              <ContextMenuRadioItem value="name">Name</ContextMenuRadioItem>
              <ContextMenuRadioItem value="size">File size</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuSub>
            <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Copy link</ContextMenuItem>
              <ContextMenuItem>Send via email</ContextMenuItem>
              <ContextMenuItem>Export as PDF</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive">Delete<ContextMenuShortcut>⌫</ContextMenuShortcut></ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  },
}

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="trigger-needs-discoverability-hint"
      doExample={
        <ContextMenu>
          <ContextMenuTrigger className="flex h-24 w-64 items-center justify-center rounded-lg border border-dashed border-border text-sm text-ink-muted">
            Right-click here
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Open</ContextMenuItem>
            <ContextMenuItem>Duplicate</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      }
      dontExample={
        <ContextMenu>
          <ContextMenuTrigger className="flex h-24 w-64 items-center justify-center rounded-lg text-sm text-ink">
            Product card
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Open</ContextMenuItem>
            <ContextMenuItem>Duplicate</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      }
    />
  ),
}
