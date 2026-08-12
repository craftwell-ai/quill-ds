import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Sync-proof fixture for the Figma → code round trip. Every visual property
// maps 1:1 to the token-bound component on the ❖ Test page in Figma
// (fill→shadcn/card, stroke→shadcn/border, radius→corner-radius/2xl,
// padding→spacing/8, gap→spacing/3, shadow→Elevation/lg; footer buttons are
// ❖ Button instances → <Button>). Not part of the registry.
// Last synced with Figma: 2026-08-12 (node 371:7), direction code → Figma.
function TestCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="test-card"
      className={cn(
        "flex w-72 flex-col gap-3 rounded-2xl border bg-card p-8 text-card-foreground shadow-lg",
        className
      )}
      {...props}
    >
      <div data-slot="test-card-title" className="font-heading text-base font-medium">
        Acknowledgement № 001
      </div>
      <p data-slot="test-card-body" className="text-sm text-muted-foreground">
        Do you agree that this is the best looking design system that has ever
        existed?
      </p>
      <div data-slot="test-card-footer" className="flex gap-3">
        <Button variant="outline">Decline</Button>
        <Button>Agree</Button>
      </div>
    </div>
  )
}

export { TestCard }
