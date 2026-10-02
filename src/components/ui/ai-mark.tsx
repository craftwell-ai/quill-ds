// The site's copy of the consumer-facing AiMark. Blocks import it from
// `@/components/ui/ai-mark` — the path the `@quill/ai-mark` item installs to —
// so the same source compiles here and there. One implementation lives in
// `registry/lib`; this file only re-exports it.
export { AiMark } from '@registry/lib/ai-mark'
