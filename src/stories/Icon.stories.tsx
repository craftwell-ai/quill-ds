import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, userEvent, within } from 'storybook/test'
import { Icon } from '@/components/ui/icon'
import { IconGallery } from './IconGallery'

const meta = {
  title: 'Foundations / Icons',
  component: Icon,
} satisfies Meta<typeof Icon>
export default meta
type Story = StoryObj<typeof meta>

// Hidden from the sidebar (`!dev`) — the visible page is the "Gallery" doc (Icon.mdx),
// which renders the same <IconGallery>. This story is kept only so the gallery's search +
// lazy/tail loading + detail interaction stay under automated test.
export const GalleryTest: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, layout: 'fullscreen' },
  render: () => (
    <div className="p-6">
      <IconGallery />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Core icons render instantly.
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('svg[data-slot="icon"]').length).toBeGreaterThan(30)
    )
    // Searching a tail icon resolves via the grouped-tail fallback; clicking opens detail.
    const search = canvas.getByLabelText('Search icons')
    await userEvent.type(search, 'acupuncture')
    const cell = await canvas.findByRole('button', { name: /acupuncture/ }, { timeout: 5000 })
    await waitFor(() => expect(cell.querySelector('path')).toBeTruthy(), { timeout: 5000 })
    await userEvent.click(cell)
    await waitFor(() => expect(canvas.getByText('Icon detail')).toBeTruthy())
  },
}
