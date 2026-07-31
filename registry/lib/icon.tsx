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

function Icon({
  name,
  size = '1em',
  className,
  'aria-label': ariaLabel,
  ...props
}: React.SVGProps<SVGSVGElement> & { name: IconName; size?: number | string }) {
  const data = coreIcons[name]
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
