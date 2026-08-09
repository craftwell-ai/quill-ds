export const usage = {
  name: 'input-group',
  kind: 'component',
  summary: 'Merges an input (or textarea) with prefix/suffix addons — icons, buttons, plain text — inside one bordered control.',
  useWhen: [
    'The field needs a prefix or suffix merged into the same bordered control — a search icon, a currency symbol, a unit label, a copy or clear button.',
  ],
  alternatives: [
    { name: 'input', when: "the field doesn't need any prefix/suffix affordance — a bare Input is less markup." },
    { name: 'combobox', when: "the \"input\" is really a searchable picker — Combobox already composes InputGroup internally for its trigger." },
  ],
  rules: [
    {
      id: 'suffix-addon-needs-inline-end',
      do: 'Set align="inline-end" on InputGroupAddon when it trails the value (a unit label, a suffix icon).',
      dont: 'Leave a suffix addon at the default align="inline-start" — it renders squeezed onto the left with any prefix instead of trailing the value.',
      visual: true,
    },
    {
      id: 'interactive-needs-real-button',
      do: 'Use InputGroupButton for any clickable suffix (copy, clear, search) so it stays a real `<button>`.',
      dont: "Fake a button with a styled clickable `<div>` inside InputGroupAddon — the addon's own click-to-focus handler only skips real `<button>` elements, so it still steals the click.",
      visual: false,
    },
  ],
  a11y: [
    'The wrapper and each InputGroupAddon carry role="group", grouping the control with its affixes for assistive tech.',
    'Clicking a non-interactive addon (an icon, plain text) focuses the input inside it — the click only stays put when it lands on a real `<button>`.',
    'An aria-invalid control inside the group (InputGroupInput or InputGroupTextarea) turns the whole group border/ring destructive — there is no separate error prop on InputGroup itself.',
  ],
  tokens: ['--input', '--ring', '--destructive', '--radius-lg', '--radius'],
}
