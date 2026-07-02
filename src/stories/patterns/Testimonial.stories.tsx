import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Patterns / Marketing / Testimonial',
  parameters: { layout: 'centered' },
} satisfies Meta
export default meta
type Story = StoryObj

export const Testimonial: Story = {
  render: () => (
    <figure className="flex w-[520px] flex-col gap-6 rounded-xl border border-border bg-card p-8 text-foreground">
      <blockquote className="font-[family-name:var(--font-fraunces,Georgia,serif)] text-2xl leading-snug">
        “Quill let our team ship consistent, accessible screens in days — the token
        foundation means design and code never drift.”
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
          RP
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">Riley Park</span>
          <span className="text-sm text-muted-foreground">Head of Design, Northwind</span>
        </div>
      </figcaption>
    </figure>
  ),
}
