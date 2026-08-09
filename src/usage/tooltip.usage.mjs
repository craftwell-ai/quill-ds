export const usage = {
  name: 'tooltip',
  kind: 'component',
  summary: 'A short hint that appears on hover or focus — a supplementary visual label for sighted mouse and keyboard users, not a reliable way to deliver essential information.',
  useWhen: [
    'You need a one-line supplementary hint on a control that already has its own visible label or accessible name.',
  ],
  alternatives: [
    { name: 'popover', when: 'the content is interactive or essential to understanding the control — Popover (with its openOnHover prop, if hover is still desired) reaches touch and screen-reader users; Tooltip does not.' },
    { name: 'hover-card', when: 'the hover target is a link and the content is a richer preview (avatar, bio) rather than a one-line hint.' },
  ],
  rules: [
    {
      id: 'wrap-in-provider',
      do: 'Wrap your tree in one TooltipProvider near the root, the way the Storybook decorator does for every story on this page.',
      dont: 'Instantiate a separate TooltipProvider around every individual Tooltip — the shared delay/closeDelay grouping only works when sibling tooltips share one provider.',
      visual: false,
    },
    {
      id: 'tooltip-is-supplementary',
      do: 'Use Tooltip to add a hint alongside a control that already has a visible label or its own accessible name.',
      dont: 'Put essential meaning only in the tooltip on an unlabeled icon button — touch and screen-reader users never see it.',
      visual: true,
    },
  ],
  a11y: [
    'Tooltips are visual-only: not accessible to touch or screen-reader users. The trigger needs its own accessible name (visible text or aria-label) — the tooltip is never a substitute for one.',
    "If the content is important to understanding the control, don't hide it behind a tooltip — use inline text, or Popover if space is limited.",
    "This library's TooltipProvider defaults delay to 0ms (near-instant open) rather than Base UI's default 600ms — pass delay explicitly to add hover-intent time back.",
  ],
  tokens: ['--foreground', '--background', '--radius-md'],
}
