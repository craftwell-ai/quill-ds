import type { StorybookConfig } from '@storybook/nextjs-vite'
import remarkGfm from 'remark-gfm'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

// Vite inlines CSS @imports itself before Tailwind runs, and in doing so drops the
// block-form custom variants that `shadcn/tailwind.css` defines (`@custom-variant
// data-horizontal { &:where(…) { @slot } }`). Tailwind then falls back to its generic
// `data-*` variant, so every data-active / data-open / data-checked / data-horizontal
// state of the stock primitives was dead in Storybook while the Next site (Turbopack)
// rendered them right — Tabs stacked sideways, active triggers unstyled (found by the
// visual diff, 2026-09-23). Quill's own one-line `@custom-variant dark (…)` and the
// `@theme` block survive the same inlining; only this file needs the help. Splicing its
// contents into the entry before Vite's CSS stage is the smallest fix.
const require = createRequire(import.meta.url)
const inlineShadcnTailwind = () => ({
  name: 'quill:inline-shadcn-tailwind-css',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    if (!id.endsWith('/src/app/globals.css') || !code.includes('@import "shadcn/tailwind.css";')) return null
    return { code: code.replace('@import "shadcn/tailwind.css";', readFileSync(require.resolve('shadcn/tailwind.css'), 'utf8')), map: null }
  },
})

const config: StorybookConfig = {
  stories: [
    '../src/stories/**/*.mdx',
    '../src/stories/**/*.stories.{ts,tsx}',
  ],
  addons: [
    {
      // Storybook's MDX no longer parses markdown tables by default; remark-gfm restores them
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    '@storybook/addon-mcp',
  ],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../src/stories/assets'],
  // Brand favicon (the quill feather) in the manager tab, served from staticDirs root.
  // The early background style stops the white flash before the manager theme loads.
  managerHead: (head) => `
    ${head}
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <link rel="apple-touch-icon" href="./apple-touch-icon.png" />
    <style>html, body { background: #F5EDDD; }</style>
  `,
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => ({
    ...config,
    plugins: [inlineShadcnTailwind(), ...(config.plugins ?? [])],
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@storybook/blocks': '@storybook/addon-docs/blocks',
      },
    },
  }),
}

export default config
