/**
 * Generates public/llms.txt — the machine-readable reasoning layer for Quill.
 *
 * Everything here is derived from the single sources (token module, registry,
 * intent vocabulary, package version) so the file cannot drift from the system
 * it describes. `scripts/build-llms.test.mjs` fails CI if the committed file is
 * stale. Run `npm run build:llms` after touching tokens or the registry.
 *
 * Follows the llms.txt convention (llmstxt.org): H1 + blockquote + H2 sections.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { tokens } from '../src/tokens/quill.tokens.mjs'
import { MODES, DEFAULT_ACCENT } from './build-tokens.mjs'
import { INTENT_TAGS } from './registry-intent-tags.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const registry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8'))
const HOME = registry.homepage.replace(/\/$/, '')

const THEME_NAMES = { light: 'Dawn (light, default)', dark: 'Dusk (dark)', classicLight: 'Classic Light', classicDark: 'Classic Dark' }
// Dawn is the default mode that lives at :root; MODES lists the attr-switched rest.
const themeLine = [`\`light\` → ${THEME_NAMES.light}`, ...MODES.map((m) => `\`${m.attr}\` → ${THEME_NAMES[m.key]}`)].join(', ')
const accentList = Object.keys(tokens.accents).map((a) => (a === DEFAULT_ACCENT ? `${a} (default)` : a)).join(', ')

export function renderLlms(t = tokens) {
  const blocks = registry.items.filter((i) => i.type === 'registry:block')
  const L = []
  const p = (s = '') => L.push(s)

  p(`# ${registry.name === 'quill-ds' ? 'Quill Design System' : registry.name}`)
  p()
  p(`> ${registry.items.find((i) => i.name === 'quill').description} A self-hosted shadcn registry with a four-theme, four-accent token layer, WCAG 2.1 AA targets, and ${blocks.length} composable blocks. Version ${pkg.version}.`)
  p()
  p(`Install any item with the shadcn CLI against \`${HOME}/r/<name>.json\` (e.g. \`npx shadcn@latest add ${HOME}/r/quill.json\` for the theme, then blocks). Primitives are stock shadcn restyled by the theme layer — Quill ships the theme, an icon component, and the blocks below, not re-copied primitives.`)
  p()

  p('## Theming')
  p()
  p(`- **Themes** — set \`data-theme\` on \`<html>\`: ${themeLine}. Consumers must match one of these values; the token layer re-declares aliases so scoped \`data-theme\` islands work, not just the root switch.`)
  p(`- **Accents** — set \`data-accent\` on \`<html>\`: ${accentList}. The accent drives links, eyebrows, focus rings (\`--ring\`), and accent italics; it defaults to ${DEFAULT_ACCENT} when unset.`)
  p(`- Both attributes are independent of the color-scheme; dark grounds and accent are separate axes.`)
  p()

  p('## Tokens')
  p()
  p('- **Semantic contract** — the shadcn variables map onto Quill pigments: ' + ['background', 'foreground', 'card', 'primary', 'muted', 'muted-foreground', 'destructive', 'border', 'input', 'ring'].map((k) => `\`--${k}\``).join(', ') + '.')
  p(`- **Accent-driven** — \`--link\`, \`--ring\`, and accent text follow \`data-accent\` (default ${DEFAULT_ACCENT}-deep). Never hardcode a pigment for these.`)
  p('- **Charts** — use the chart tokens, never raw pigments (raw pigments fail colorblind-safety as data marks):')
  p(`  - Categorical: \`--chart-1\`…\`--chart-5\` (${Object.keys(t.color.chart.series).length} colorblind-safe series cuts). **Assign in fixed order; never cycle or repaint survivors when a series is filtered out.**`)
  p(`  - Magnitude: \`--chart-seq-1\`…\`--chart-seq-5\` (one-hue sequential ramp).`)
  p(`  - Polarity: \`--chart-div-1\`…\`--chart-div-5\` (diverging ramp, neutral midpoint — never red/green).`)
  p('- **Accessibility** — WCAG 2.1 AA: text cuts clear 4.5:1 on every theme ground; interactive control borders clear non-text 3:1.')
  p()

  p('## Component intents')
  p()
  p('Blocks are tagged with an intent vocabulary so you can pick by the job to be done:')
  p()
  for (const [tag, def] of Object.entries(INTENT_TAGS)) p(`- \`${tag}\` — ${def}`)
  p()

  p('## Components')
  p()
  p('Each block is a composition of restyled primitives. `intent` lists its jobs; `use_when` says when to reach for it.')
  p()
  for (const b of blocks) {
    const intent = (b.meta?.intent ?? []).join(', ')
    p(`- [${b.title ?? b.name}](${HOME}/r/${b.name}.json) — _[${intent}]_ ${b.meta?.use_when ?? b.description}`)
  }
  p()

  p('## Links')
  p()
  p(`- [Storybook](${HOME}/storybook/) — live components, foundations, and patterns`)
  p(`- [Theme item](${HOME}/r/quill.json) — the token layer (install first)`)
  p(`- [Full registry index](${HOME}/r/registry.json)`)
  p()

  return L.join('\n')
}

export const LLMS_PATH = join(root, 'public/llms.txt')

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(LLMS_PATH, renderLlms())
  console.log('wrote public/llms.txt')
}
