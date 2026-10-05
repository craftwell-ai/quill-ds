'use client'

import * as React from 'react'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { AiMark } from '@/components/ui/ai-mark'
import { PromptComposer } from '@/components/ui/prompt-composer'
import { AiMessage, UserMessage } from '@/components/ui/ai-message'
import { AiThinking } from '@/components/ui/ai-thinking'
import { Citation, type Source } from '@/components/ui/citations'
import { SuggestedPrompts } from '@/components/ui/suggested-prompts'
import { cn } from '@/lib/utils'

const SOURCE: Source = { title: 'Changelog: new pricing page', label: 'changelog', detail: 'example.com/changelog', snippet: 'Shipped 9 September: annual plans shown first.', kind: 'web' }

type Turn = { id: number; ask: string; reply: 'working' | 'stopped' }

// One literal on purpose: the Figma parity check counts every <Icon name="…"> in this file, and the panel drawn on
// its own shows a single close (the chip's). The Sheet's Close reuses this.
const closeIcon = (size?: number) => <Icon name="close" size={size} />


export type AiPanelProps = {
  title?: string
  /** What the assistant can see: "Q3 report". Pass a string or null to control it; leave it out and the panel keeps its own. */
  scope?: string | null
  /** Called when the chip's remove button is pressed. A scope you control needs this, or the chip has no remove button. */
  onScopeRemove?: () => void
  /** History only calls this; the panel has no past-chats view of its own. Left out, the History button is not drawn. */
  onHistory?: () => void
  /** A close control for the header. AiSidePanel passes the Sheet's own. */
  close?: React.ReactNode
  onSubmit?: (value: string) => void
  className?: string
}

