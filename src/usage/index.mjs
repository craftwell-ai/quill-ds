/**
 * Static index of every usage module. Kept by hand so node scripts and tests
 * stay synchronous; scripts/usage-schema.test.mjs fails if a *.usage.mjs file
 * on disk is missing here, so the two cannot drift.
 */
import { usage as alerts } from './alerts.usage.mjs'
import { usage as button } from './button.usage.mjs'
import { usage as dialog } from './dialog.usage.mjs'

export const ALL_USAGE = [alerts, button, dialog]
