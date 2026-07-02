'use client'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Icon } from '@/components/ui/icon'
import type { IconName } from '@/components/ui/icon'

const navItems: { label: string; icon: IconName; badge?: string }[] = [
  { label: 'Dashboard', icon: 'dashboard' },
  { label: 'Courses', icon: 'menu_book' },
  { label: 'Workshops', icon: 'palette' },
  { label: 'Community', icon: 'group', badge: '3' },
]

const settingsItems: { label: string; icon: IconName }[] = [
  { label: 'Account', icon: 'settings' },
  { label: 'Billing', icon: 'credit_card' },
  { label: 'Help', icon: 'help' },
]

const meta = {
  title: 'UI / Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
### Design tokens
\`--sidebar\` · \`--sidebar-foreground\` · \`--sidebar-border\`

### Rules
Always wrap in \`SidebarProvider\`. Use \`SidebarTrigger\` to toggle collapse.
\`SidebarGroup\` + \`SidebarGroupLabel\` + \`SidebarGroupContent\` creates a labelled section.
\`SidebarMenuButton\` accepts \`isActive\` for the current page and \`tooltip\` for collapsed icon mode.
\`SidebarRail\` adds a hover-to-collapse drag rail on the sidebar edge.
\`SidebarMenuBadge\` overlays a count badge on a menu item.
        `,
      },
    },
  },
  argTypes: { className: { table: { disable: true } } },
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <div className="flex h-[500px] w-full">
        <Sidebar>
          <SidebarHeader className="px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded bg-terracotta-deep flex items-center justify-center">
                <span className="text-xs font-bold text-white">Q</span>
              </div>
              <span className="font-heading font-medium text-sm text-ink">Quill</span>
            </div>
          </SidebarHeader>
          <Separator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item, i) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton isActive={i === 0} tooltip={item.label}>
                        <Icon name={item.icon} />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.badge && (
                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Settings</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {settingsItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton tooltip={item.label}>
                        <Icon name={item.icon} />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <Separator />
          <SidebarFooter className="px-4 py-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">RP</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-ink">Ryan Phillips</span>
                <span className="text-xs text-ink-muted">Free plan</span>
              </div>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <div className="flex flex-col flex-1">
          <header className="flex items-center border-b border-border px-4 py-3 gap-2">
            <SidebarTrigger />
            <span className="text-sm font-medium text-ink">Dashboard</span>
          </header>
          <main className="flex-1 p-6">
            <p className="text-sm text-ink-muted">Main content area</p>
          </main>
        </div>
      </div>
    </SidebarProvider>
  ),
}

export const CollapsedIconMode: Story = {
  render: () => (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-[500px] w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader className="px-2 py-3">
            <div className="flex items-center justify-center">
              <div className="h-7 w-7 rounded bg-terracotta-deep flex items-center justify-center">
                <span className="text-xs font-bold text-white">Q</span>
              </div>
            </div>
          </SidebarHeader>
          <Separator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item, i) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton isActive={i === 0} tooltip={item.label}>
                        <Icon name={item.icon} />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.badge && (
                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Settings</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {settingsItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton tooltip={item.label}>
                        <Icon name={item.icon} />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <div className="flex flex-col flex-1">
          <header className="flex items-center border-b border-border px-4 py-3 gap-2">
            <SidebarTrigger />
            <span className="text-sm font-medium text-ink">Dashboard</span>
          </header>
          <main className="flex-1 p-6">
            <p className="text-sm text-ink-muted">
              Sidebar is in icon-only mode. Hover icons to see tooltips. Click the trigger or the rail to expand.
            </p>
          </main>
        </div>
      </div>
    </SidebarProvider>
  ),
}

export const LoadingState: Story = {
  render: () => (
    <SidebarProvider>
      <div className="flex h-[500px] w-full">
        <Sidebar>
          <SidebarHeader className="px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded bg-terracotta-deep flex items-center justify-center">
                <span className="text-xs font-bold text-white">Q</span>
              </div>
              <span className="font-heading font-medium text-sm text-ink">Quill</span>
            </div>
          </SidebarHeader>
          <Separator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuSkeleton showIcon />
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Settings</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuSkeleton showIcon />
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <Separator />
          <SidebarFooter className="px-4 py-3">
            <SidebarMenuSkeleton showIcon />
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-col flex-1">
          <header className="flex items-center border-b border-border px-4 py-3 gap-2">
            <SidebarTrigger />
            <span className="text-sm font-medium text-ink">Loading…</span>
          </header>
          <main className="flex-1 p-6">
            <p className="text-sm text-ink-muted">Navigation items are loading.</p>
          </main>
        </div>
      </div>
    </SidebarProvider>
  ),
}

export const WithNotifications: Story = {
  render: () => (
    <SidebarProvider>
      <div className="flex h-[500px] w-full">
        <Sidebar>
          <SidebarHeader className="px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded bg-terracotta-deep flex items-center justify-center">
                <span className="text-xs font-bold text-white">Q</span>
              </div>
              <span className="font-heading font-medium text-sm text-ink">Quill</span>
            </div>
          </SidebarHeader>
          <Separator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {([
                    { label: 'Dashboard', icon: 'dashboard' as const, badge: null },
                    { label: 'Courses', icon: 'menu_book' as const, badge: null },
                    { label: 'Community', icon: 'group' as const, badge: '12' },
                    { label: 'Notifications', icon: 'notifications' as const, badge: '5' },
                  ] as const).map((item, i) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton isActive={i === 0} tooltip={item.label}>
                        <Icon name={item.icon} />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.badge && (
                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <Separator />
          <SidebarFooter className="px-4 py-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">RP</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-ink">Ryan Phillips</span>
                <span className="text-xs text-ink-muted">Free plan</span>
              </div>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <div className="flex flex-col flex-1">
          <header className="flex items-center border-b border-border px-4 py-3 gap-2">
            <SidebarTrigger />
            <span className="text-sm font-medium text-ink">Dashboard</span>
          </header>
          <main className="flex-1 p-6">
            <p className="text-sm text-ink-muted">Demonstrating badge counts on menu items.</p>
          </main>
        </div>
      </div>
    </SidebarProvider>
  ),
}
