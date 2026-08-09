import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Faq as FaqBlock } from '@registry/blocks/faq'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { usage } from '@/usage/faq.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Marketing / FAQ',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Faq: Story = {
  render: () => <FaqBlock />,
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="default-open-first-item"
      doExample={
        <Accordion defaultValue={['item-0']} className="w-[280px]">
          <AccordionItem value="item-0">
            <AccordionTrigger>Can I use Quill commercially?</AccordionTrigger>
            <AccordionContent>Yes — the theme and every pattern ship under a permissive license.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-1">
            <AccordionTrigger>How do I install the theme?</AccordionTrigger>
            <AccordionContent>One command: npx shadcn add with our registry URL.</AccordionContent>
          </AccordionItem>
        </Accordion>
      }
      dontExample={
        <Accordion className="w-[280px]">
          <AccordionItem value="item-0">
            <AccordionTrigger>Can I use Quill commercially?</AccordionTrigger>
            <AccordionContent>Yes — the theme and every pattern ship under a permissive license.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-1">
            <AccordionTrigger>How do I install the theme?</AccordionTrigger>
            <AccordionContent>One command: npx shadcn add with our registry URL.</AccordionContent>
          </AccordionItem>
        </Accordion>
      }
    />
  ),
}
