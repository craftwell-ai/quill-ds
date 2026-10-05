export const usage = {
  name: 'approval-card',
  kind: 'component',
  summary: 'Asks before an AI agent acts — an inline card that names the action, shows exactly what will happen, lets people edit it in place, and has a main button that says what it does.',
  useWhen: ['An AI agent is about to do something on a person\'s behalf (send, post, pay, delete) and needs a yes first.'],
  alternatives: [
    { name: 'alert-dialog', when: 'a person started a destructive action themselves and has to confirm it before anything else happens.' },
    { name: 'agent-steps', when: 'you are showing what the agent is doing, not asking permission for it.' },
  ],
  rules: [
    {
      id: 'button-names-the-action',
      do: 'Give the main button the action\'s own words: "Send email", "Delete 3 drafts".',
      dont: 'Label it "Approve", "OK" or "Yes" — people should not have to read the title to know what they are agreeing to.',
      visual: true,
    },
    {
      id: 'show-what-will-happen',
      do: 'Show the real thing: who it goes to, the subject, the text, and one line on the consequence.',
      dont: 'Ask for approval of a summary ("Send the report?") while hiding what will actually be sent.',
      visual: false,
    },
    {
      id: 'approval-stays-plain',
      do: 'Keep the buttons stock: solid ink for the action, destructive for anything that deletes or cannot be undone.',
      dont: 'Put the AI gradient on the action button — approving has to feel like any other decision.',
      visual: false,
    },
    {
      id: 'tile-takes-the-divider-line',
      do: 'Leave the proposal tile on the soft divider line (border-border). It is read-only content, told apart from the card by its fill.',
      dont: 'Outline it with the control line (border-input) — that line marks things people press or type in.',
      visual: false,
    },
  ],
  a11y: [
    'The card is a group named by its title; it sits in the conversation and never takes focus on its own.',
    'The rows are a description list (term and value).',
    'Edit is a toggle button (aria-pressed). Pressing it puts the cursor in the field, which is named by bodyLabel.',
    'The main button is named by the action itself. A body that was given and is now empty disables it.',
    'The outcome line appears inside a status region that is already on the page, so it is announced; while empty the region is a real box that takes no space. When the person presses the card\'s own main or decline button, the buttons go and focus moves to that line without scrolling the page, so keyboard users keep their place. An outcome that arrives on its own, with nothing in the card pressed, moves focus nowhere; nor is focus pulled back if the person has since moved to another control.',
  ],
  tokens: ['--card', '--background', '--border', '--muted', '--muted-foreground', '--ink-soft', '--primary', '--destructive', '--ai-from', '--ai-via', '--ai-to'],
}
