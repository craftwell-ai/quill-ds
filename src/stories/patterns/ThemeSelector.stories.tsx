import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from '@/components/ui/button'
import {
  ThemeSelector as ThemeSelectorBlock,
  type AccentValue,
  type ThemeValue,
} from '@registry/blocks/theme-selector'

const meta = {
  title: 'Patterns / Nav / Theme selector',
  parameters: { layout: 'centered' },
} satisfies Meta
export default meta
type Story = StoryObj

// Controlled demo: the selector drives data-theme AND data-accent on the
// preview card (the Storybook toolbar owns the canvas), so all sixteen
// theme × accent combinations can be tried in place. Installed uncontrolled,
// the block sets both attributes on <html> and persists to localStorage.
function Demo() {
  const [theme, setTheme] = useState<ThemeValue>('light')
  const [accent, setAccent] = useState<AccentValue>('terracotta')
  return (
    <div
      data-theme={theme}
      data-accent={accent}
      className="w-[520px] overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-colors max-sm:w-[320px]"
    >
      <nav className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <span className="font-heading text-lg text-foreground">Quill</span>
        <ThemeSelectorBlock
          value={theme}
          onValueChange={setTheme}
          accent={accent}
          onAccentChange={setAccent}
        />
      </nav>
      <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
        <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--text-accent-color)]">
          Issue Nº 001
        </span>
        <h2 className="font-heading text-2xl text-foreground">Distinctive yet familiar.</h2>
        <p className="max-w-[42ch] text-sm text-muted-foreground">
          Every artifact in the collection is approachable and accessible for everyday
          use by people —{' '}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="font-medium text-[var(--link)] underline underline-offset-2"
          >
            links follow the accent
          </a>
          .
        </p>
        <Button className="mt-2">Browse the collection</Button>
        <div className="mt-3 flex gap-2" aria-hidden>
          <span className="size-3.5 rounded-full bg-terracotta" />
          <span className="size-3.5 rounded-full bg-moss" />
          <span className="size-3.5 rounded-full bg-indigo-brand" />
          <span className="size-3.5 rounded-full bg-gold" />
        </div>
      </div>
    </div>
  )
}

export const ThemeSelector: Story = {
  render: () => <Demo />,
}
