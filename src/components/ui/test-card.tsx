import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Sync-proof fixture for the Figma → code round trip. Every visual property
// maps 1:1 to the token-bound component on the ❖ Test page in Figma
// (fill→shadcn/card, stroke→shadcn/border, radius→corner-radius/2xl,
// padding→spacing/8, gap→spacing/3, shadow→Elevation/lg; footer buttons are
// ❖ Button instances → <Button>). Not part of the registry.
// Last synced with Figma: 2026-08-13 (node 371:7), direction Figma → code.
// Body copy is kept on ONE source line on purpose: the daily figma-parity bot
// can only auto-repair a text change when the old value appears exactly once in
// this file, and JSX line-wrapping hides it from that check.
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
        Title
      </div>
      <p data-slot="test-card-body" className="text-sm text-muted-foreground">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit duis auctor ex ac molestie blandit.
      </p>
      <div data-slot="test-card-footer" className="flex gap-3">
        <Button variant="outline">Button</Button>
        <Button>Button</Button>
      </div>
    </div>
  )
}

export { TestCard }
