export const usage = {
  name: 'button-group',
  kind: 'component',
  summary: 'A structural wrapper that merges adjacent Buttons into one visually connected control — shared borders, no owned selection state.',
  useWhen: [
    'You have several related Buttons that should read as one compound control — sequential actions like prev/next, or a segmented set of mutually exclusive views.',
  ],
  alternatives: [
    { name: 'button', when: 'there is only one action — a single Button does not need a ButtonGroup wrapper.' },
    { name: 'toggle-group', when: 'the buttons need real pressed/selected state built in — ButtonGroup only merges borders and tracks no selection itself (see ActiveState, which manages it by hand).' },
  ],
  rules: [
    {
      id: 'use-outline-variant',
      do: 'Use variant="outline" on every Button inside a ButtonGroup — the group strips the shared inner border between items, which only reads as a seam when each button has a border to begin with.',
      dont: 'Group default (solid) Buttons — with no border to strip, they blend into one undifferentiated block instead of a visibly segmented control.',
      visual: true,
    },
    {
      id: 'no-owned-state',
      do: 'Treat ButtonGroup as a border-merging wrapper only — manage active or selected state yourself, or reach for ToggleGroup if that state should be built in.',
      dont: 'Expect ButtonGroup to track which button is active — it renders role="group" and merges borders, nothing else.',
      visual: false,
    },
  ],
  a11y: [
    'Renders a plain `<div role="group">` — a semantic hint that the buttons are related; every child Button still needs its own accessible name, such as aria-label on icon-only buttons.',
    'No built-in roving keyboard navigation — Tab moves through each Button individually, unlike ToggleGroup toolbar-style arrow-key behavior.',
    'ButtonGroupSeparator renders role="separator" but is non-focusable and sits outside the tab order — it does not interrupt tabbing through the buttons.',
  ],
  tokens: ['--border', '--muted', '--input', '--radius-lg'],
}
