import * as React from 'react'
import { cn } from '@/lib/utils'

/** One quiet line under an AI composer saying the AI can be wrong, with an optional link the app supplies. */
export function AiNotice({
  children = 'The assistant can make mistakes. Check important details.',
  link,
  className,
}: {
  children?: React.ReactNode
  link?: { href: string; label: string }
  className?: string
}) {
  return (
    <p data-slot="ai-notice" className={cn('px-2 text-center text-xs text-muted-foreground', className)}>
      {children}
      {link ? (
        <>
          {' '}
          <a href={link.href} className="rounded-sm underline underline-offset-2 hover:text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{link.label}</a>
        </>
      ) : null}
    </p>
  )
}
