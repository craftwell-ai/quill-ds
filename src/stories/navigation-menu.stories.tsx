import type { Meta, StoryObj } from '@storybook/react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'

const meta = {
  title: 'UI / NavigationMenu',
  component: NavigationMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
### Rules
NavigationMenu is for top-level site navigation with mega-dropdown panels.
Use \`NavigationMenuTrigger\` + \`NavigationMenuContent\` for dropdowns; use a plain \`NavigationMenuLink\` for direct links.
        `,
      },
    },
  },
  argTypes: { className: { table: { disable: true } } },
} satisfies Meta<typeof NavigationMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Courses</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid grid-cols-2 gap-3 p-4 w-96">
              <NavigationMenuLink href="#" className="block rounded-lg p-3 hover:bg-paper-deep">
                <div className="text-sm font-medium text-ink mb-1">Browse all</div>
                <div className="text-xs text-ink-muted">Explore every skill deck</div>
              </NavigationMenuLink>
              <NavigationMenuLink href="#" className="block rounded-lg p-3 hover:bg-paper-deep">
                <div className="text-sm font-medium text-ink mb-1">New releases</div>
                <div className="text-xs text-ink-muted">Recently published courses</div>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" className="text-sm font-medium text-ink-soft hover:text-ink px-3 py-2">
            Community
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" className="text-sm font-medium text-ink-soft hover:text-ink px-3 py-2">
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
}
