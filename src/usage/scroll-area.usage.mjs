export const usage = {
  name: 'scroll-area',
  kind: 'component',
  summary: 'A styled custom scrollbar over a fixed-size scrollable region — replaces the browser\'s native scrollbar chrome without changing scroll behavior.',
  useWhen: [
    'You need a scrollable region (a list, a card body) with a consistently styled scrollbar instead of each OS/browser\'s native chrome, inside an explicit height or width you set.',
  ],
  alternatives: [
    { name: 'pagination', when: 'the list is long enough that paging through discrete chunks reads better than one continuously scrolling region.' },
    { name: 'resizable', when: 'the region\'s size itself should be user-adjustable by dragging, not fixed with an internal scrollbar.' },
  ],
  rules: [
    {
      id: 'set-explicit-size',
      do: 'Give ScrollArea an explicit height and/or width (e.g. `h-64 w-56`), as every story here does — the region needs a fixed size to know when to show a scrollbar.',
      dont: 'Drop ScrollArea into a layout with no height constraint — content just grows the container instead of ever scrolling.',
      visual: true,
    },
    {
      id: 'horizontal-needs-scrollbar',
      do: 'Add `<ScrollBar orientation="horizontal" />` when the content scrolls sideways — ScrollArea only renders a vertical scrollbar by default.',
      dont: 'Rely on the default vertical ScrollBar for a horizontally-scrolling row of content — there\'s no visible scrollbar or affordance for the sideways scroll.',
      visual: false,
    },
  ],
  a11y: [
    'The scrollable Viewport carries `focus-visible:ring` and is keyboard-focusable, so keyboard users can Tab to it and scroll with arrow keys even though the custom scrollbar itself isn\'t a native control.',
    'ScrollBar\'s Thumb is presentation only — the real, keyboard- and screen-reader-operable scrolling happens on the Viewport underneath it.',
  ],
  tokens: ['--border', '--ring'],
}
