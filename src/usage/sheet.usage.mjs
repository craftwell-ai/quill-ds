export const usage = {
  name: 'sheet',
  kind: 'component',
  summary: 'A panel that slides in from a screen edge while the page stays visible behind it — the same Base UI dialog underneath Dialog, styled as an edge panel instead of a centered card.',
  useWhen: [
    'You need secondary context or a task panel sliding in from an edge, with the underlying page still visible — settings, item detail, a share menu.',
  ],
  alternatives: [
    { name: 'drawer', when: 'you want the same edge-panel layout with drag-to-dismiss on touch — Drawer adds Vaul\'s swipe gesture.' },
    { name: 'dialog', when: 'the task is a focused, centered action rather than an edge panel.' },
  ],
  rules: [
    {
      id: 'side-matches-content-role',
      do: 'Pick side by role — right for settings/detail, left for navigation, bottom for mobile actions.',
      dont: 'Default every Sheet to the same side regardless of content — a settings panel and a nav menu should read as spatially different jobs.',
      visual: false,
    },
    {
      id: 'title-required',
      do: 'Always render SheetTitle — it is the sheet\'s accessible name, announced when it opens.',
      dont: 'Skip SheetTitle because the panel\'s context looks obvious on screen — screen reader users still need an announced name.',
      visual: false,
    },
    {
      id: 'descriptive-trigger-label',
      do: 'Label the trigger with the destination — "Open Settings" — since the panel\'s content is hidden until it opens.',
      dont: 'Use a generic label like "Open" — the user has no idea what\'s inside until they click.',
      visual: true,
    },
  ],
  a11y: [
    'Focus moves into the sheet on open and returns to the trigger on close, the same as Dialog.',
    'Escape closes the sheet; clicking the backdrop also closes it since Sheet is non-destructive.',
    'Keep the default close button, or pass showCloseButton={false} only when a footer button (usually SheetClose) offers an explicit way out.',
  ],
  tokens: ['--popover', '--shadow-lg', '--border'],
}
