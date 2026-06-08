import type { Meta, StoryObj } from '@storybook/react'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
} from '@/components/ui/menubar'

const meta = {
  title: 'UI / Menubar',
  component: Menubar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
### Rules
Menubar is a desktop application-style menu strip. Use for editor toolbars or desktop app chrome.
Each \`MenubarMenu\` is one top-level item that opens its \`MenubarContent\` on click.
        `,
      },
    },
  },
  argTypes: { className: { table: { disable: true } } },
} satisfies Meta<typeof Menubar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New course<MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
          <MenubarItem>Open<MenubarShortcut>⌘O</MenubarShortcut></MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Save<MenubarShortcut>⌘S</MenubarShortcut></MenubarItem>
          <MenubarItem>Export PDF</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo<MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
          <MenubarItem>Redo<MenubarShortcut>⇧⌘Z</MenubarShortcut></MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Find</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Find in document<MenubarShortcut>⌘F</MenubarShortcut></MenubarItem>
              <MenubarItem>Find and replace<MenubarShortcut>⌘H</MenubarShortcut></MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Preview</MenubarItem>
          <MenubarItem>Full screen<MenubarShortcut>⌃⌘F</MenubarShortcut></MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
}
