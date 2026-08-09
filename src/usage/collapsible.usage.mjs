export const usage = {
  name: 'collapsible',
  kind: 'component',
  summary: 'A single open/closed disclosure toggle — the lower-level primitive behind Accordion, with no item/trigger/content grouping or built-in styling.',
  useWhen: [
    'You need one standalone show/hide toggle — a "view more" panel, an expandable filter section — without Accordion\'s multi-item structure.',
  ],
  alternatives: [
    { name: 'accordion', when: 'you have several related items that should share expand/collapse semantics as a group, with only one (or a chosen few) open at once.' },
  ],
  rules: [
    {
      id: 'pair-trigger-with-icon-rotation',
      do: 'Pair CollapsibleTrigger with a chevron icon that rotates on open, as the story does, so the toggle state reads visually.',
      dont: 'Ship a bare text trigger with no open/closed affordance — users can\'t tell whether clicking will show or hide content.',
      visual: true,
    },
    {
      id: 'render-onto-real-control',
      do: 'When you swap the default `<button>` via `render` (e.g. onto a styled Button, as this story does), keep the target a real interactive element so focus and Enter/Space keep working.',
      dont: 'Pass `render` onto a plain `<div>` or `<span>` with no button semantics — you lose keyboard focusability and native activation.',
      visual: false,
    },
  ],
  a11y: [
    'CollapsibleTrigger renders a real `<button>` by default, with `aria-expanded` and `aria-controls` linked to the panel — the `render` prop, as used with Button in the story, swaps in a different element while keeping that same behavior and ARIA wiring.',
    'Collapsible ships with no built-in visual styling — the focus ring, hover state, and chevron rotation all come from what you render inside it, so build those affordances deliberately rather than assuming Accordion\'s look carries over.',
  ],
  tokens: [],
}
