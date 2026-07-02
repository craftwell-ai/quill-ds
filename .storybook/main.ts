import type { StorybookConfig } from '@storybook/nextjs-vite'

const config: StorybookConfig = {
  stories: [
    '../src/stories/docs/**/*.mdx',
    '../src/stories/**/*.stories.{ts,tsx}',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-mcp',
  ],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../src/stories/assets'],
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
