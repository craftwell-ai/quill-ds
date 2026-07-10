import type { StorybookConfig } from '@storybook/nextjs-vite'
import remarkGfm from 'remark-gfm'

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
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-mcp',
  ],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../src/stories/assets'],
  // Brand favicon (the quill feather) in the manager tab, served from staticDirs root.
  managerHead: (head) => `
    ${head}
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <link rel="apple-touch-icon" href="./apple-touch-icon.png" />
  `,
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => ({
    ...config,
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
