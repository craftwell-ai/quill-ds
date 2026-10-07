/**
 * What the Paper file holds: one page per piece, as the Figma library has and as the
 * owner's other Paper library ("Mantis Design System") is laid out.
 *
 *   Foundations
 *   ❖ <Component>   one page per component, title case, alphabetical
 *   ◆ <Block>       one page per block
 *   ▣ <Template>    one page per page template
 *
 * Each page holds one 1440px artboard named after the piece: a header (name and the
 * one-line summary from its usage module) and one labelled section per story worth
 * drawing. Stories that exist only to assert something (a focus test, a contrast check)
 * are not design and are left out by hand here: nothing in a story says which kind it is.
 *
 * This is the spike's set. The full sync would derive the list from registry.json.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { blockHash } from '../figma-stamp.mjs'
import { root } from './file.mjs'

export const KINDS = {
  component: { mark: '❖', eyebrow: 'Quill · Component' },
  block: { mark: '◆', eyebrow: 'Quill · Block' },
  template: { mark: '▣', eyebrow: 'Quill · Template' },
}

export const PIECES = [
  {
    slug: 'approval-card',
    name: 'Approval Card',
    kind: 'component',
    sources: ['registry/lib/approval-card.tsx', 'src/stories/approval-card.stories.tsx'],
    stories: ['components-approvalcard--send-email', 'components-approvalcard--destructive', 'components-approvalcard--not-editable'],
  },
  {
    slug: 'button',
    name: 'Button',
    kind: 'component',
    sources: ['src/components/ui/button.tsx', 'src/stories/button.stories.tsx'],
    stories: ['components-button--all-variants', 'components-button--all-sizes', 'components-button--with-icon', 'components-button--icon-only', 'components-button--disabled'],
  },
  {
    slug: 'tone-badge',
    name: 'Tone Badge',
    kind: 'component',
    sources: ['registry/lib/tone-badge.tsx', 'src/stories/tone-badge.stories.tsx'],
    stories: ['components-tonebadge--all-tones', 'components-tonebadge--tinted', 'components-tonebadge--solid', 'components-tonebadge--small'],
  },
  {
    slug: 'usage-meter',
    name: 'Usage Meter',
    kind: 'component',
    sources: ['registry/lib/usage-meter.tsx', 'src/stories/usage-meter.stories.tsx'],
    stories: ['components-usagemeter--card', 'components-usagemeter--bar', 'components-usagemeter--running-low-card', 'components-usagemeter--compact', 'components-usagemeter--compact-low'],
  },
  {
    slug: 'conversation-history',
    name: 'Conversation History',
    kind: 'block',
    sources: ['registry/blocks/conversation-history.tsx', 'src/stories/patterns/ConversationHistory.stories.tsx'],
    stories: ['patterns-ai-conversation-history--default', 'patterns-ai-conversation-history--groups-by-date', 'patterns-ai-conversation-history--empty'],
  },
]

/** `usage-meter / card`: the layer that holds one converted story. */
export const pieceLayerName = (piece, storyId) => `${piece.slug} / ${storyId.split('--')[1]}`

export const pageName = (piece) => `${KINDS[piece.kind].mark} ${piece.name}`

/** Pages in the order the file shows them: components A–Z, then blocks, then templates. */
export function pageOrder(pieces = PIECES) {
  const rank = Object.keys(KINDS)
  return [...pieces].sort((a, b) => rank.indexOf(a.kind) - rank.indexOf(b.kind) || a.name.localeCompare(b.name)).map(pageName)
}

/** The code behind a piece, hashed the way the Figma stamp is: comments and whitespace do not count. */
export function sourceHash(piece, read = (path) => readFileSync(join(root, path), 'utf8')) {
  return blockHash([...piece.sources, usagePath(piece)].map(read).join('\n'))
}

export const usagePath = (piece) => `src/usage/${piece.slug}.usage.mjs`

export async function summaryOf(piece) {
  const { usage } = await import(pathToFileURL(join(root, usagePath(piece))).href)
  return usage.summary
}

/** `components-button--all-variants` → `All variants`, when Storybook's index is not at hand. */
export const storyTitle = (storyId) => { const words = storyId.split('--')[1].replace(/-/g, ' '); return words[0].toUpperCase() + words.slice(1) }

/** Pieces whose code has moved since they were written into Paper. Reads files only: safe in CI. */
export function stalePieces(state, pieces = PIECES) {
  return pieces.map((piece) => {
    const recorded = state.pieces.find((entry) => entry.slug === piece.slug)
    const now = sourceHash(piece)
    if (!recorded) return { slug: piece.slug, status: 'never synced', now }
    return { slug: piece.slug, status: recorded.sourceHash === now ? 'in step' : 'stale', now, recorded: recorded.sourceHash, syncedAt: recorded.syncedAt }
  })
}
