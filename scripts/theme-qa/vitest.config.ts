import path from 'node:path'
import { defineConfig } from 'vitest/config'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'

// Copy of the repo's vitest.config.ts storybook project with one difference:
// every story starts on the theme named by QUILL_THEME (a data-theme attr from
// src/tokens/themes.mjs — dark, classic-light, classic-dark, intelligent), so
// axe runs against that theme's colours. `npm run test-storybook` covers Dawn.
const repo = path.resolve(__dirname, '../..')
const theme = process.env.QUILL_THEME ?? 'light'

export default defineConfig({
  root: repo,
  define: { __QUILL_THEME__: JSON.stringify(theme) },
  test: {
    projects: [
      {
        extends: true,
        // The plugin's own initialGlobals win over anything set in setProjectAnnotations.
        plugins: [storybookTest({ configDir: path.join(repo, '.storybook'), initialGlobals: { theme } })],
        test: {
          name: 'storybook',
          exclude: ['**/._*', '**/node_modules/**'],
          setupFiles: [path.join(__dirname, 'setup.ts')],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
