export const usage = {
  name: 'avatar',
  kind: 'component',
  summary: 'A round image, initials, or icon representing a person or entity — reserves its shape immediately and swaps in the real photo once it loads.',
  useWhen: [
    'You need to represent a person or entity visually — a profile photo, initials, or a generic icon — in a list row, header, or comment.',
    'You need to show a cluster of related people (assignees, collaborators) — pair Avatar with AvatarGroup.',
  ],
  alternatives: [
    { name: 'item', when: 'the avatar is one part of a larger list row with a title and actions — compose it inside ItemMedia rather than styling Avatar standalone.' },
  ],
  rules: [
    {
      id: 'always-fallback',
      do: 'Always render an AvatarFallback with 1–2 character initials as a sibling of AvatarImage.',
      dont: 'Render AvatarImage with no AvatarFallback — a broken, slow, or missing image leaves a blank circle with nothing to look at.',
      visual: true,
    },
    {
      id: 'group-overlap',
      do: 'Use AvatarGroup to overlap a cluster of avatars and AvatarGroupCount (e.g. "+4") to cap how many render.',
      dont: 'Lay out many avatars edge-to-edge in a plain flex row — with no overlap or ring they read as an unrelated list, not one group.',
      visual: false,
    },
  ],
  a11y: [
    'AvatarFallback renders whenever the image status is not "loaded" — idle, loading, or error — so the fallback initials are always the accessible content until a real image lands.',
    'AvatarImage needs a real `alt` attribute naming the person or entity; Avatar itself renders a plain `<span>` with no built-in accessible name of its own.',
  ],
  tokens: ['--paper-deep', '--ink-muted', '--line-soft', '--primary', '--primary-foreground', '--background'],
}
