import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Newsletter as NewsletterBlock } from '@registry/blocks/newsletter'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { usage } from '@/usage/newsletter.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Forms / Newsletter signup',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Newsletter: Story = {
  render: () => <NewsletterBlock />,
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="state-the-no-spam-promise"
      doExample={
        <div className="flex w-[320px] flex-col items-center gap-3 rounded-xl bg-card p-6 text-center ring-1 ring-foreground/10">
          <h3 className="font-heading text-lg text-foreground">The Field Notes</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            One letter a month on design systems, drawn by hand. No spam, no noise — unsubscribe
            any time.
          </p>
          <div className="flex w-full gap-2">
            <Label htmlFor="dodont-newsletter-do-email" className="sr-only">
              Email address
            </Label>
            <Input id="dodont-newsletter-do-email" type="email" placeholder="you@example.com" />
            <Button type="submit">Subscribe</Button>
          </div>
        </div>
      }
      dontExample={
        <div className="flex w-[320px] flex-col items-center gap-3 rounded-xl bg-card p-6 text-center ring-1 ring-foreground/10">
          <h3 className="font-heading text-lg text-foreground">The Field Notes</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            One letter a month on design systems, drawn by hand.
          </p>
          <div className="flex w-full gap-2">
            <Label htmlFor="dodont-newsletter-dont-email" className="sr-only">
              Email address
            </Label>
            <Input id="dodont-newsletter-dont-email" type="email" placeholder="you@example.com" />
            <Button type="submit">Subscribe</Button>
          </div>
        </div>
      }
    />
  ),
}
