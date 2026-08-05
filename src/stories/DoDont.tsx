import type { ReactNode } from 'react'
import type { Usage } from '@/usage/types'

/**
 * Side-by-side Do/Don't frame for docs pages. The caption text comes from the
 * usage file by rule id, so the rendered example can never drift from the
 * written rule — scripts/usage-coverage.test.mjs enforces the pairing.
 * Docs-only chrome: Do is framed with --primary (ink), Don't with --destructive.
 */
export function DoDontPair({
  usage,
  id,
  doExample,
  dontExample,
}: {
  usage: Usage
  id: string
  doExample: ReactNode
  dontExample: ReactNode
}) {
  const rule = usage.rules.find((r) => r.id === id)
  if (!rule) throw new Error(`No rule '${id}' in usage for '${usage.name}'`)
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <figure className="flex flex-col gap-3 rounded-xl border border-t-4 border-t-primary p-4">
        <div>{doExample}</div>
        <figcaption className="text-sm">
          <strong>Do.</strong> {rule.do}
        </figcaption>
      </figure>
      <figure className="flex flex-col gap-3 rounded-xl border border-t-4 border-t-destructive p-4">
        <div>{dontExample}</div>
        <figcaption className="text-sm">
          <strong>Don&apos;t.</strong> {rule.dont}
        </figcaption>
      </figure>
    </div>
  )
}
