export const usage = {
  name: 'ai-side-panel',
  kind: 'pattern',
  summary: 'An AI assistant docked beside the page — a header with History and Close, a removable chip saying what it is looking at, a short thread, and the small composer, on one soft top-to-bottom AI wash.',
  useWhen: ['People are working on a page (a report, a record, a document) and should be able to ask the AI about it without leaving.'],
  alternatives: [
    { name: 'ai-chat', when: 'the conversation is the whole page, not a helper beside other work.' },
    { name: 'sheet', when: 'the side panel holds an ordinary form or details, not an AI assistant.' },
    { name: 'ai-popover', when: 'the AI suggests one edit to selected text and no conversation is needed.' },
  ],
  rules: [
    {
      id: 'say-what-it-sees',
      do: 'Keep the "Looking at" chip so people know what the assistant can read, and let them remove it.',
      dont: 'Send the page to the AI without saying so, or pin a scope people cannot drop.',
      visual: false,
    },
    {
      id: 'one-wash',
      do: 'Let the one wash run from the top of the panel to the bottom, behind the header, the thread and the composer.',
      dont: 'Give the header its own gradient band or add a second wash — a band reads as a hard edge.',
      visual: false,
    },
    {
      id: 'history-is-yours-to-wire',
      do: 'Wire History to your own list of past chats with onHistory. It only calls onHistory: Quill\'s past-chats view (conversation-history) comes in a later release. Leave onHistory out and the button is not drawn.',
      dont: 'Ship a History button that does nothing.',
      visual: false,
    },
    {
      id: 'small-composer-in-a-panel',
      do: 'Use the small composer and the list layout for suggestions; the panel is narrow.',
      dont: 'Put the large composer or starter cards in the panel — they belong to the AI home page.',
      visual: false,
    },
    {
      id: 'thread-is-sample-content',
      do: 'Treat the conversation shown as sample content: the block does not yet take your app\'s own messages, so put yours in by editing the thread in your copy of the block.',
      dont: 'Ship the sample conversation, or look for a prop that takes messages.',
      visual: false,
    },
    {
      id: 'composer-edge-on-the-wash',
      do: 'Keep the composer\'s gradient edge on the washed panel here. It is on purpose, even though the general rule puts the edge on page-background surfaces.',
      dont: 'Take it as a reason to put the edge on other tinted surfaces.',
      visual: false,
    },
  ],
  a11y: [
    'In the Sheet the panel is a modal dialog named by its title. Escape or Close closes it and focus returns to what opened it; opening it puts focus on the first control inside.',
    'Placed in a layout on its own (AiPanel), the panel is a region named by its title.',
    'The thread is a log named "Messages", a polite live region, so each new turn is read out as it is added. The thread scrolls inside the panel; the header and the composer stay in view.',
    'The chip\'s remove button is named "Stop looking at" followed by the scope and shows the same 3px focus ring as a Button; removing the chip moves the cursor to the composer. A scope your app controls, with no onScopeRemove, shows no remove button.',
    'History and Close are icon buttons with names. History is drawn only when onHistory is given.',
  ],
  tokens: ['--popover', '--popover-foreground', '--background', '--border', '--input', '--muted', '--ink-soft', '--foreground', '--ai-from', '--ai-via', '--ai-to'],
}
