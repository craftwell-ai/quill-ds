'use client'

import * as React from 'react'
import { PromptComposer } from '@/components/ui/prompt-composer'
import { AiMark } from '@/components/ui/ai-mark'

const STARTERS = [
  { title: 'Brainstorm', detail: 'Ideas for a launch', prompt: 'Brainstorm ideas for our next launch' },
  { title: 'Draft a brief', detail: 'From my notes', prompt: 'Draft a brief from my notes' },
  { title: 'Plan my week', detail: 'Around my meetings', prompt: 'Plan my week around my meetings' },
  { title: 'Find', detail: 'Tasks due soon', prompt: 'Find tasks due soon' },
]

/** An AI assistant's start page — a soft AI glow, a greeting with the AI mark, the large composer with Ask/Agent modes, and starter cards. */
export function AiHome({
  greeting = 'What should we work on?',
  starters = STARTERS,
  onSubmit = () => {},
}: {
  greeting?: string
  starters?: { title: string; detail: string; prompt: string }[]
  onSubmit?: (value: string) => void
}) {
  const [value, setValue] = React.useState('')
  return (
    <section className="ai-glow grid min-h-[32rem] place-content-center gap-5 px-4 py-16">
      <h1 className="flex items-center justify-center gap-2.5 text-center font-heading text-3xl">
        <AiMark size={28} />
        {greeting}
      </h1>
      <div className="w-full max-w-2xl">
        <PromptComposer
          size="lg"
          value={value}
          onValueChange={setValue}
          onSubmit={(v) => { onSubmit(v); setValue('') }}
          modes={[
            { value: 'ask', label: 'Ask', ai: true, placeholder: 'Ask anything. Type / for skills, @ to add context' },
            { value: 'agent', label: 'Agent', placeholder: 'What should your agent take on?' },
          ]}
        />
      </div>
      <ul className="grid w-full max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4">
        {starters.map((s) => (
          <li key={s.title}>
            <button type="button" onClick={() => setValue(s.prompt)}
              className="grid w-full gap-0.5 rounded-lg border border-border bg-card px-3 py-2.5 text-left hover:border-input">
              <span className="text-sm font-semibold">{s.title}</span>
              <span className="truncate text-xs text-muted-foreground">{s.detail}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
