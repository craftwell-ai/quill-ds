export const usage = {
  name: 'dialog',
  kind: 'component',
  summary: 'A modal window over the page for focused, non-destructive tasks — forms, details, reversible confirmations.',
  useWhen: [
    'You need the user to complete a focused task without leaving the page — edit a record, fill a short form, confirm a reversible action.',
  ],
  alternatives: [
    { name: 'alert-dialog', when: 'the action is destructive or irreversible (delete, overwrite) — AlertDialog forces an explicit choice.' },
    { name: 'sheet', when: 'the content is secondary context sliding in from an edge and the page should stay visible.' },
    { name: 'drawer', when: 'you need the edge-panel job on touch devices, with swipe-to-dismiss.' },
    { name: 'popover', when: 'the content is a small, light overlay anchored to its trigger, not a blocking task.' },
  ],
  rules: [
    {
      id: 'destructive-goes-alert',
      do: 'Confirm destructive actions with AlertDialog.',
      dont: 'Use Dialog to confirm deletes or overwrites — it dismisses too easily.',
      visual: false,
    },
    {
      id: 'close-escape-hatch',
      do: 'Keep the default close button, or pass showCloseButton={false} only when a footer button offers an explicit way out.',
      dont: 'Remove the close button and leave no visible way to dismiss.',
      visual: false,
    },
    {
      id: 'trigger-not-destructive',
      do: 'Style the Dialog trigger as outline, secondary, or default — Dialog is for non-destructive tasks.',
      dont: 'Style the Dialog trigger as destructive — that treatment belongs to AlertDialog\'s triggers, not Dialog\'s.',
      visual: true,
    },
  ],
  a11y: [
    'Focus moves into the dialog on open and returns to the trigger on close.',
    'Escape closes the dialog.',
    'Always render DialogTitle — it is the accessible name; pair it with DialogDescription for context.',
  ],
  tokens: ['--card', '--shadow-lg', '--radius-xl'],
}
