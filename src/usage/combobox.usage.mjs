export const usage = {
  name: 'combobox',
  kind: 'component',
  summary: 'A searchable dropdown — type to filter a list, or multi-select with removable chips.',
  useWhen: [
    'You need to filter a long option list by typing, or let users select multiple values as removable chips.',
  ],
  alternatives: [
    { name: 'select', when: "the list is short (≤20) and doesn't need search — Select is less markup and less wiring." },
    { name: 'native-select', when: 'you want the OS-native picker instead — no search, no custom popup.' },
  ],
  rules: [
    {
      id: 'items-prop-required-for-filtering',
      do: 'Pass the full item array to `<Combobox items={…}>` on the root so ComboboxCollection can filter it.',
      dont: 'Omit items on the root — ComboboxCollection has nothing to filter, so the popup renders empty ("No results found") no matter what the user types.',
      visual: true,
    },
    {
      id: 'collection-needs-render-function-child',
      do: 'Wrap items in ComboboxCollection with a render-function child — it gets called once per filtered item.',
      dont: 'Render a static list of ComboboxItem elements outside ComboboxCollection — nothing gets filtered.',
      visual: false,
    },
    {
      id: 'value-as-trigger-child-not-render-prop',
      do: 'Pass ComboboxValue as a direct child of ComboboxTrigger, and keep the render element (e.g. Button) childless.',
      dont: "Nest content inside the render prop's own JSX (e.g. `<Button>…<ComboboxValue/></Button>`) — Base UI's prop merge gives the render element's own children priority over ComboboxTrigger's, so anything else passed as ComboboxTrigger's real children, including this wrapper's own dropdown chevron icon, is silently discarded rather than shown alongside it.",
      visual: false,
    },
  ],
  a11y: [
    'The trigger/input exposes role="combobox" with aria-expanded/aria-controls wired to the popup listbox by Base UI.',
    'ComboboxEmpty renders "No results found" when the filtered set is empty — always provide it so the popup never goes silently blank.',
    'Each ComboboxChip\'s remove control ships with a built-in aria-label ("Remove") — no extra wiring needed for multi-select chips.',
  ],
  tokens: ['--input', '--ring', '--popover', '--accent', '--destructive', '--radius-lg'],
}
