import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Testimonial as TestimonialBlock } from '@registry/blocks/testimonial'
import { usage } from '@/usage/testimonial.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Marketing / Testimonial',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Testimonial: Story = {
  render: () => <TestimonialBlock />,
}

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="attribute-every-quote"
      doExample={
        <figure className="flex w-[280px] flex-col gap-4 rounded-xl border border-border bg-card p-5 text-foreground">
          <blockquote className="font-[family-name:var(--font-fraunces,Georgia,serif)] text-base leading-snug">
            “Quill let our team ship consistent, accessible screens in days.”
          </blockquote>
          <figcaption className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
              RP
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Riley Park</span>
              <span className="text-xs text-muted-foreground">Head of Design, Northwind</span>
            </div>
          </figcaption>
        </figure>
      }
      dontExample={
        <figure className="flex w-[280px] flex-col gap-4 rounded-xl border border-border bg-card p-5 text-foreground">
          <blockquote className="font-[family-name:var(--font-fraunces,Georgia,serif)] text-base leading-snug">
            “Quill let our team ship consistent, accessible screens in days.”
          </blockquote>
        </figure>
      }
    />
  ),
}
