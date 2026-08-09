# skeleton (component)

An animate-pulse loading placeholder that reserves space and previews the shape of content while it loads.

### When to use
- You need a loading placeholder for content that hasn't arrived yet (a list row, an avatar, a card) and want to reserve its layout space instead of causing a jump when the real content appears.

### Reach for instead
- **empty** — when loading has finished and there is confirmed to be no data — swap to Empty once you know the result, not while still waiting.

### Rules
- **Do:** Size each Skeleton to match the real content it stands in for — a circle sized like the avatar, text lines at the real line-height and width proportions. **Don't:** Use one generic block-shaped Skeleton to cover a whole region — the layout shifts once real content (a circular avatar, several text lines) replaces it.
- **Do:** Compose several Skeletons in the same layout as the real content (avatar + two text lines, as CardSkeleton does) so the loading state previews the eventual shape. **Don't:** Center one large Skeleton in the space with no relation to the content's actual structure — it reads as a generic spinner, not a preview of what's coming.

### Accessibility
- Skeleton is purely decorative — it renders a plain `<div>` with no ARIA role, so wrap the loading region in a container with `aria-busy="true"` (or an `aria-live` region announcing "Loading…") if screen-reader users need to know content is on the way.

### Design tokens
`--muted`

