export const usage = {
  name: 'skeleton',
  kind: 'component',
  summary: "An animate-pulse loading placeholder that reserves space and previews the shape of content while it loads.",
  useWhen: [
    "You need a loading placeholder for content that hasn't arrived yet (a list row, an avatar, a card) and want to reserve its layout space instead of causing a jump when the real content appears.",
  ],
  alternatives: [
    { name: 'empty', when: 'loading has finished and there is confirmed to be no data — swap to Empty once you know the result, not while still waiting.' },
  ],
  rules: [
    {
      id: 'match-content-dimensions',
      do: 'Size each Skeleton to match the real content it stands in for — a circle sized like the avatar, text lines at the real line-height and width proportions.',
      dont: 'Use one generic block-shaped Skeleton to cover a whole region — the layout shifts once real content (a circular avatar, several text lines) replaces it.',
      visual: true,
    },
    {
      id: 'compose-the-real-layout',
      do: 'Compose several Skeletons in the same layout as the real content (avatar + two text lines, as CardSkeleton does) so the loading state previews the eventual shape.',
      dont: "Center one large Skeleton in the space with no relation to the content's actual structure — it reads as a generic spinner, not a preview of what's coming.",
      visual: false,
    },
  ],
  a11y: [
    'Skeleton is purely decorative — it renders a plain `<div>` with no ARIA role, so wrap the loading region in a container with `aria-busy="true"` (or an `aria-live` region announcing "Loading…") if screen-reader users need to know content is on the way.',
  ],
  tokens: ['--muted'],
}
