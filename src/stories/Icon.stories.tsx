import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as React from 'react'
import { expect, waitFor, userEvent, within } from 'storybook/test'
import { Icon, type IconName } from '@/components/ui/icon'
import { icons as coreIcons } from '@/components/ui/icons.core.mjs'
import { iconNames } from '@/components/ui/icon-names.generated.mjs'

// A single searchable gallery of the whole Material Symbols Outlined library.
// Type to search all icons; click an icon to see its detail (sizes + usage snippet).
// (Icons load on demand — see the delivery-optimization spec — so browsing stays fast.)
const meta = {
  title: 'Foundations / Icons',
  component: Icon,
  tags: ['autodocs'],
} satisfies Meta<typeof Icon>
export default meta
type Story = StoryObj<typeof meta>

const CORE = Object.keys(coreIcons)
const MAX_RESULTS = 120

function IconDetail({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <aside className="w-64 shrink-0 rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Icon detail</span>
        <button
          type="button"
          aria-label="Close detail"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <Icon name="close" size={18} />
        </button>
      </div>
      <div className="mb-4 flex items-center justify-center rounded-lg bg-muted py-8 text-foreground">
        <Icon name={name as IconName} size={48} />
      </div>
      <p className="mb-1 text-xs text-muted-foreground">Name</p>
      <code className="mb-4 block text-sm text-foreground">{name}</code>
      <p className="mb-1 text-xs text-muted-foreground">Sizes</p>
      <div className="mb-4 flex items-end gap-3 text-foreground">
        {[16, 20, 24, 32].map((s) => (
          <Icon key={s} name={name as IconName} size={s} />
        ))}
      </div>
      <p className="mb-1 text-xs text-muted-foreground">Usage</p>
      <code className="block rounded-md bg-muted px-2 py-1.5 text-xs text-foreground">{`<Icon name="${name}" />`}</code>
    </aside>
  )
}

function IconGallery() {
  const [query, setQuery] = React.useState('')
  const [selected, setSelected] = React.useState<string | null>(null)
  const q = query.trim().toLowerCase()
  const results = q ? iconNames.filter((n) => n.includes(q)).slice(0, MAX_RESULTS) : CORE

  return (
    <div className="flex gap-6 text-ink">
      <div className="min-w-0 flex-1">
        <input
          type="search"
          aria-label="Search icons"
          placeholder={`Search ${iconNames.length.toLocaleString()} icons…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-3 w-full max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="mb-3 text-xs text-muted-foreground">
          {q
            ? `${results.length}${results.length === MAX_RESULTS ? '+' : ''} result${results.length === 1 ? '' : 's'} for “${q}”`
            : `${CORE.length} core icons shown · type to search all ${iconNames.length.toLocaleString()}`}
        </p>
        {results.length === 0 ? (
          <p className="text-sm text-muted-foreground">No icons match “{q}”.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(84px,1fr))] gap-2">
            {results.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSelected(n)}
                aria-pressed={selected === n}
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors hover:bg-accent ${
                  selected === n ? 'border-ring bg-accent' : 'border-transparent'
                }`}
              >
                <span className="text-foreground">
                  <Icon name={n as IconName} size={24} />
                </span>
                <span className="w-full truncate text-[10px] text-foreground">{n}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {selected && <IconDetail name={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

export const Gallery: Story = {
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
    // Searching a tail icon (not in the per-icon set) resolves via the grouped-tail fallback,
    // then clicking it opens the detail panel.
    const search = canvas.getByLabelText('Search icons')
    await userEvent.type(search, 'acupuncture')
    const cell = await canvas.findByRole('button', { name: /acupuncture/, }, { timeout: 5000 })
    await waitFor(() => expect(cell.querySelector('path')).toBeTruthy(), { timeout: 5000 })
    await userEvent.click(cell)
    await waitFor(() => expect(canvas.getByText('Icon detail')).toBeTruthy())
  },
}
