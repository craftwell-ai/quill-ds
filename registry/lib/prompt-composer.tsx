'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

export type ComposerStatus = 'idle' | 'working' | 'disabled' | 'error'

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
  className?: string
}

/** The box people type to an AI in — grows with the text, sends on Enter, turns Send into Stop while the AI works, with slots for tools, files and a model picker. */
export function PromptComposer({
  onSubmit, onStop, value, defaultValue = '', onValueChange, status = 'idle', error,
  size = 'lg', label = 'Message', placeholder, onMic, leading, trailing, className,
}: PromptComposerProps) {
  const [inner, setInner] = React.useState(defaultValue)
  const text = value ?? inner
  const setText = (v: string) => { if (value === undefined) setInner(v); onValueChange?.(v) }
  const working = status === 'working'
  const disabled = status === 'disabled'
  const hasText = text.trim().length > 0
  const errorId = React.useId()

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
        className={cn(
          'rounded-2xl shadow-md',
          working ? 'ai-edge-working' : 'ai-edge',
          disabled && 'opacity-60',
        )}
      >
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
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              submit()
            }
          }}
          className={cn(
            'max-h-52 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent',
            size === 'lg' ? 'min-h-16 px-4 pt-3.5 text-base' : 'min-h-11 px-3 pt-2.5 text-sm',
          )}
        />
        <div className={cn('flex items-center gap-1.5', size === 'lg' ? 'px-2.5 pb-2.5' : 'px-1.5 pb-1.5')}>
          {leading}
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
