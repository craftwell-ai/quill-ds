'use client'

import * as React from 'react'
import { PromptComposer } from '@/components/ui/prompt-composer'
import { AiMessage, UserMessage } from '@/components/ui/ai-message'
import { AiThinking } from '@/components/ui/ai-thinking'
import { Citation, Sources, type Source } from '@/components/ui/citations'
import { SuggestedPrompts } from '@/components/ui/suggested-prompts'
import { AUTO_MODEL, ModelPicker, type ModelOption } from '@/components/ui/model-picker'
import { AiNotice } from '@/components/ui/ai-notice'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

const SOURCES: Source[] = [
  { title: 'Q3 board deck.pdf', label: 'Q3 deck', detail: 'Page 4 · Quarterly targets', snippet: 'July 4,100 · August 4,300 · September 4,800 signups.', kind: 'file' },
  { title: 'signups-sept.csv', label: 'signups-sept', detail: '812 rows', snippet: '4,226 signups, 12% under target.', kind: 'file' },
]
const MODELS: ModelOption[] = [
  { value: 'quick', label: 'Quick', description: 'Fast answers, fewer credits' },
  { value: 'balanced', label: 'Balanced', description: 'Good for most work' },
  { value: 'deep', label: 'Deep', description: 'Thinks longer on hard problems' },
]
const CHATS = { Today: ['Q3 signups vs target', 'Launch brief draft'], Yesterday: ['Pricing page copy ideas'] }

type Turn = { id: number; ask: string; reply: 'working' | 'stopped' }

/** A full AI conversation page — past chats on the left, the thread in a readable column with reasoning, source chips and follow-ups, and the composer with the model picker and AI notice pinned to the bottom. */
export function AiChat({ onSubmit = () => {} }: { onSubmit?: (value: string) => void }) {
  const [value, setValue] = React.useState('')
  const [model, setModel] = React.useState(AUTO_MODEL.value)
  const [turns, setTurns] = React.useState<Turn[]>([])
  const composerRef = React.useRef<HTMLTextAreaElement>(null)
  const working = turns.at(-1)?.reply === 'working'

  return (
    <div className="grid min-h-[40rem] bg-background md:grid-cols-[15rem_minmax(0,1fr)]">
      <nav aria-label="Chats" className="hidden content-start gap-0.5 border-r border-border p-2 md:grid">
        <Button type="button" variant="outline" size="sm" className="mb-2 justify-start"><Icon name="add" />New chat</Button>
        {Object.entries(CHATS).map(([day, titles]) => (
          <React.Fragment key={day}>
            <p className="px-2.5 pt-2.5 pb-1 text-xs font-semibold text-muted-foreground">{day}</p>
            {titles.map((title, index) => (
              <a key={title} href="#" aria-current={day === 'Today' && index === 0 ? 'page' : undefined}
                className="truncate rounded-md px-2.5 py-1.5 text-sm text-foreground no-underline hover:bg-muted aria-[current=page]:bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{title}</a>
            ))}
          </React.Fragment>
        ))}
      </nav>
      <section aria-label="Conversation" className="grid grid-rows-[minmax(0,1fr)_auto]">
        {/* A log is a polite live region, so each new turn is read out. It sits inside the "Conversation" region, which also holds the composer, so the region stays the page landmark. */}
        <div role="log" aria-label="Messages" className="mx-auto grid w-full max-w-3xl content-start gap-5 px-4 py-6">
          <UserMessage>How did signups do against target this quarter?</UserMessage>
          <AiMessage
            thinking={<AiThinking status="done" seconds={8} steps={['Loaded signups-sept.csv, 812 rows', 'Compared each month with the targets in Q3 board deck.pdf']} />}
            sources={<Sources sources={SOURCES} />}
            onRetry={() => {}}
            onFeedback={() => {}}
          >
            <p>Signups beat target in July and August<Citation source={SOURCES[0]} /> but fell 12% short in September<Citation source={SOURCES[1]} />, so the quarter still closed 4% ahead.</p>
          </AiMessage>
          {turns.length === 0 ? (
            <SuggestedPrompts className="pl-[2.375rem]" label="Follow-ups"
              suggestions={[{ label: 'Break September down by week' }, { label: 'Compare with Q2' }, { label: 'Draft a note to the team' }]}
              onPick={(prompt) => { setValue(prompt); composerRef.current?.focus() }} />
          ) : null}
          {turns.map((turn) => (
            <React.Fragment key={turn.id}>
              <UserMessage>{turn.ask}</UserMessage>
              {turn.reply === 'working'
                ? <AiMessage streaming thinking={<AiThinking status="working" activity="Reading signups-sept.csv" />} />
                : <AiMessage stopped />}
            </React.Fragment>
          ))}
        </div>
        <div className="sticky bottom-0 mx-auto grid w-full max-w-3xl gap-1.5 bg-background px-4 pt-2 pb-3">
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
            trailing={<ModelPicker models={MODELS} value={model} onValueChange={setModel} />}
            placeholder="Ask a follow-up"
          />
          <AiNotice />
        </div>
      </section>
    </div>
  )
}
