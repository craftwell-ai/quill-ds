export const usage = {
  name: 'resizable',
  kind: 'component',
  summary: 'Drag-resizable split panels — the user controls how space is divided between two or more regions by dragging a handle between them.',
  useWhen: [
    'You need a layout region whose split the user can adjust themselves by dragging — a file-tree/editor/preview layout, a resizable sidebar-and-content pane.',
  ],
  alternatives: [
    { name: 'scroll-area', when: 'the pane just needs a fixed size with its own scrollbar, not a user-draggable boundary.' },
    { name: 'tabs', when: 'you want to switch between views one at a time instead of showing multiple panes side-by-side permanently.' },
  ],
  rules: [
    {
      id: 'defaultsize-percentages-sum',
      do: 'Give every ResizablePanel a defaultSize that adds up to 100 across the group, as each story here does (50/50, 60/40, 25/50/25).',
      dont: 'Leave defaultSize unset or mismatched on some panels — panels can end up unevenly or unpredictably sized on first render.',
      visual: false,
    },
    {
      id: 'withhandle-for-visible-grip',
      do: 'Pass `withHandle` to ResizableHandle when the drag affordance needs to be visually obvious — it adds a small grip indicator on the divider.',
      dont: 'Leave the handle as a bare 1px line in a layout where users might not realize the boundary is draggable.',
      visual: true,
    },
  ],
  a11y: [
    'ResizableHandle renders as a real focusable `role="separator"` — arrow keys resize the adjoining panels, Home/End jump to the boundary extremes, and Enter collapses/expands, all without a pointer.',
    'ResizablePanel wraps its children in a `tabIndex={0}` focusable div, since the library\'s own internal scroll container isn\'t otherwise keyboard-reachable — this keeps the scrollable region satisfying the scrollable-region-focusable a11y rule.',
  ],
  tokens: ['--border', '--ring'],
}
