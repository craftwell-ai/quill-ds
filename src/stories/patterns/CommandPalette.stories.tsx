import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CommandPalette as CommandPaletteBlock } from '@registry/blocks/command-palette'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Icon } from '@/components/ui/icon'
import { usage } from '@/usage/command-palette.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Nav / Command palette',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const CommandPalette: Story = {
  render: () => <CommandPaletteBlock />,
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="group-by-recency-and-type"
      doExample={
        <Command className="w-72 rounded-xl border border-border shadow-md">
          <CommandInput placeholder="Type a command or search…" />
          <CommandList>
            <CommandGroup heading="Actions">
              <CommandItem>
                <Icon name="add" size={16} />
                <span>New project</span>
              </CommandItem>
              <CommandItem>
                <Icon name="search" size={16} />
                <span>Search docs</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Recent">
              <CommandItem>
                <Icon name="folder_open" size={16} />
                <span>Acme site</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      }
      dontExample={
        <Command className="w-72 rounded-xl border border-border shadow-md">
          <CommandInput placeholder="Type a command or search…" />
          <CommandList>
            <CommandGroup>
              <CommandItem>
                <Icon name="add" size={16} />
                <span>New project</span>
              </CommandItem>
              <CommandItem>
                <Icon name="search" size={16} />
                <span>Search docs</span>
              </CommandItem>
              <CommandItem>
                <Icon name="folder_open" size={16} />
                <span>Acme site</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      }
    />
  ),
}
