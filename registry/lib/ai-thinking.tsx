'use client'

import * as React from 'react'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/** "8 s", "1 min 38 s", "2 min" — how long the AI thought, as the finished row says it. */
export function formatThoughtFor(seconds: number) {
  const s = Math.max(1, Math.round(seconds))
  if (s < 60) return `${s} s`
  const m = Math.floor(s / 60)
  const r = s % 60
  return r ? `${m} min ${r} s` : `${m} min`
}

export type AiThinkingProps = {
  status: 'working' | 'done'
  /** The working label. */
  label?: string
  /** What the AI is doing right now, shown under the label while working. */
  activity?: string
  /** How long it thought; shown once done. */
  seconds?: number
  /** The reasoning, opened from the finished row. */
  steps?: React.ReactNode[]
  defaultOpen?: boolean
  className?: string
}

/** Shows an AI working before its answer — a shimmering "Thinking" with what it is doing — then folds into one quiet "Thought for 8 s" row that opens the reasoning. */
export function AiThinking({ status, label = 'Thinking', activity, seconds, steps, defaultOpen = false, className }: AiThinkingProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const listId = React.useId()

  if (status === 'working') {
    return (
      <div data-slot="ai-thinking" data-status="working" role="status" className={cn('grid gap-0.5', className)}>
        <span className="ai-shimmer w-fit text-sm font-semibold">{label}</span>
        {activity ? <span className="text-xs text-muted-foreground">{activity}</span> : null}
        <span aria-hidden className="ai-line mt-1.5" />
      </div>
    )
  }

  const summary = seconds === undefined ? 'Thought it through' : `Thought for ${formatThoughtFor(seconds)}`
  const hasSteps = Boolean(steps?.length)
  return (
    <div data-slot="ai-thinking" data-status="done" className={cn('grid gap-1', className)}>
      {hasSteps ? (
        <button type="button" aria-expanded={open} aria-controls={listId} onClick={() => setOpen((o) => !o)}
          className="inline-flex w-fit items-center gap-1 rounded-sm text-sm text-muted-foreground hover:text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <Icon name="chevron_right" size={14} className={cn('transition-transform motion-reduce:transition-none', open && 'rotate-90')} />
          {summary}
        </button>
      ) : (
        <span className="text-sm text-muted-foreground">{summary}</span>
      )}
      {hasSteps ? (
        <ol id={listId} hidden={!open} className="ml-1.5 grid gap-1 border-l-2 border-border pl-3.5 text-xs text-muted-foreground">
          {steps!.map((step, i) => <li key={i}>{step}</li>)}
        </ol>
      ) : null}
    </div>
  )
}
