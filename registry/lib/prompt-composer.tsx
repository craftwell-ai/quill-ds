'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Icon } from '@/components/ui/icon'
import { AiMark } from '@/components/ui/ai-mark'
import { cn } from '@/lib/utils'

export type ComposerStatus = 'idle' | 'working' | 'disabled' | 'error'

export type ComposerAttachment = { id: string; name: string; meta?: string; kind?: string } // kind: 'PDF', 'CSV'… shown on the thumb
export type ComposerTool = { id: string; label: string }

export type PromptComposerProps = {
  onSubmit: (value: string) => void
  onStop?: () => void
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  status?: ComposerStatus
  error?: string
  size?: 'lg' | 'sm'
  label?: string
  placeholder?: string
  onMic?: () => void
  leading?: React.ReactNode
  trailing?: React.ReactNode
  attachments?: ComposerAttachment[]
  onRemoveAttachment?: (id: string) => void
  /** Enables the drop target. */
  onFilesDropped?: (files: File[]) => void
  /** Active AI tools, shown as chips with the mark. */
  tools?: ComposerTool[]
  onRemoveTool?: (id: string) => void
  className?: string
}

// Controlled use: when you pass `value`, clear it yourself in `onSubmit`; the composer only empties its own state when uncontrolled.
/** The box people type to an AI in — grows with the text, sends on Enter, turns Send into Stop while the AI works, with slots for tools, files and a model picker. */
export function PromptComposer({
  onSubmit, onStop, value, defaultValue = '', onValueChange, status = 'idle', error,
  size = 'lg', label = 'Message', placeholder, onMic, leading, trailing, className,
  attachments, onRemoveAttachment, onFilesDropped, tools, onRemoveTool,
}: PromptComposerProps) {
  const [inner, setInner] = React.useState(defaultValue)
  const text = value ?? inner
  const setText = (v: string) => { if (value === undefined) setInner(v); onValueChange?.(v) }
  const working = status === 'working'
  const disabled = status === 'disabled'
  const hasText = text.trim().length > 0
  const errorId = React.useId()
  const [dragging, setDragging] = React.useState(false)

  const submit = () => {
    if (!hasText || working || disabled) return
    onSubmit(text)
    if (value === undefined) setInner('')
  }

  return (
    <div className={cn('grid gap-1.5', className)}>
      <div
        data-slot="prompt-composer"
        data-size={size}
        onDragOver={onFilesDropped ? (e) => { e.preventDefault(); setDragging(true) } : undefined}
        onDragLeave={onFilesDropped ? () => setDragging(false) : undefined}
        onDrop={onFilesDropped ? (e) => { e.preventDefault(); setDragging(false); onFilesDropped([...e.dataTransfer.files]) } : undefined}
        className={cn(
          'rounded-2xl shadow-md',
          working ? 'ai-edge-working' : 'ai-edge',
          disabled && 'opacity-60',
        )}
      >
        {attachments?.length ? (
          <ul className={cn('flex flex-wrap gap-2', size === 'lg' ? 'px-3.5 pt-3' : 'px-2.5 pt-2')} aria-label="Attached files">
            {attachments.map((a) => (
              <li key={a.id} className="relative flex max-w-56 items-center gap-2 rounded-lg border border-border bg-card py-1.5 pr-8 pl-1.5 text-xs">
                {a.kind ? <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-2xs font-semibold text-ink-soft">{a.kind}</span> : null}
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-foreground">{a.name}</span>
                  {a.meta ? <span className="block text-muted-foreground">{a.meta}</span> : null}
                </span>
                {onRemoveAttachment ? (
                  <button type="button" aria-label={`Remove ${a.name}`} onClick={() => onRemoveAttachment(a.id)}
                    className="absolute top-1/2 right-1 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Icon name="close" className="size-3.5" />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        {dragging ? <p className="mx-3.5 mt-2 rounded-lg border-[1.5px] border-dashed border-input p-2 text-center text-xs text-muted-foreground">Drop files to attach</p> : null}
        <Textarea
          aria-label={label}
          aria-invalid={status === 'error' || undefined}
          aria-describedby={status === 'error' && error ? errorId : undefined}
          disabled={disabled}
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            // isComposing: an input method (Japanese, Chinese) uses Enter to confirm a word.
            // WebKit reports the confirming Enter with isComposing false but keyCode 229.
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.nativeEvent.keyCode !== 229) {
              e.preventDefault()
              submit()
            }
          }}
          className={cn(
            // aria-invalid:* cancel the stock textarea's red ring; the AI edge and the alert carry the error.
            'max-h-52 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 aria-invalid:border-transparent aria-invalid:ring-0 dark:bg-transparent dark:aria-invalid:border-transparent dark:aria-invalid:ring-0',
            // md:text-* overrides the stock textarea's md:text-sm, which would shrink lg on desktop.
            size === 'lg' ? 'min-h-16 px-4 pt-3.5 text-base md:text-base' : 'min-h-11 px-3 pt-2.5 text-sm md:text-sm',
          )}
        />
        <div className={cn('flex items-center gap-1.5', size === 'lg' ? 'px-2.5 pb-2.5' : 'px-1.5 pb-1.5')}>
          {leading}
          {tools?.map((t) => (
            <span key={t.id} className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-card pr-1 pl-2 text-xs font-semibold text-foreground">
              <AiMark size={13} />
              {t.label}
              {onRemoveTool ? (
                <button type="button" aria-label={`Turn off ${t.label}`} onClick={() => onRemoveTool(t.id)}
                  className="grid size-5 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
                  <Icon name="close" className="size-3" />
                </button>
              ) : null}
            </span>
          ))}
          <span className="flex-1" />
          {trailing}
          {working ? (
            <Button type="button" size="icon" className="rounded-full" aria-label="Stop" onClick={onStop}>
              <Icon name="stop" className="size-4" />
            </Button>
          ) : !hasText && onMic ? (
            <Button type="button" size="icon" variant="ghost" className="rounded-full" aria-label="Dictate" onClick={onMic} disabled={disabled}>
              <Icon name="mic" className="size-4" />
            </Button>
          ) : (
            <Button type="button" size="icon" className="rounded-full" aria-label="Send" onClick={submit} disabled={!hasText || disabled}>
              <Icon name="arrow_upward" className="size-4" />
            </Button>
          )}
        </div>
      </div>
      {status === 'error' && error ? (
        <p id={errorId} role="alert" className="px-1 text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  )
}
