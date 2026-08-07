import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Wizard as WizardBlock } from '@registry/blocks/wizard'
import { usage } from '@/usage/wizard.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Forms / Wizard',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Wizard: Story = {
  render: () => <WizardBlock />,
}
