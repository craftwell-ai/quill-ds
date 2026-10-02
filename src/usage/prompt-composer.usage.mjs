export const usage = {
  name: 'prompt-composer',
  kind: 'component',
  summary: 'The box people type to an AI in — grows with the text, sends on Enter, turns Send into Stop while the AI works, with slots for tools, files and a model picker.',
  useWhen: [
    'People type a request to an AI: an assistant page, a chat thread, a side panel, or an "ask about this" bar.',
  ],
  alternatives: [
    { name: 'ai-home', when: 'you need the whole AI start page around the composer, not just the box.' },
    { name: 'chat', when: 'two people are messaging each other and no AI is involved.' },
    { name: 'textarea', when: 'it is an ordinary form field whose text is saved, not sent to an AI.' },
  ],
  rules: [
    {
      id: 'edge-not-ring',
      do: 'Let the composer draw its own AI edge: muted at rest, full on focus, sweeping while working.',
      dont: 'Wrap it in a thick glowing gradient ring or a second border — one thin line marks AI.',
      visual: true,
    },
    {
      id: 'send-stays-solid',
      do: 'Keep Send and Stop solid ink in the same spot.',
      dont: 'Fill the Send button with the AI gradient — it competes with the edge and breaks the never-on-Send rule.',
      visual: true,
    },
    {
      id: 'size-by-place',
      do: 'Use `lg` on an AI home page and `sm` in threads, side panels and inline bars.',
      dont: 'Put the large composer inside a narrow panel — use `sm`.',
      visual: false,
    },
    {
      id: 'controlled-clears-in-parent',
      do: 'When you pass `value`, clear it yourself in `onSubmit` (set it to an empty string).',
      dont: 'Pass `value` and expect the composer to empty itself after sending — it only clears its own state when uncontrolled.',
      visual: false,
    },
    {
      id: 'mark-ai-tools-not-files',
      do: 'Show active AI tools (Analyze data, Web search) as chips with the mark, and attached files as neutral file chips.',
      dont: 'Put the AI mark on attached files — the files are the person\'s, not the AI\'s.',
      visual: false,
    },
    {
      id: 'mark-ai-commands',
      do: 'Mark AI commands in the / menu with the AI sparkle and leave ordinary app commands unmarked.',
      dont: 'Mark every command — the mark is how people tell which actions call the AI.',
      visual: false,
    },
    {
      id: 'stop-while-working',
      do: 'Set `status="working"` while the AI answers and pass `onStop`.',
      dont: 'Disable the whole composer while the AI works — people should be able to stop it.',
      visual: false,
    },
    {
      id: 'notebook-for-writing',
      do: 'Use `variant="notebook"` where the prompt is a piece of writing — a brief, a spec, a long instruction.',
      dont: 'Use the notebook for quick questions or a help widget — its ruled page reads as "write at length".',
      visual: false,
    },
  ],
  a11y: [
    'The text box has an accessible name (`label`, default "Message").',
    'Enter sends, Shift+Enter adds a line. The Enter that confirms a word in a Japanese or Chinese input method never sends or picks a command, in every browser — including Safari, which delivers that Enter just after the word pop-up closes.',
    'While working, the send button becomes "Stop" and keeps focus position; the edge animation stops under reduced motion.',
    'Errors are announced with `role="alert"` under the box.',
    'The `/` and `@` menu: Arrow Up and Down move through the options, Enter picks one, and Escape closes the menu without changing the text. Focus stays in the box; the active option is announced through `aria-activedescendant`.',
    'Mode tabs (Ask, Agent) are a `tablist` of `tab` buttons named by their label, with the selected one marked `aria-selected`; Tab reaches them and Enter or Space switches mode.',
    'The notebook word count is visible text, not a live region, so a screen reader is not interrupted after every word.',
  ],
  tokens: ['--ai-from', '--ai-via', '--ai-to', '--background', '--line-control', '--line-soft', '--input', '--ring', '--muted-foreground', '--card', '--primary', '--primary-foreground', '--destructive'],
}
