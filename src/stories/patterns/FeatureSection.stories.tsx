import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Icon, type IconName } from '@/components/ui/icon'

const meta = {
  title: 'Patterns / Marketing / Feature section',
  parameters: { layout: 'padded' },
} satisfies Meta
export default meta
type Story = StoryObj

const features: { icon: IconName; title: string; body: string }[] = [
  { icon: 'palette', title: 'Design tokens', body: 'One source of truth flows to code and Figma alike.' },
  { icon: 'dashboard', title: 'Composable', body: 'Build screens fast from accessible, themeable components.' },
  { icon: 'check_circle', title: 'Accessible', body: 'WCAG 2.1 AA out of the box, verified in CI.' },
]

export const FeatureSection: Story = {
  render: () => (
    <section className="flex flex-col items-center gap-10 bg-background py-12 text-foreground">
      <div className="flex max-w-xl flex-col items-center gap-2 text-center">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-primary">Why Quill</span>
        <h2 className="font-[family-name:var(--font-fraunces,Georgia,serif)] text-3xl">
          A calm, editorial design system
        </h2>
        <p className="text-sm text-muted-foreground">
          Everything connected to tokens, so it stays consistent as it grows.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="flex flex-col gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-primary">
              <Icon name={f.icon} size={22} />
            </div>
            <h3 className="text-lg font-medium">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  ),
}
