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
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Icon } from '@/components/ui/icon'
import { Card, CardContent } from '@/components/ui/card'

const workspace = [
  { icon: 'space_dashboard', label: 'Overview', badge: '', active: true },
  { icon: 'ink_pen', label: 'Engagements', badge: '4', active: false },
  { icon: 'palette', label: 'Clients', badge: '', active: false },
  { icon: 'photo_library', label: 'Deliverables', badge: '12', active: false },
] as const

const team = [
  { icon: 'group', label: 'Collaborators' },
  { icon: 'settings', label: 'Settings' },
] as const

export function SidebarNav() {
  return (
    <SidebarProvider>
      <div className="flex h-[560px] w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader className="px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-medium text-primary-foreground">
                Q
              </span>
              <span className="font-heading text-sm font-medium text-foreground group-data-[collapsible=icon]:hidden">
                Quill
              </span>
            </div>
          </SidebarHeader>
          <Separator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {workspace.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton isActive={item.active} tooltip={item.label}>
                        <Icon name={item.icon as never} />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Team</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {team.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton tooltip={item.label}>
                        <Icon name={item.icon as never} />
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
              <Avatar size="sm">
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-xs font-medium text-foreground">John Doe</span>
                <span className="text-xs text-muted-foreground">Team plan</span>
              </div>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-border px-4 py-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="grid flex-1 grid-cols-3 gap-4 overflow-auto p-4 max-lg:grid-cols-1">
            {['Active engagements', 'Review queue', 'Client notes'].map((title) => (
              <Card key={title} size="sm">
                <CardContent className="flex h-32 flex-col gap-1">
                  <span className="text-sm font-medium text-foreground">{title}</span>
                  <span className="text-xs text-muted-foreground">Nothing pressing.</span>
                </CardContent>
              </Card>
            ))}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
