import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

const meta = {
  title: 'Patterns / Data / Chat',
  parameters: { layout: 'centered' },
} satisfies Meta
export default meta
type Story = StoryObj

const messages = [
  { from: 'them', text: 'Hey! Did the new tokens land?' },
  { from: 'me', text: 'Yep — merged this morning. Dark mode flows automatically now.' },
  { from: 'them', text: 'Amazing. The badges look so much cleaner.' },
  { from: 'me', text: 'Right? Everything binds to the foundation.' },
]

export const Chat: Story = {
  render: () => (
    <div className="flex h-[480px] w-[400px] flex-col rounded-xl border border-border bg-card text-foreground">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
          GH
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">Grace Hopper</span>
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                m.from === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-border p-3">
        <Input placeholder="Message…" className="flex-1" aria-label="Message" />
        <Button size="icon" aria-label="Send">
          <Icon name="arrow_forward" size={18} />
        </Button>
      </div>
    </div>
  ),
}
