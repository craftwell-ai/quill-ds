import { beforeAll } from 'vitest'
import { setProjectAnnotations } from '@storybook/nextjs-vite'
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview'
import * as projectAnnotations from './preview'
import * as doDontGuard from './do-dont-guard'

// Applies the Storybook preview config (theme decorator, globals, parameters)
// to every story rendered inside the Vitest browser tests. The a11y addon
// annotations must be included here so axe actually runs against each story. The Do/Don't guard is test-only (it
// needs the browser's viewport control), so it joins here rather than in preview.tsx.
const project = setProjectAnnotations([a11yAddonAnnotations, projectAnnotations, doDontGuard])

beforeAll(project.beforeAll)
