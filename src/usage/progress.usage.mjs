export const usage = {
  name: 'progress',
  kind: 'component',
  summary: 'A determinate progress bar for a real, measurable completion value — pass a numeric `value` and pair it with ProgressLabel/ProgressValue for a labeled, live-updating readout.',
  useWhen: [
    'You have a real, known completion percentage to show (upload progress, a multi-step setup) — not an open-ended wait with no known duration.',
  ],
  alternatives: [
    { name: 'spinner', when: 'the wait has no known duration or percentage — indeterminate loading needs a spinner, not a fabricated progress value.' },
    { name: 'skeleton', when: 'content is still loading and you want to preview its eventual shape, not report a numeric completion percentage.' },
  ],
  rules: [
    {
      id: 'label-with-progresslabel',
      do: "Pair Progress with ProgressLabel so its id is auto-wired to the root's aria-labelledby, as every story here does.",
      dont: 'Render a bare Progress with only a `value` and no ProgressLabel or aria-label — the bar has no accessible name.',
      visual: true,
    },
    {
      id: 'determinate-only',
      do: 'Reserve Progress for a real, known completion value.',
      dont: "Animate a fake value climbing toward 100 to simulate progress — use Spinner's indeterminate state instead so users aren't misled about a real percentage existing.",
      visual: false,
    },
  ],
  a11y: [
    'Progress.Root renders `role="progressbar"` and computes `aria-valuemin`/`aria-valuemax`/`aria-valuenow` from `min`/`max`/`value` automatically — pass `value`, and don\'t hand-roll these attributes yourself.',
    "ProgressLabel's `id` auto-registers to the root's `aria-labelledby` — pass an explicit `aria-label` on Progress only when you skip ProgressLabel entirely.",
    'Omitting `value` (or passing `undefined`) renders indeterminate progress, with `aria-valuetext` set to "indeterminate progress" — for a genuinely indeterminate wait, prefer Spinner, which never implies a percentage exists.',
  ],
  tokens: ['--primary', '--input'],
}
