import type { Decorator, Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css'
import quillTheme from './quill-theme'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '../src/components/ui/sonner'

export const globalTypes = {
  theme: {
    name: 'Theme',
    defaultValue: 'light',
    toolbar: {
      icon: 'circlehollow',
      items: [
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' },
      ],
      dynamicTitle: true,
    },
  },
}

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals['theme'] ?? 'light'
  return (
    <ThemeProvider attribute="class" defaultTheme={theme} forcedTheme={theme}>
      <div
        className={theme === 'dark' ? 'dark' : ''}
        style={{
          background: theme === 'dark' ? '#1a1714' : '#F5EDDD',
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
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
}

export default preview
