import type { Decorator, Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css'
import quillTheme from './quill-theme'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '../src/components/ui/sonner'
import { useRef } from 'react'
import { useOverlaySpace } from './use-overlay-space'
import { tokens } from '../src/tokens/quill.tokens.mjs'
import { ALL_MODES, DEFAULT_MODE, DEFAULT_ACCENT } from '../src/tokens/themes.mjs'

// data-theme attribute value → preview canvas ground (the paper token per theme).
// Derived, not typed: this map, the toolbar items and the ThemeProvider list below
// were three separate hand-kept copies of the theme set, and all three silently
// stopped at four when the Intelligent theme shipped — so it could not be previewed
// at all, and would have rendered on Dawn cream if it had been selectable.
const THEME_BG: Record<string, string> = Object.fromEntries(
  ALL_MODES.map((m) => [m.attr, tokens.color.paper.base[m.key]]),
)

const THEME_ITEMS = ALL_MODES.map((m) => ({ value: m.attr, title: m.label }))
const THEME_VALUES = ALL_MODES.map((m) => m.attr)

// Titles are the pigment names; capitalised for the toolbar only.
const ACCENT_ITEMS = Object.keys(tokens.accents).map((a) => ({
  value: a,
  title: a[0].toUpperCase() + a.slice(1),
}))

export const globalTypes = {
  theme: {
    name: 'Theme',
    defaultValue: DEFAULT_MODE.attr,
    toolbar: {
      icon: 'circlehollow',
      items: THEME_ITEMS,
      dynamicTitle: true,
    },
  },
  accent: {
    name: 'Accent',
    defaultValue: DEFAULT_ACCENT,
    toolbar: {
      icon: 'paintbrush',
      items: ACCENT_ITEMS,
      dynamicTitle: true,
    },
  },
}

export const CANVAS_PADDING = 24

const WithTheme: Decorator = (Story, context) => {
  const theme = context.globals['theme'] ?? DEFAULT_MODE.attr
  const accent = context.globals['accent'] ?? DEFAULT_ACCENT
  const isFullscreen = context.parameters.layout === 'fullscreen'
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  useOverlaySpace(wrapperRef, CANVAS_PADDING)

  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme={theme}
      forcedTheme={theme}
      themes={THEME_VALUES}
    >
      <div
        ref={wrapperRef}
        data-theme={theme}
        data-accent={accent}
        style={{
          background: THEME_BG[theme] ?? THEME_BG[DEFAULT_MODE.attr],
          padding: CANVAS_PADDING,
          ...(isFullscreen ? { minHeight: '100vh' } : {}),
        }}
      >
        <Story />
        <Toaster position="bottom-right" />
      </div>
    </ThemeProvider>
  )
}

export const decorators: Decorator[] = [WithTheme]

const preview: Preview = {
  parameters: {
    docs: {
      theme: quillTheme,
    },
    backgrounds: {
      disable: true,
    },
    layout: 'centered',
    options: {
      storySort: {
        order: [
          'Foundations',
          ['Introduction', 'Colors', 'Typography', 'Spacing', 'Elevation', 'Tokens', 'Icons'],
          'Components',
          'Patterns',
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'error',
    },
  },
}

export default preview
