import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

const meta = {
  title: 'Patterns / Nav / Navbar',
  parameters: { layout: 'fullscreen' },
} satisfies Meta
export default meta
type Story = StoryObj

const links = ['Product', 'Solutions', 'Pricing', 'Docs']

export const Navbar: Story = {
  render: () => (
    <nav className="flex h-14 w-full items-center gap-6 border-b border-border bg-background px-6 text-foreground">
      <span className="font-[family-name:var(--font-fraunces,Georgia,serif)] text-lg">Quill</span>
      <ul className="hidden flex-1 items-center gap-1 md:flex">
        {links.map((l) => (
          <li key={l}>
            <a
              href="#"
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {l}
            </a>
          </li>
        ))}
      </ul>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm">
          Sign in
        </Button>
        <Button size="sm">
          Get started <Icon name="arrow_forward" size={16} />
        </Button>
      </div>
    </nav>
  ),
}
