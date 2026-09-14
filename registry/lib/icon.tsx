'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { icons } from './icons.core.mjs'

// Consumer cut of the Quill <Icon>: renders Material Symbols (outlined, wt 400)
// from the bundled core map. The full design-system repo lazy-loads the entire
// library; this standalone version covers every icon the Quill blocks use.
// Unknown names render an empty, size-reserved placeholder.

type IconData = { viewBox: string; paths: string[] }

// Permissive by design: the standalone cut cannot know the full library union,
// so IconName is plain string here — the design-system repo narrows it. Apps
// import this type, so it must stay exported (dropping it broke a consumer
// build in the v0.5.0 sync).
type IconName = string

const coreIcons = icons as Record<string, IconData>

// Dev-only: an unknown name is a silent empty box in production, which is the
// right failure for an app's users and the wrong one for its developers. Warn
// once per name so a typo, or an icon outside the shipped core set, shows up in
// the console instead of as a blank the size of an icon.
const warned = new Set<string>()
function warnUnknown(name: string) {
  if (process.env.NODE_ENV === 'production' || warned.has(name)) return
  warned.add(name)
  console.warn(
    `[quill] <Icon name="${name}"> is not in the bundled core set (components/ui/icons.core.mjs), ` +
      'so it renders as an empty box. Use a core name, or add the icon to the core set in the design system.'
  )
}

function Icon({
  name,
  size = '1em',
  className,
  'aria-label': ariaLabel,
  ...props
}: React.SVGProps<SVGSVGElement> & { name: IconName; size?: number | string }) {
  const data = coreIcons[name]
  if (!data) warnUnknown(name)
  const viewBox = data?.viewBox ?? '0 0 24 24'

  return (
    <svg
      data-slot="icon"
      viewBox={viewBox}
      width={size}
      height={size}
      fill="currentColor"
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={cn('inline-block shrink-0', className)}
      {...props}
    >
      {data?.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}

export { Icon, type IconName }
