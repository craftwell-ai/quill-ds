import { beforeAll } from 'vitest'
import { setProjectAnnotations } from '@storybook/nextjs-vite'
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview'
import * as projectAnnotations from './preview'

// Applies the Storybook preview config (theme decorator, globals, parameters)
// to every story rendered inside the Vitest browser tests. The a11y addon
// annotations must be included here so axe actually runs against each story.
const project = setProjectAnnotations([a11yAddonAnnotations, projectAnnotations])

beforeAll(project.beforeAll)
