import { cn } from "@/lib/utils"

/** Constrains any child to a fixed width-to-height ratio — a CSS-only box, most often used to reserve space for images, video embeds, and thumbnails. */
function AspectRatio({
  ratio,
  className,
  ...props
}: React.ComponentProps<"div"> & { ratio: number }) {
  return (
    <div
      data-slot="aspect-ratio"
      style={
        {
          "--ratio": ratio,
        } as React.CSSProperties
      }
      className={cn("relative aspect-(--ratio)", className)}
      {...props}
    />
  )
}

export { AspectRatio }
