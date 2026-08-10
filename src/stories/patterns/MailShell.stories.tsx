import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MailShell as MailShellBlock } from '@registry/blocks/mail-shell'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { usage } from '@/usage/mail-shell.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Shells / Mail inbox',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const MailShell: Story = {
  render: () => <MailShellBlock />,
}

// Both examples fixed at a phone-narrow width so the difference is the pane
// count, not the width itself.
export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="reading-pane-hides-on-narrow"
      doExample={
        <div className="w-[280px] overflow-hidden rounded-md border border-border">
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <span className="text-sm font-medium text-foreground">Inbox</span>
            <Badge variant="secondary">2 unread</Badge>
          </div>
          <Separator />
          <div className="flex flex-col gap-1 border-b border-border px-3 py-2 text-left">
            <span className="text-sm font-semibold text-foreground">Ada Lovelace</span>
            <span className="text-sm font-medium text-foreground">Proofs for Issue № 004</span>
          </div>
        </div>
      }
      dontExample={
        <div className="grid w-[280px] grid-cols-2 overflow-hidden rounded-md border border-border">
          <div className="border-r border-border">
            <div className="px-2 py-2 text-xs font-medium text-foreground">Inbox</div>
            <Separator />
            <div className="border-b border-border px-2 py-2">
              <span className="text-[10px] font-semibold text-foreground">Ada Lovelace</span>
            </div>
          </div>
          <div className="p-2 text-[10px] text-muted-foreground">
            Proofs for Issue № 004 — the terracotta plate came out beautifully…
          </div>
        </div>
      }
    />
  ),
}
