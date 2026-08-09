export const usage = {
  name: 'tabs',
  kind: 'component',
  summary: 'A set of triggers that swap which panel is visible in place — content panels share the same position, only one shown at a time.',
  useWhen: [
    'You need to switch between a small number of related content panels (Overview/Curriculum/Reviews) that occupy the same space, without navigating to a new page.',
  ],
  alternatives: [
    { name: 'accordion', when: 'the sections should stack and expand in place instead of swapping behind a row of triggers — useful when more than one section might stay visible at once.' },
    { name: 'toggle-group', when: 'the control only changes a display filter with no distinct panel content per option, not full content sections.' },
  ],
  rules: [
    {
      id: 'trigger-value-matches-content',
      do: 'Give every TabsTrigger a matching TabsContent with the exact same `value` string, as every story here does, so the active tab always has a panel to show.',
      dont: 'Let a TabsTrigger\'s `value` drift out of sync with its TabsContent\'s `value` (a rename in one place but not the other) — the trigger still renders as active since its own value matches, but the panel area shows nothing because no TabsContent shares that value.',
      visual: true,
    },
    {
      id: 'variant-matches-context',
      do: 'Use the `default` (segmented/pill) variant for a self-contained content switcher, and `line` (underline) for a lighter-weight filter row.',
      dont: 'Mix both TabsList variants inconsistently for the same kind of switcher across a page — pick one variant per context so tabs read as one predictable pattern.',
      visual: false,
    },
  ],
  a11y: [
    'TabsTrigger renders `role="tab"` with `aria-selected` and `aria-controls` pointing at its panel — Base UI wires the full ARIA tabs pattern automatically.',
    'By default, arrow keys only move focus between tabs (`activateOnFocus` is `false`) — the panel doesn\'t change until the focused tab is activated with Enter, Space, or a click.',
    '`orientation="vertical"` switches the roving arrow-key navigation to Up/Down, sets `aria-orientation="vertical"` on TabsList, and moves the active-state indicator bar from the underline at the bottom to a bar on the trailing edge.',
  ],
  tokens: ['--muted', '--foreground', '--ring', '--background'],
}
