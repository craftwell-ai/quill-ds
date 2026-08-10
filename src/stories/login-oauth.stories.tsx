import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LoginOauth } from '../../registry/blocks/login-oauth'
import { Button } from '@/components/ui/button'
import { usage } from '@/usage/login-oauth.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Blocks / Login with OAuth',
  component: LoginOauth,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta<typeof LoginOauth>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="providers-are-primary"
      doExample={
        <div className="flex w-[240px] flex-col gap-2">
          <Button variant="outline" className="w-full justify-center">
            Continue with Google
          </Button>
          <Button variant="outline" className="w-full justify-center">
            Continue with GitHub
          </Button>
          <Button variant="outline" className="w-full justify-center">
            Continue with Apple
          </Button>
          <Button variant="link" className="h-auto w-full justify-center p-1 text-xs">
            or continue with email
          </Button>
        </div>
      }
      dontExample={
        <div className="flex w-[240px] flex-col gap-2">
          <Button className="w-full justify-center">Continue with Google</Button>
          <Button className="w-full justify-center">Continue with GitHub</Button>
          <Button className="w-full justify-center">Continue with Apple</Button>
          <Button className="w-full justify-center">Continue with email</Button>
        </div>
      }
    />
  ),
}
