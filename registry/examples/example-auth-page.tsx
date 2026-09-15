import { SplitPanel } from '@/components/quill/login-split-panel'

/**
 * An auth page, composed: login-split-panel alone. Signing in is one task, so
 * nothing else shares the viewport — no navbar, no footer, no promo strip.
 */
export function ExampleAuthPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SplitPanel />
    </div>
  )
}
