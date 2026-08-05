// One block per usage module, keyed by its exact import specifier. A wildcard
// (`declare module '*.usage.mjs'`) looks tempting but does not work here: with
// allowJs + moduleResolution "bundler", TS resolves these specifiers to the
// real .mjs files on disk, and wildcard ambient modules only apply when normal
// resolution fails. An exact-literal specifier match still augments the real
// module's inferred types, which is why this works. Adding a new usage module
// (Dialog, Alerts, ...) means adding its own block below.
declare module '@/usage/button.usage.mjs' {
  import type { Usage } from '@/usage/types'
  export const usage: Usage
}

declare module '@/usage/render.mjs' {
  import type { Usage } from '@/usage/types'
  export function renderUsageDocs(usage: Usage): string
}
