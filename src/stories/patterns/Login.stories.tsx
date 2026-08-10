import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Login as LoginBlock } from '@registry/blocks/login'
import { Button } from '@/components/ui/button'
import { usage } from '@/usage/login.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Auth / Login',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Login: Story = {
  render: () => <LoginBlock />,
}

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="forgot-password-stays-secondary"
      doExample={
        <div className="flex w-[280px] flex-col gap-2">
          <Button className="w-full">Sign in</Button>
          <Button variant="link" className="w-full">
            Forgot your password?
          </Button>
        </div>
      }
      dontExample={
        <div className="flex w-[280px] flex-col gap-2">
          <Button className="w-full">Sign in</Button>
          <Button className="w-full">Forgot your password?</Button>
        </div>
      }
    />
  ),
}
