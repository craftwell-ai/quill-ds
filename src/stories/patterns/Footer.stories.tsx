import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Footer as FooterBlock } from '@registry/blocks/footer'
import { Separator } from '@/components/ui/separator'
import { usage } from '@/usage/footer.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Marketing / Footer',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Footer: Story = {
  render: () => <FooterBlock />,
}

// Plain <div> scaffolding here, not <nav aria-label> — that landmark
// wiring is what the group-links-by-nav-landmark rule covers above; two
// identically-labeled nav landmarks side by side would itself trip the
// a11y gate (landmark-unique), and it isn't the variable this pair tests.
export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="separate-legal-row-with-a-divider"
      doExample={
        <div className="flex w-[280px] flex-col">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Product</span>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Overview</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Components</a>
          </div>
          <Separator className="my-4" />
          <span className="text-xs text-muted-foreground">© 2026 Quill. All rights reserved.</span>
        </div>
      }
      dontExample={
        <div className="flex w-[280px] flex-col">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Product</span>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Overview</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Components</a>
          </div>
          <span className="mt-8 text-xs text-muted-foreground">© 2026 Quill. All rights reserved.</span>
        </div>
      }
    />
  ),
}
