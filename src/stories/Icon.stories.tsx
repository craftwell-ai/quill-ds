import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor } from 'storybook/test'
import { Icon } from '@/components/ui/icon'
import { icons } from '@/components/ui/icons.core.mjs'

const meta = { title: 'Foundations / Icons', component: Icon, tags: ['autodocs'] } satisfies Meta<typeof Icon>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { name: 'check', size: 24 } }

// Gallery renders the SYNC core set (instant, no flash). The full library is
// reachable by name via lazy per-icon modules — see the Lazy story below.
export const Gallery: Story = {
  args: { name: 'add' },
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-8 gap-4 text-ink">
      {Object.keys(icons).map((n) => (
        <div key={n} className="flex flex-col items-center gap-1 text-center">
          <Icon name={n as keyof typeof icons} size={24} />
          <span className="text-[10px] text-ink-muted">{n}</span>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const svgs = canvasElement.querySelectorAll('svg[data-slot="icon"]')
    expect(svgs.length).toBeGreaterThan(30)
  },
}

// A non-core icon: mounts a same-size placeholder, dynamic-imports its chunk,
// then swaps in the real paths. The play awaits resolution and asserts it rendered.
export const Lazy: Story = {
  args: { name: 'rocket_launch', size: 32 },
  parameters: { controls: { disable: true } },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg[data-slot="icon"]')
    expect(svg).toBeTruthy()
    // Placeholder reserves the box immediately (no layout shift).
    expect(svg?.getAttribute('width')).toBe('32')
    // After the async chunk resolves, the real geometry appears.
    await waitFor(() => {
      expect(svg?.querySelectorAll('path').length).toBeGreaterThan(0)
    })
  },
}
