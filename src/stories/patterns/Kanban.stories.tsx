import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'

const meta = {
  title: 'Patterns / Data / Kanban board',
  parameters: { layout: 'padded' },
} satisfies Meta
export default meta
type Story = StoryObj

const columns = [
  { title: 'Backlog', cards: [{ t: 'Audit color contrast', tag: 'a11y' }, { t: 'Draft migration guide', tag: 'docs' }] },
  { title: 'In progress', cards: [{ t: 'Wave B components', tag: 'design' }, { t: 'Icon gallery search', tag: 'feat' }] },
  { title: 'Done', cards: [{ t: 'Token foundation', tag: 'core' }, { t: 'Material Symbols', tag: 'icons' }] },
]

export const Kanban: Story = {
  render: () => (
    <div className="flex gap-4 text-foreground">
      {columns.map((col) => (
        <div key={col.title} className="flex w-64 shrink-0 flex-col gap-3 rounded-xl bg-muted/50 p-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-medium">{col.title}</span>
            <Badge variant="secondary">{col.cards.length}</Badge>
          </div>
          <div className="flex flex-col gap-2">
            {col.cards.map((c) => (
              <div key={c.t} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
                <span className="text-sm">{c.t}</span>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{c.tag}</Badge>
                  <div className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                    AL
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="flex items-center gap-1.5 rounded-lg px-1 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <Icon name="add" size={16} /> Add card
          </button>
        </div>
      ))}
    </div>
  ),
}
