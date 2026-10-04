export const usage = {
  name: 'ai-chat',
  kind: 'pattern',
  summary: 'A full AI conversation page — past chats on the left, the thread in a readable column with reasoning, source chips and follow-ups, and the composer with the model picker and AI notice pinned to the bottom.',
  useWhen: ['An app has a page for an ongoing conversation with its AI assistant.'],
  alternatives: [
    { name: 'ai-home', when: 'people land with nothing typed yet and need a greeting and starters, not a thread.' },
    { name: 'chat', when: 'two people are messaging; no AI is involved.' },
  ],
  rules: [
    {
      id: 'no-glow-in-thread',
      do: 'Keep the thread on the plain page; the marks and the composer edge already say AI.',
      dont: 'Add the AI glow behind the conversation — it belongs to the AI home alone.',
      visual: false,
    },
  ],
  a11y: [
    'The sidebar is a navigation landmark named "Chats" with the open chat marked aria-current; the thread and composer sit in a region named "Conversation".',
    'The thread is a log named "Messages", a polite live region, so each new turn is read out as it is added, without moving focus.',
    'Each reply is an article. While it works, its status region announces the activity as it changes; once it is stopped, "You stopped this answer." is announced.',
    'The chat links, suggestion chips, source chips and the thinking toggle show the same 3px focus ring as a Button.',
  ],
  tokens: ['--background', '--border', '--muted', '--muted-foreground', '--ai-from', '--ai-via', '--ai-to'],
}
