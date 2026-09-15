"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { Icon } from "@/components/ui/icon"

/** A toast-notification stack for transient feedback about an action just taken — mount one Toaster at the app root, then trigger toasts imperatively with the `toast()` function from `sonner`. */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <Icon name="check_circle" className="size-4" />
        ),
        info: (
          <Icon name="info" className="size-4" />
        ),
        warning: (
          <Icon name="warning" className="size-4" />
        ),
        error: (
          <Icon name="dangerous" className="size-4" />
        ),
        loading: (
          <Icon name="progress_activity" className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
