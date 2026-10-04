'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { AiMark } from '@/components/ui/ai-mark'
import { cn } from '@/lib/utils'

export type AiFeedback = 'up' | 'down' | null

export type AiMessageProps = {
  /** The answer. Plain paragraphs, lists and Citation chips. Leave it out while the AI is still thinking. */
  children?: React.ReactNode
  name?: string
  /** An AiThinking above the answer. */
  thinking?: React.ReactNode
  /** A Sources list under the answer. */
  sources?: React.ReactNode
  /** The answer is still arriving: shows a caret, hides the actions, marks the reply busy. */
  streaming?: boolean
  /** The person stopped the answer part-way. */
  stopped?: boolean
  /** What Copy puts on the clipboard; defaults to the answer's visible text. */
  copyText?: string
  onRetry?: () => void
  /** Controlled thumbs; omit to let the message keep its own. */
  feedback?: AiFeedback
  onFeedback?: (value: AiFeedback) => void
  className?: string
}

/** An AI's reply in a conversation — the AI mark on its avatar, the answer as plain readable text, and Copy, Try again and thumbs under it. Ships with UserMessage for the person's side. */
export function AiMessage({
  children, name = 'Assistant', thinking, sources, streaming = false, stopped = false,
  copyText, onRetry, feedback, onFeedback, className,
}: AiMessageProps) {
  const bodyRef = React.useRef<HTMLDivElement>(null)
  const [copied, setCopied] = React.useState(false)
  const [ownFeedback, setOwnFeedback] = React.useState<AiFeedback>(null)
  const current = feedback === undefined ? ownFeedback : feedback
  // Without answer text there is nothing to put a caret beside or to copy.
  const hasAnswer = React.Children.toArray(children).length > 0
  // A stopped reply with no answer has no actions; an empty group would still be announced.
  const hasActions = hasAnswer || Boolean(onRetry) || Boolean(onFeedback)

  const vote = (value: 'up' | 'down') => {
    const next = current === value ? null : value
    if (feedback === undefined) setOwnFeedback(next)
    onFeedback?.(next)
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText ?? bodyRef.current?.innerText ?? '')
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // The browser refused (no permission, insecure page); the button simply stays "Copy".
    }
  }

  return (
    <article data-slot="ai-message" aria-busy={streaming || undefined} className={cn('grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2.5', className)}>
      <span aria-hidden data-slot="reply-avatar" className="grid size-7 place-items-center rounded-full border border-border bg-background">
        <AiMark size={15} />
      </span>
      <div className="grid min-w-0 gap-1.5">
        {/* Same 28px height as the avatar, so the name sits on the avatar's centre line. */}
        <div data-slot="reply-name" className="flex min-h-7 items-center">
          <p className="text-xs font-semibold text-muted-foreground">{name}</p>
        </div>
        {thinking}
        {hasAnswer ? (
          // While streaming, the last paragraph runs inline so the caret sits at the end of its last line.
          <div ref={bodyRef} className={cn('text-sm leading-relaxed text-foreground [&>*+*]:mt-2', streaming && '[&>p:last-of-type]:inline')}>
            {children}
            {streaming ? <span aria-hidden data-slot="caret" className="ml-0.5 inline-block h-[1.05em] w-[7px] animate-pulse bg-foreground align-[-0.15em] motion-reduce:animate-none" /> : null}
          </div>
        ) : null}
        {stopped ? <p className="text-xs text-muted-foreground">You stopped this answer.</p> : null}
        {sources}
        {!streaming && hasActions ? (
          <div role="group" aria-label="Reply actions" className="-ml-1.5 flex gap-0.5 text-muted-foreground">
            {hasAnswer ? (
              <Button type="button" variant="ghost" size="icon-sm" aria-label={copied ? 'Copied' : 'Copy'} onClick={copy}>
                <Icon name={copied ? 'check' : 'content_copy'} />
              </Button>
            ) : null}
            {onRetry ? (
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Try again" onClick={onRetry}><Icon name="refresh" /></Button>
            ) : null}
            {onFeedback ? (
              <>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Good answer" aria-pressed={current === 'up'} onClick={() => vote('up')}><Icon name="thumb_up" /></Button>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Bad answer" aria-pressed={current === 'down'} onClick={() => vote('down')}><Icon name="thumb_down" /></Button>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}

/** The person's side of an AI conversation: their message, right-aligned in a warm bubble. */
export function UserMessage({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div data-slot="user-message" className={cn('ml-auto w-fit max-w-[80%] rounded-xl rounded-br-sm border border-border bg-card px-3.5 py-2 text-sm', className)}>
      {children}
    </div>
  )
}
