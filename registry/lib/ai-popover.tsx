'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'
import { AiMark } from '@/components/ui/ai-mark'
import { cn } from '@/lib/utils'

export type AiPopoverProps = {
  /** The text or control the suggestion is about: a <mark> around the selected text, or a Button. The popover opens from it and sits beside it. */
  children: React.ReactElement
  /** What the AI did: "Rewrite: shorter". */
  title: string
  /** The suggested text. Leave it out while the AI is still writing. */
  suggestion?: React.ReactNode
  /** The AI is writing: shows the shimmering label and switches off Replace, Insert below and Try again. */
  working?: boolean
  workingLabel?: string
  /** Controlled when passed; leave it out to let the popover keep its own. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onReplace: () => void
  replaceLabel?: string
  /** Shows "Insert below". */
  onInsertBelow?: () => void
  /** Shows "Try again". */
  onRetry?: () => void
  /** Called when Discard is pressed (not on Escape or an outside press). */
  onDiscard?: () => void
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  className?: string
}

// '', whitespace, null and false are all "no suggestion yet".
const isShown = (node: React.ReactNode) =>
  node !== undefined && node !== null && node !== false && !(typeof node === 'string' && node.trim() === '')

// Mounts with the popover, so its "just after mount" is just after the popover opens. The region is in the popover
// from its first paint, empty: a live region that arrives already filled is announced unreliably.
function WritingStatus({ working, label }: { working: boolean; label: string }) {
  const [announcing, setAnnouncing] = React.useState(false)
  React.useEffect(() => {
    const timer = window.setTimeout(() => setAnnouncing(true), 100)
    return () => window.clearTimeout(timer)
  }, [])
  // "Suggestion ready" is only news if the person waited for it in this popover.
  const [wasWorking, setWasWorking] = React.useState(working)
  if (working && !wasWorking) setWasWorking(true)
  return <div role="status" className="sr-only">{!announcing ? '' : working ? label : wasWorking ? 'Suggestion ready' : ''}</div>
}

/** An AI suggestion beside the text it is about — what the AI did, the suggested text on a soft AI wash, then Discard, Try again and Replace. */
export function AiPopover({
  children, title, suggestion, working = false, workingLabel = 'Writing',
  open, defaultOpen = false, onOpenChange, onReplace, replaceLabel = 'Replace',
  onInsertBelow, onRetry, onDiscard, side = 'bottom', align = 'start', className,
}: AiPopoverProps) {
  const [ownOpen, setOwnOpen] = React.useState(defaultOpen)
  const isOpen = open === undefined ? ownOpen : open
  const setOpen = (next: boolean) => {
    if (open === undefined) setOwnOpen(next)
    onOpenChange?.(next)
  }
  const popupRef = React.useRef<HTMLDivElement>(null)
  const ready = !working && isShown(suggestion)
  // A Button or a <button> is a native button. Highlighted text (a <mark>, a <span>) is not, and the trigger has to
  // be told so it adds the button role, a Tab stop and Enter / Space.
  const nativeButton = typeof children.type !== 'string' || children.type === 'button'

  return (
    <Popover open={isOpen} onOpenChange={(next) => setOpen(next)}>
      <PopoverTrigger render={children} nativeButton={nativeButton} />
      {/* The wash is a background image over the popover's own fill, so the stock surface colour stays. Focus opens on
          the dialog itself, not on Discard: someone holding Enter to open it would otherwise discard on the key repeat. */}
      <PopoverContent ref={popupRef} initialFocus={popupRef} side={side} align={align} className={cn('ai-wash w-96 max-w-[calc(100vw-2rem)] max-h-(--available-height) gap-0 overflow-hidden p-0 focus-visible:ring-3 focus-visible:ring-ring/50', className)}>
        <div className="flex shrink-0 items-center gap-2 px-3.5 pt-3 pb-1">
          <AiMark size={18} />
          {/* A paragraph, not the default h2: headings take the serif display preset. */}
          <PopoverTitle render={<p />} className="min-w-0 flex-1 text-sm font-semibold text-foreground">{title}</PopoverTitle>
        </div>
        {/* The popup is capped to the space the positioner has left. The header and the buttons stay put; only this
            middle part scrolls, so Replace is never pushed off a short screen. */}
        <div className="grid min-h-0 grid-cols-[minmax(0,1fr)] gap-2.5 overflow-y-auto px-3.5 pt-1.5">
          <WritingStatus working={working} label={workingLabel} />
          {working ? (
            <div className="grid gap-1.5">
              <span aria-hidden data-slot="writing-label" className="ai-shimmer w-fit text-sm font-semibold">{workingLabel}</span>
              <span aria-hidden className="ai-line" />
            </div>
          ) : ready ? (
            // border-input, not the divider line: the tile has to read as a shape on the popover in the dark themes.
            <div data-slot="suggestion" className="rounded-lg border border-input bg-background px-3 py-2 text-sm leading-relaxed [overflow-wrap:anywhere] text-foreground">{suggestion}</div>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5 px-3.5 pt-2.5 pb-3.5">
          <Button type="button" variant="ghost" onClick={() => { onDiscard?.(); setOpen(false) }}>Discard</Button>
          <span className="flex-1" />
          {/* Pressing Try again disables it while the AI writes, and the suggestion is swapped for the shimmer; focus
              moves to the dialog first so it never falls to the page. */}
          {onRetry ? <Button type="button" variant="outline" disabled={working} onClick={() => { popupRef.current?.focus(); onRetry() }}>Try again</Button> : null}
          {onInsertBelow ? <Button type="button" variant="outline" disabled={!ready} onClick={() => { onInsertBelow(); setOpen(false) }}>Insert below</Button> : null}
          {/* Plain solid ink: accepting an AI suggestion is an ordinary decision. */}
          <Button type="button" disabled={!ready} onClick={() => { onReplace(); setOpen(false) }}>{replaceLabel}</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
