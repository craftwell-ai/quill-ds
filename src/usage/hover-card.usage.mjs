export const usage = {
  name: 'hover-card',
  kind: 'component',
  summary: 'A glanceable preview that opens after a brief hover-intent delay on a link — a visual enhancement for sighted mouse and keyboard users, informational only.',
  useWhen: [
    'You need a richer preview on hover — a link destination, an author bio, expanded metadata — without navigating away.',
  ],
  alternatives: [
    { name: 'tooltip', when: 'you just need a short one-line hint on a control, not a rich preview.' },
    { name: 'popover', when: 'the interaction should be an explicit click rather than hover.' },
  ],
  rules: [
    {
      id: 'informational-only',
      do: 'Keep HoverCard content informational — preview text, an avatar, metadata a user only needs to glance at.',
      dont: 'Put an interactive control (a button, a form) inside HoverCard — hover is unreliable on touch devices, so the action becomes unreachable there.',
      visual: true,
    },
    {
      id: 'preview-not-exclusive',
      do: 'Treat the hover card as a bonus preview — keep the same information reachable by visiting the link itself.',
      dont: 'Make the hover card the only place certain information lives — preview cards are a sighted mouse/keyboard enhancement only; touch and screen-reader users never see them.',
      visual: false,
    },
  ],
  a11y: [
    'Preview cards are visual-only, like Tooltip — not accessible to touch or screen-reader users. Never put unique or essential information only in the popup.',
    'Opens after an intent delay (600ms by default) rather than instantly, so a cursor merely passing over the trigger doesn\'t fire it.',
    'HoverCardTrigger renders as a link — give it real link text or an aria-label; the popup content is not the trigger\'s accessible name.',
  ],
  tokens: ['--popover', '--shadow-md', '--radius-lg'],
}
