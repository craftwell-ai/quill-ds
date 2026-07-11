import type { Decorator, Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css'
import quillTheme from './quill-theme'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '../src/components/ui/sonner'

// data-theme attribute value → preview canvas ground (paper token per theme)
const THEME_BG: Record<string, string> = {
  light: '#F5EDDD',
  dark: '#20180E',
  'classic-light': '#FFFFFF',
  'classic-dark': '#000000',
}

export const globalTypes = {
  theme: {
    name: 'Theme',
    defaultValue: 'light',
    toolbar: {
      icon: 'circlehollow',
      items: [
        { value: 'light', title: 'Dawn' },
        { value: 'dark', title: 'Dusk' },
        { value: 'classic-light', title: 'Classic Light' },
        { value: 'classic-dark', title: 'Classic Dark' },
      ],
      dynamicTitle: true,
    },
  },
  accent: {
    name: 'Accent',
    defaultValue: 'terracotta',
    toolbar: {
      icon: 'paintbrush',
      items: [
        { value: 'terracotta', title: 'Terracotta' },
        { value: 'moss', title: 'Moss' },
        { value: 'indigo', title: 'Indigo' },
        { value: 'gold', title: 'Gold' },
      ],
      dynamicTitle: true,
    },
  },
}

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals['theme'] ?? 'light'
  const accent = context.globals['accent'] ?? 'terracotta'
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme={theme}
      forcedTheme={theme}
      themes={['light', 'dark', 'classic-light', 'classic-dark']}
    >
      <div
        data-theme={theme}
        data-accent={accent}
        style={{
          background: THEME_BG[theme] ?? THEME_BG.light,
          padding: 24,
          minHeight: '100vh',
        }}
      >
        <Story />
        <Toaster position="bottom-right" />
      </div>
    </ThemeProvider>
  )
}

export const decorators: Decorator[] = [withTheme]

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
