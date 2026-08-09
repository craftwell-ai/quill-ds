export const usage = {
  name: 'alert-dialog',
  kind: 'component',
  summary: 'A modal that forces an explicit response to a destructive or irreversible action — unlike Dialog, it cannot be dismissed by clicking outside.',
  useWhen: [
    'You need the user to explicitly confirm or cancel a destructive, irreversible action — deleting a record, discarding unsaved work, removing access.',
  ],
  alternatives: [
    { name: 'dialog', when: 'the task is not destructive — editing, viewing details, filling a form. Dialog dismisses on backdrop click or Escape; AlertDialog dismisses only on Escape or an explicit button.' },
  ],
  rules: [
    {
      id: 'destructive-confirmation-only',
      do: 'Reserve AlertDialog for destructive or irreversible confirmations — deleting, overwriting, removing access.',
      dont: 'Reach for AlertDialog on a routine informational modal just to borrow its heavier visual weight — use Dialog instead.',
      visual: false,
    },
    {
      id: 'name-the-consequence',
      do: 'Label the action button with the consequence — "Delete course," "Remove student."',
      dont: 'Label the action button "Confirm" or "OK" — users can\'t tell what they\'re agreeing to without rereading the description.',
      visual: false,
    },
    {
      id: 'destructive-trigger-signals-risk',
      do: 'Give the trigger a destructive-variant Button for a true delete, so the risk is visible before the dialog even opens.',
      dont: 'Use a neutral or primary-styled trigger for a hard delete — nothing signals danger until the dialog is already open.',
      visual: true,
    },
  ],
  a11y: [
    'Renders role="alertdialog" and traps focus inside the popup while it is open.',
    "Clicking the backdrop does not close it — only Escape or an explicit Cancel/Action press does, so a destructive choice can't be dismissed by accident.",
    'Always render AlertDialogTitle — it is the accessible name announced when the dialog opens.',
  ],
  tokens: ['--popover', '--destructive', '--muted', '--radius-xl'],
}
