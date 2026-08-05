import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'

const meta = {
  title: 'Components / HoverCard',
  component: HoverCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Design tokens
\`--popover\` · \`--shadow-sm\` · \`--radius-lg\`

### Rules
HoverCard shows on mouse hover (not click). Use for preview info — author bios, link previews, expanded metadata.
Never use for interactive actions — hover is unreliable on touch devices.
        `,
      },
    },
  },
} satisfies Meta<typeof HoverCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger
        href="#"
        className="text-sm underline-offset-4 hover:underline"
      >
        @johndoe
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="flex gap-3">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="John Doe avatar" />
            <AvatarFallback>RP</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-heading text-sm font-medium text-ink">John Doe</p>
            <p className="text-xs text-ink-muted">Founder, Quill Design System</p>
            <p className="mt-2 text-xs text-ink-soft">Building tools for makers and teachers.</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const wrapper = canvasElement.querySelector('[data-theme]')
    if (!wrapper) throw new Error('themed wrapper not found')
    const closedBottom = wrapper.getBoundingClientRect().bottom

    const trigger = canvas.getByRole('link', { name: '@johndoe' })
    await userEvent.hover(trigger)

    // HoverCard opens after an intent delay — allow more time than the default.
    const name = await screen.findByText('John Doe', {}, { timeout: 2000 })
    const popup = name.closest('[data-open]')
    if (!popup) throw new Error('hover card popup not found')
    const popupBottom = popup.getBoundingClientRect().bottom

    await waitFor(() => {
      expect(wrapper.getBoundingClientRect().bottom).toBeGreaterThanOrEqual(popupBottom)
    })
    expect(wrapper.getBoundingClientRect().bottom).toBeGreaterThan(closedBottom)

    await userEvent.unhover(trigger)

    await waitFor(() => {
      expect(
        Math.abs(wrapper.getBoundingClientRect().bottom - closedBottom)
      ).toBeLessThan(2)
    })
  },
}

export const LinkPreview: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger
        href="https://quill.design"
        className="text-sm text-blue-600 underline-offset-4 hover:underline"
      >
        quill.design
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="flex flex-col gap-1.5">
          <p className="font-heading text-sm font-medium text-ink">Quill Design System</p>
          <p className="text-xs text-ink-muted">quill.design</p>
          <p className="text-xs text-ink-soft">
            A component library and design token system for product teams who ship fast.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
}
