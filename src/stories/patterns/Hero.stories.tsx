import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Hero as HeroBlock } from '@registry/blocks/hero'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { usage } from '@/usage/hero.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Marketing / Hero',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Hero: Story = {
  render: () => <HeroBlock />,
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="one-primary-cta"
      doExample={
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button>
            Get started <Icon name="arrow_forward" size={18} />
          </Button>
          <Button variant="outline">
            <Icon name="menu_book" size={18} /> Read the docs
          </Button>
        </div>
      }
      dontExample={
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button>
            Get started <Icon name="arrow_forward" size={18} />
          </Button>
          <Button>
            <Icon name="menu_book" size={18} /> Read the docs
          </Button>
        </div>
      }
    />
  ),
}