/** The assistant panel on its own (header, scope chip, thread and composer on one AI wash), for a layout that gives it its own column. */
export function AiPanel({ title = 'Assistant', scope, onScopeRemove, onHistory, close, onSubmit = () => {}, className }: AiPanelProps) {
  const titleId = React.useId()
  const [ownScope, setOwnScope] = React.useState<string | null>('Q3 report')
  const currentScope = scope === undefined ? ownScope : scope
  // A scope the app controls, with nothing to call, cannot be removed: no dead button.
  const removable = scope === undefined || Boolean(onScopeRemove)
  const [value, setValue] = React.useState('')
  const [turns, setTurns] = React.useState<Turn[]>([])
  const composerRef = React.useRef<HTMLTextAreaElement>(null)
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const working = turns.at(-1)?.reply === 'working'
  // Whether anything is scrolled above the top of the thread: only then is there something to fade under the header.
  const [scrolled, setScrolled] = React.useState(false)

  // A new turn is added at the bottom of a thread that may already be scrolled; keep the newest in view.
  React.useEffect(() => {
    const scroller = scrollerRef.current
    if (scroller && turns.length > 0) scroller.scrollTop = scroller.scrollHeight
  }, [turns.length])

  const removeScope = () => {
    if (scope === undefined) setOwnScope(null)
    onScopeRemove?.()
    // The button that was pressed is about to unmount; without this keyboard focus falls to the page.
    composerRef.current?.focus()
  }

  return (
    // One wash on the panel itself, top to bottom, behind all three parts: a band on the header alone reads as a hard edge.
    <section aria-labelledby={titleId} className={cn('ai-wash grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] bg-popover text-sm text-popover-foreground', className)}>
      <div className="flex items-center gap-2 py-2.5 pr-2.5 pl-3.5">
        <AiMark size={18} />
        {/* A paragraph, not a heading: headings take the serif display preset. */}
        <p id={titleId} className="min-w-0 flex-1 truncate font-semibold text-foreground">{title}</p>
        {onHistory ? <Button type="button" variant="ghost" size="icon-sm" aria-label="History" onClick={onHistory}><Icon name="history" /></Button> : null}
        {close}
      </div>
      {/* The inner block is pushed to the bottom with an auto margin, which (unlike aligning the content to the end)
          keeps the top reachable when the thread grows past the panel and scrolls. */}
      {/* Messages scrolled under the header fade out through a mask: it has no colour of its own, so the wash shows
          through in every theme, and it is not an element, so it takes no presses. The fade is as deep as a reply's
          avatar. scroll-pt keeps a control reached by keyboard below it, where its focus ring is drawn in full. */}
      <div ref={scrollerRef} data-slot="thread" onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 0)}
        className={cn('flex min-h-0 scroll-pt-8 flex-col overflow-y-auto px-3.5 pt-1 pb-2.5', scrolled && '[mask-image:linear-gradient(to_bottom,transparent,black_1.75rem)]')}>
        <div className="mt-auto grid min-w-0 gap-3">
          {currentScope ? (
            // border-input, not the divider line: the chip has to read as a shape on the wash in the dark themes.
            <span data-slot="scope-chip" className={cn('inline-flex h-7 w-fit max-w-full items-center gap-1.5 rounded-full border border-input bg-background pl-2 text-xs text-ink-soft', removable ? 'pr-1' : 'pr-2.5')}>
              <Icon name="description" size={13} />
              <span className="truncate">{`Looking at: ${currentScope}`}</span>
              {removable ? (
                <button type="button" aria-label={`Stop looking at ${currentScope}`} onClick={removeScope}
                  className="grid size-5 shrink-0 place-items-center rounded-full hover:bg-muted hover:text-foreground outline-hidden focus-visible:ring-3 focus-visible:ring-ring/50">
                  {closeIcon(12)}
                </button>
              ) : null}
            </span>
          ) : null}
          {/* A log is a polite live region, so each new turn is read out. */}
          <div role="log" aria-label="Messages" className="grid min-w-0 gap-3">
            <UserMessage>{"What's the one thing to fix?"}</UserMessage>
            {/* hideName on every reply: the header already says who is answering. */}
            <AiMessage hideName>
              <p>The September dip. It started the day the new pricing page shipped<Citation source={SOURCE} />.</p>
            </AiMessage>
            {turns.length === 0 ? (
              <SuggestedPrompts layout="list" label="Follow-ups"
                suggestions={[{ label: 'Draft a fix for the pricing page' }]}
                onPick={(prompt) => { setValue(prompt); composerRef.current?.focus() }} />
            ) : null}
            {turns.map((turn) => (
              <React.Fragment key={turn.id}>
                <UserMessage>{turn.ask}</UserMessage>
                {turn.reply === 'working'
                  ? <AiMessage hideName streaming thinking={<AiThinking status="working" activity="Reading the page" />} />
                  : <AiMessage hideName stopped />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="px-3 pt-2 pb-3">
        <PromptComposer
          ref={composerRef}
          size="sm"
          value={value}
          onValueChange={setValue}
          status={working ? 'working' : 'idle'}
          onStop={() => {
            setTurns((all) => all.map((turn, index) => (index === all.length - 1 ? { ...turn, reply: 'stopped' } : turn)))
            // Stop unmounts as the composer goes idle; without this keyboard focus falls to the page.
            composerRef.current?.focus()
          }}
          onSubmit={(text) => { onSubmit(text); setTurns((all) => [...all, { id: all.length + 1, ask: text, reply: 'working' }]); setValue('') }}
          placeholder={currentScope ? 'Ask about this' : 'Ask anything'}
        />
      </div>
    </section>
  )
}

export type AiSidePanelProps = Omit<AiPanelProps, 'close' | 'className'> & {
  /** Controlled when passed; leave it out to let the panel keep its own. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** The element that opens the panel, usually a Button. */
  trigger?: React.ReactElement
  side?: 'left' | 'right'
  className?: string
}

/** An AI assistant docked beside the page — a header with History and Close, a removable chip saying what it is looking at, a short thread, and the small composer, on one soft top-to-bottom AI wash. */
export function AiSidePanel({ open, defaultOpen = false, onOpenChange, trigger, side = 'right', title = 'Assistant', className, ...panel }: AiSidePanelProps) {
  const [ownOpen, setOwnOpen] = React.useState(defaultOpen)
  const isOpen = open === undefined ? ownOpen : open
  const setOpen = (next: boolean) => {
    if (open === undefined) setOwnOpen(next)
    onOpenChange?.(next)
  }
  return (
    <Sheet open={isOpen} onOpenChange={(next) => setOpen(next)}>
      {trigger ? <SheetTrigger render={trigger} /> : null}
      {/* The panel's header holds the one Close, so the Sheet's corner button is off. gap-0 and p-0 hand the whole
          sheet to the panel, so its wash runs edge to edge. */}
      <SheetContent side={side} showCloseButton={false} aria-label={title} className={cn('gap-0 p-0', className)}>
        <AiPanel
          {...panel}
          title={title}
          className="min-h-0 flex-1"
          close={(
            <SheetClose render={<Button type="button" variant="ghost" size="icon-sm" />}>
              {closeIcon()}
              <span className="sr-only">Close</span>
            </SheetClose>
          )}
        />
      </SheetContent>
    </Sheet>
  )
}
