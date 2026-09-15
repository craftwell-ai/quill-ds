import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/icon"

/** An indeterminate loading indicator — a spinning icon that inherits its color from `currentColor`, for waits with no known duration or percentage. */
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Icon role="status" aria-label="Loading" {...props} name="progress_activity" className={cn("size-4 animate-spin", className)} />
  )
}

export { Spinner }
