import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

const meta = {
  title: 'Patterns / State / Error 404',
  parameters: { layout: 'fullscreen' },
} satisfies Meta
export default meta
type Story = StoryObj

export const Error404: Story = {
  render: () => (
    <div className="flex h-[500px] w-full flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <span className="font-[family-name:var(--font-fraunces,Georgia,serif)] text-6xl text-muted-foreground">
        404
      </span>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium">Page not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline">
          <Icon name="arrow_forward" size={16} className="rotate-180" /> Go back
        </Button>
        <Button>Take me home</Button>
      </div>
    </div>
  ),
}
