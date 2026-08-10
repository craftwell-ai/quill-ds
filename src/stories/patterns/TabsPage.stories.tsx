import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TabsPage as TabsPageBlock } from '@registry/blocks/tabs-page'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usage } from '@/usage/tabs-page.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Shells / Tabs page',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const TabsPage: Story = {
  render: () => <TabsPageBlock />,
}

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="trigger-value-matches-content"
      doExample={
        <div className="w-64">
          <Tabs defaultValue="account">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <p className="pt-2 text-sm text-muted-foreground">Update your account details.</p>
            </TabsContent>
            <TabsContent value="notifications">
              <p className="pt-2 text-sm text-muted-foreground">Choose what you hear about.</p>
            </TabsContent>
          </Tabs>
        </div>
      }
      dontExample={
        <div className="w-64">
          <Tabs defaultValue="notifications">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <p className="pt-2 text-sm text-muted-foreground">Update your account details.</p>
            </TabsContent>
            <TabsContent value="alerts">
              <p className="pt-2 text-sm text-muted-foreground">Choose what you hear about.</p>
            </TabsContent>
          </Tabs>
        </div>
      }
    />
  ),
}
