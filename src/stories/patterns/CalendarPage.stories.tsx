import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CalendarPage as CalendarPageBlock } from '@registry/blocks/calendar-page'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { usage } from '@/usage/calendar-page.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Data / Calendar page',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const CalendarPage: Story = {
  render: () => <CalendarPageBlock />,
}

const dodontSessions = [
  { time: '9:00', title: 'Sketchbook review', kind: 'Studio' },
  { time: '11:30', title: 'Token sync with Inkwell Press', kind: 'Call' },
]

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="sync-list-to-selection"
      doExample={
        <div className="flex items-start gap-6 rounded-xl border border-border bg-card p-4">
          <Calendar
            mode="single"
            selected={new Date(2026, 6, 14)}
            onSelect={() => {}}
            defaultMonth={new Date(2026, 6)}
            className="rounded-lg border border-border"
            labels={{ labelNav: () => 'Do example calendar navigation' }}
          />
          <div className="flex w-[220px] flex-col gap-3">
            <span className="text-sm font-medium text-foreground">Tuesday, July 14</span>
            <Separator />
            <ul className="flex flex-col gap-3">
              {dodontSessions.map((s) => (
                <li key={s.time} className="flex items-start gap-3">
                  <span className="w-11 shrink-0 pt-0.5 text-xs font-medium text-muted-foreground">
                    {s.time}
                  </span>
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-sm font-medium text-foreground">{s.title}</span>
                    <Badge variant="outline">{s.kind}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      }
      dontExample={
        <div className="flex items-start gap-6 rounded-xl border border-border bg-card p-4">
          <Calendar
            mode="single"
            selected={new Date(2026, 6, 21)}
            onSelect={() => {}}
            defaultMonth={new Date(2026, 6)}
            className="rounded-lg border border-border"
            labels={{ labelNav: () => "Don't example calendar navigation" }}
          />
          <div className="flex w-[220px] flex-col gap-3">
            <span className="text-sm font-medium text-foreground">Tuesday, July 14</span>
            <Separator />
            <ul className="flex flex-col gap-3">
              {dodontSessions.map((s) => (
                <li key={s.time} className="flex items-start gap-3">
                  <span className="w-11 shrink-0 pt-0.5 text-xs font-medium text-muted-foreground">
                    {s.time}
                  </span>
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-sm font-medium text-foreground">{s.title}</span>
                    <Badge variant="outline">{s.kind}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      }
    />
  ),
}
