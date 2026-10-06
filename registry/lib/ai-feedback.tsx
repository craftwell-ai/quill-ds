'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

export type AiFeedbackValue = { reasons: string[]; note: string }

/** The reasons offered when the app does not bring its own. About six is the most people will read. */
export const FEEDBACK_REASONS = ['Wrong or made up', "Didn't answer my question", 'Missed something', 'Too long', 'Wrong tone', 'Other']

export type AiFeedbackFormProps = {
  /** The question at the top. It also names the form for screen readers. */
  title?: string
  /** Short reasons people can pick several of. Pass your own to replace the defaults; an empty list leaves only the note. */
  reasons?: string[]
  /** Receives the chosen reasons, in the list's order, and the note with its ends trimmed. */
  onSubmit: (value: AiFeedbackValue) => void
  /** Shows Close in the corner. */
  onClose?: () => void
  /** Names the note field and is its placeholder. */
  noteLabel?: string
  /** One line beside Send saying what goes with the feedback. Pass '' to leave it out. */
  disclosure?: string
  submitLabel?: string
  /** Controlled: true swaps the form for the thank-you line. Leave it out and the form does that itself after Send. */
  sent?: boolean
  sentMessage?: string
  className?: string
}

/** Asks what was wrong after a thumbs-down on an AI answer — a few reasons to pick from, an optional note, and Send — opening under the answer so what is being judged stays in view. */
export function AiFeedbackForm({
  title = 'What was wrong?', reasons = FEEDBACK_REASONS, onSubmit, onClose, noteLabel = 'Tell us more (optional)',
  disclosure = 'Sends this answer with your note.', submitLabel = 'Send feedback', sent, sentMessage = 'Thanks, that helps.', className,
}: AiFeedbackFormProps) {
  const titleId = React.useId()
  // Picked reasons are tracked by position: labels may repeat, positions cannot.
  const [picked, setPicked] = React.useState<Set<number>>(() => new Set())
  const [note, setNote] = React.useState('')
  const [ownSent, setOwnSent] = React.useState(false)
  const isSent = sent === undefined ? ownSent : sent
  const rootRef = React.useRef<HTMLDivElement>(null)
  const statusRef = React.useRef<HTMLDivElement>(null)
  const wasSent = React.useRef(isSent)
  // Set when the person presses this form's own Send. "Sent" can also arrive from the app, and then the cursor is theirs.
  const sentHere = React.useRef(false)
  // Text is never required, and spaces are not text.
  const ready = picked.size > 0 || note.trim().length > 0

  // Send removes the button that had focus. Keep the person's place on the line that replaced it, but only after a
  // press in this form, and only if they have not moved on since. preventScroll: the line is where the button was.
  React.useEffect(() => {
    if (isSent && !wasSent.current && sentHere.current) {
      const active = document.activeElement
      if (!active || active === document.body || rootRef.current?.contains(active)) statusRef.current?.focus({ preventScroll: true })
    }
    if (isSent) sentHere.current = false
    wasSent.current = isSent
  }, [isSent])

  // A press or focus move outside the form after Send means the person has moved on, so a late "sent" from the app must not take the cursor.
  React.useEffect(() => {
    const away = (event: Event) => {
      if (!(event.target instanceof Node) || !rootRef.current?.contains(event.target)) sentHere.current = false
    }
    document.addEventListener('pointerdown', away, true)
    return () => document.removeEventListener('pointerdown', away, true)
  }, [])

  const toggle = (index: number) => setPicked((current) => {
    const next = new Set(current)
    if (!next.delete(index)) next.add(index)
    return next
  })
  const send = () => {
    if (!ready) return
    sentHere.current = true
    if (sent === undefined) setOwnSent(true)
    onSubmit({ reasons: reasons.filter((_, index) => picked.has(index)), note: note.trim() })
  }

  return (
    <div ref={rootRef} data-slot="ai-feedback" onBlur={(event) => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) sentHere.current = false }} role={isSent ? undefined : 'group'} aria-labelledby={isSent ? undefined : titleId}
      className={cn('text-sm', !isSent && 'grid grid-cols-[minmax(0,1fr)] gap-2.5 rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm', className)}>
      {isSent ? null : (
        <>
          <div className="flex items-center gap-2">
            <p id={titleId} className="min-w-0 flex-1 font-semibold break-words text-foreground">{title}</p>
            {onClose ? (
              <Button type="button" variant="ghost" size="icon-sm" className="-my-1 -mr-1.5 text-muted-foreground" aria-label="Close" onClick={onClose}><Icon name="close" /></Button>
            ) : null}
          </div>
          {reasons.length ? (
            <div role="group" aria-label="Reasons" className="flex flex-wrap gap-1.5">
              {reasons.map((reason, index) => (
                // The control line, not the divider line: a chip is something people press. Picked, it fills with ink.
                <button key={index} type="button" aria-pressed={picked.has(index)} onClick={() => toggle(index)}
                  className="inline-flex min-h-8 items-center rounded-full border border-input bg-background px-3 py-1 text-left text-sm text-ink-soft hover:bg-muted hover:text-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background outline-hidden focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                  {reason}
                </button>
              ))}
            </div>
          ) : null}
          <Textarea aria-label={noteLabel} placeholder={noteLabel} value={note} onChange={(event) => setNote(event.target.value)} className="min-h-16 bg-background" />
          <div className="flex flex-wrap items-center gap-2">
            {disclosure ? <p className="min-w-0 flex-1 text-xs text-muted-foreground">{disclosure}</p> : <span className="flex-1" />}
            <Button type="button" disabled={!ready} onClick={send}>{submitLabel}</Button>
          </div>
        </>
      )}
      {/* On the page from the start so the thank-you arrives into a live region. While empty it is absolutely
          positioned: a real box that takes no grid row and no gap. */}
      <div ref={statusRef} role="status" tabIndex={-1} className="rounded-md outline-hidden focus-visible:ring-3 focus-visible:ring-ring/50 empty:absolute not-empty:w-fit not-empty:-mx-1.5 not-empty:px-1.5 not-empty:py-0.5">
        {isSent ? <p className="text-xs text-muted-foreground">{sentMessage}</p> : null}
      </div>
    </div>
  )
}
