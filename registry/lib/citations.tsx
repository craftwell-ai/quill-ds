'use client'

import * as React from 'react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

export type Source = {
  title: string
  /** Short chip text, e.g. "Q3 deck". Without it the chip shows the title, truncated. */
  label?: string
  /** Where in the source, or its address: "Page 4", "craftwell.ai/changelog". */
  detail?: string
  /** A line from the source, shown in the preview. */
  snippet?: string
  /** Opens in a new tab when given; without it the chip is a button. */
  href?: string
  kind?: 'file' | 'web'
}

// Truncation keeps a long title from turning one chip into a line-wide bar; the full title stays in the accessible name.
const CHIP = 'ml-0.5 inline-block h-5 max-w-40 truncate rounded-md bg-muted px-2 text-center align-middle text-2xs font-semibold leading-5 text-ink-soft no-underline hover:bg-foreground hover:text-background'
const kindIcon = (s: Source) => (s.kind === 'web' ? 'language' : 'description')

function where(s: Source) {
  if (s.detail) return s.detail
  if (!s.href) return 'File'
  try { return new URL(s.href).hostname } catch { return s.href }
}

/** Shows where an AI answer came from — a small chip after each claim, named for its source, that previews it, and an "N sources" list under the answer. */
export function Citation({ source, className }: { source: Source; className?: string }) {
  const name = `Source: ${source.title}`
  return (
    <HoverCard>
      <HoverCardTrigger
        render={source.href
          ? <a href={source.href} target="_blank" rel="noreferrer" aria-label={name} />
          : <button type="button" aria-label={name} />}
        className={cn(CHIP, className)}
      >
        {source.label ?? source.title}
      </HoverCardTrigger>
      <HoverCardContent className="grid w-72 gap-1">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon name={kindIcon(source)} size={13} />{where(source)}</span>
        <span className="font-semibold">{source.title}</span>
        {source.snippet ? <span className="text-muted-foreground">{source.snippet}</span> : null}
      </HoverCardContent>
    </HoverCard>
  )
}

/** "N sources" under an AI answer, opening the list the chips point to. */
export function Sources({ sources, defaultOpen = false, className }: { sources: Source[]; defaultOpen?: boolean; className?: string }) {
  const [open, setOpen] = React.useState(defaultOpen)
  const listId = React.useId()
  if (!sources.length) return null
  return (
    <div data-slot="sources" className={cn('grid justify-items-start gap-2', className)}>
      <button type="button" aria-expanded={open} aria-controls={listId} onClick={() => setOpen((wasOpen) => !wasOpen)}
        className="inline-flex h-7 items-center gap-2 rounded-full border border-border bg-background pr-2.5 pl-1.5 text-xs font-semibold text-ink-soft hover:bg-muted">
        <span aria-hidden className="flex">
          {sources.slice(0, 3).map((source, index) => (
            <span key={index} className={cn('grid size-[18px] place-items-center rounded-full border-2 border-background bg-muted', index > 0 && '-ml-1.5')}>
              <Icon name={kindIcon(source)} size={10} />
            </span>
          ))}
        </span>
        {sources.length === 1 ? '1 source' : `${sources.length} sources`}
      </button>
      {/* A list, not a numbered one: chips are named, so order carries no meaning. */}
      <ul id={listId} hidden={!open} className="grid w-full gap-0.5 rounded-lg border border-border bg-background p-1">
        {sources.map((source, index) => {
          const body = (
            <>
              <span aria-hidden className="grid size-[22px] place-items-center rounded-md bg-muted text-ink-soft"><Icon name={kindIcon(source)} size={14} /></span>
              <span className="grid min-w-0">
                <span className="truncate font-semibold">{source.title}</span>
                {source.detail ? <span className="truncate text-xs text-muted-foreground">{source.detail}</span> : null}
              </span>
            </>
          )
          const row = 'grid grid-cols-[1.375rem_minmax(0,1fr)] items-start gap-2.5 rounded-md p-2 text-sm'
          return (
            <li key={index}>
              {source.href
                ? <a href={source.href} target="_blank" rel="noreferrer" className={cn(row, 'text-foreground no-underline hover:bg-card')}>{body}</a>
                : <div className={row}>{body}</div>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
