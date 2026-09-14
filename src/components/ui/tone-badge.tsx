// The site's copy of the consumer-facing ToneBadge. Blocks import it from
// `@/components/ui/tone-badge` — the path the `@quill/tone-badge` item installs
// to in an app — so the same source compiles here and there. One
// implementation lives in `registry/lib`; this file only re-exports it.
export { ToneBadge, type Tone } from '@registry/lib/tone-badge'
