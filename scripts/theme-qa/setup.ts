import { afterEach, beforeAll } from 'vitest'
import { setProjectAnnotations } from '@storybook/nextjs-vite'
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview'
import * as projectAnnotations from '../../.storybook/preview'

// Injected by vitest.config.ts next to this file (`define`), one theme per run.
declare const __QUILL_THEME__: string

// Same composition as .storybook/vitest.setup.ts. The theme itself comes from
// the plugin's `initialGlobals` option in vitest.config.ts — an `initialGlobals`
// or `globalTypes.defaultValue` override passed here loses to it (measured on
// Storybook 10.6).
const project = setProjectAnnotations([a11yAddonAnnotations, projectAnnotations])

beforeAll(project.beforeAll)

// Proof the override took: the preview decorator stamps data-theme on its
// wrapper. A run that silently rendered Dawn would pass every story for the
// wrong reason, so a mismatch fails the story.
afterEach(() => {
  const applied = document.querySelector('[data-theme]')?.getAttribute('data-theme') ?? 'none'
  if (applied !== __QUILL_THEME__) {
    throw new Error(`theme-qa: wanted data-theme="${__QUILL_THEME__}", the story rendered "${applied}"`)
  }
})
