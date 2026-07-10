import { create } from 'storybook/theming'
import { managerTheme } from '../src/tokens/generated/manager-theme.mjs'

export default create({
  base: 'light',
  brandTitle: 'Quill Design System',
  brandImage: '/quill-lockup-sm-light.svg',
  brandUrl: '/',
  brandTarget: '_self',
  fontBase: '"Raleway", -apple-system, BlinkMacSystemFont, sans-serif',
  fontCode: 'ui-monospace, "SF Mono", Menlo, monospace',
  ...managerTheme,
})
