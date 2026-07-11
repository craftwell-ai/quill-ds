import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

const faqs = [
  {
    q: 'Can I use Quill in a commercial project?',
    a: 'Yes. The theme, tokens, and every pattern ship under a permissive license — attribution is appreciated, never required.',
  },
  {
    q: 'How do I install the theme?',
    a: 'One command: npx shadcn add with our registry URL. Tokens, dark mode, and typography come wired together.',
  },
  {
    q: 'Does dark mode come for free?',
    a: 'Every token has a dusk counterpart, so components and patterns flip automatically when data-theme is set to dark.',
  },
  {
    q: 'What about accessibility?',
    a: 'The system targets WCAG 2.1 AA. Every Storybook story runs an enforced axe audit, and contrast decisions are documented in the foundations.',
  },
]

const meta = {
  title: 'Patterns / Marketing / FAQ',
  parameters: { layout: 'centered' },
} satisfies Meta
export default meta
type Story = StoryObj

export const Faq: Story = {
  render: () => (
    <section className="flex w-[560px] flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-xs font-medium tracking-[0.15em] uppercase text-ink-muted">FAQ</span>
        <h2 className="font-heading text-2xl text-foreground">Common questions</h2>
        <p className="text-sm text-muted-foreground">
          Everything else lives in the docs — or ask us directly.
        </p>
      </div>
      <Accordion defaultValue={['item-0']} className="w-full">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger>{f.q}</AccordionTrigger>
            <AccordionContent>{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="flex items-center justify-center gap-3 rounded-lg bg-card p-4 ring-1 ring-foreground/10">
        <span className="text-sm text-muted-foreground">Still curious?</span>
        <Button variant="outline" size="sm">
          Talk to the studio
        </Button>
      </div>
    </section>
  ),
}
