import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

const meta = {
  title: 'Patterns / Shells / Page header',
  parameters: { layout: 'padded' },
} satisfies Meta
export default meta
type Story = StoryObj

export const PageHeader: Story = {
  render: () => (
    <div className="flex flex-col gap-3 text-foreground">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Acme site</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-medium">Project settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage configuration, members, and integrations for this project.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Icon name="content_copy" size={16} /> Duplicate
          </Button>
          <Button>
            <Icon name="add" size={16} /> New
          </Button>
        </div>
      </div>
    </div>
  ),
}
