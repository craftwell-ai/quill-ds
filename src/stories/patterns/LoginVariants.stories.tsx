import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SplitPanel as SplitPanelBlock } from '@registry/blocks/login-split-panel'
import { Minimal as MinimalBlock } from '@registry/blocks/login-minimal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { usage as splitPanelUsage } from '@/usage/login-split-panel.usage.mjs'
import { usage as minimalUsage } from '@/usage/login-minimal.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Auth / Login variants',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta
export default meta
type Story = StoryObj

/** Official blocks: login with a brand side panel. */
export const SplitPanel: Story = {
  parameters: {
    docs: { description: { story: renderUsageDocs(splitPanelUsage) } },
  },
  render: () => <SplitPanelBlock />,
}

export const SplitPanelDoDont: Story = {
  parameters: { layout: 'centered', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={splitPanelUsage}
      id="panel-collapses-on-mobile"
      doExample={
        <div className="w-[280px]">
          <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-1 text-center">
              <h3 className="font-heading text-base text-foreground">Welcome back</h3>
              <p className="text-xs text-muted-foreground">Sign in to your studio account.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dodont-split-do-email">Email</Label>
              <Input id="dodont-split-do-email" type="email" placeholder="you@example.com" />
            </div>
            <Button className="w-full">Sign in</Button>
          </form>
        </div>
      }
      dontExample={
        <div className="grid w-[280px] grid-cols-2 gap-2 overflow-hidden rounded-md border">
          <div className="flex flex-col justify-between bg-primary p-2 text-primary-foreground">
            <span className="font-heading text-[10px]">Quill</span>
            <p className="text-[9px] leading-tight opacity-80">
              &ldquo;The most crafted-feeling system we&rsquo;ve shipped on.&rdquo;
            </p>
          </div>
          <form className="flex flex-col gap-1.5 p-2" onSubmit={(e) => e.preventDefault()}>
            <Label htmlFor="dodont-split-dont-email" className="text-[9px]">
              Email
            </Label>
            <Input
              id="dodont-split-dont-email"
              type="email"
              placeholder="you@example.com"
              className="h-6 text-[9px]"
            />
            <Button className="h-6 w-full text-[9px]">Sign in</Button>
          </form>
        </div>
      }
    />
  ),
}

/** Official blocks: bare, centered login — no card chrome. */
export const Minimal: Story = {
  parameters: {
    layout: 'centered',
    docs: { description: { story: renderUsageDocs(minimalUsage) } },
  },
  render: () => <MinimalBlock />,
}

export const MinimalDoDont: Story = {
  parameters: { layout: 'centered', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={minimalUsage}
      id="no-card-chrome"
      doExample={
        <div className="w-[280px] rounded-xl border bg-card p-6 shadow-sm">
          <form className="flex flex-col items-center gap-4" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground">
                Q
              </span>
              <h3 className="font-heading text-lg text-foreground">Sign in to Quill</h3>
            </div>
            <div className="flex w-full flex-col gap-1.5">
              <Label htmlFor="dodont-minimal-do-email">Email</Label>
              <Input id="dodont-minimal-do-email" type="email" placeholder="you@example.com" />
            </div>
            <Button className="w-full">Continue</Button>
          </form>
        </div>
      }
      dontExample={
        <div className="relative isolate flex h-[320px] w-[320px] items-center justify-center overflow-hidden rounded-md">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 grid grid-cols-5 grid-rows-5 gap-1 p-1"
          >
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className={
                  i % 3 === 0 ? 'rounded bg-primary/50' : i % 3 === 1 ? 'rounded bg-accent/60' : 'rounded bg-muted'
                }
              />
            ))}
          </div>
          <form className="flex w-[220px] flex-col items-center gap-4" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground">
                Q
              </span>
              <h3 className="font-heading text-lg text-foreground">Sign in to Quill</h3>
            </div>
            <div className="flex w-full flex-col gap-1.5">
              <Label htmlFor="dodont-minimal-dont-email">Email</Label>
              <Input id="dodont-minimal-dont-email" type="email" placeholder="you@example.com" />
            </div>
            <Button className="w-full">Continue</Button>
          </form>
        </div>
      }
    />
  ),
}
