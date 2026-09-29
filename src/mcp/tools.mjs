/**
 * The Quill MCP server's tools as plain functions, so `node --test` can call them
 * without Next. src/app/mcp/route.ts only registers them.
 *
 * Every answer is read from the single sources — the usage modules, registry.json,
 * the foundations and theme-docs renderers — so an edit there reaches MCP clients
 * on the next deploy with no build step of its own.
 */
import registry from '../../registry.json' with { type: 'json' }
import { ALL_USAGE } from '../usage/index.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { EXAMPLES } from '../usage/examples.mjs'

export const HOME = registry.homepage.replace(/\/$/, '')
// Trailing slash: next.config.ts sets trailingSlash, so the bare path 308-redirects.
export const MCP_URL = `${HOME}/mcp/`

const usageByName = new Map(ALL_USAGE.map((u) => [u.name, u]))
const registryByName = new Map(registry.items.map((i) => [i.name, i]))
// Agents type names the way humans say them; collapse to the kebab-case key.
const compact = (s) => s.replace(/-/g, '')
const byCompactName = new Map(ALL_USAGE.map((u) => [compact(u.name), u.name]))

export function normalizeName(name) {
  const kebab = String(name).trim().toLowerCase().replace(/[\s_]+/g, '-')
  return usageByName.has(kebab) || registryByName.has(kebab) ? kebab : byCompactName.get(compact(kebab)) ?? kebab
}

// Quill's own items (blocks, icon, tone-badge) come from the registry URL;
// everything else with a guide is a stock shadcn primitive restyled by the theme.
export function installCommand(name) {
  return registryByName.has(name)
    ? `npx shadcn@latest add ${HOME}/r/${name}.json`
    : `npx shadcn@latest add ${name}`
}

// Same page build-usage.mjs writes to public/usage/<name>.md.
const renderPage = (u) => `# ${u.name} (${u.kind})\n\n${renderUsageDocs(u, { format: 'markdown' })}`

function editDistance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const cur = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = cur
    }
  }
  return row[b.length]
}

export function getComponent(name) {
  const key = normalizeName(name)
  const u = usageByName.get(key)
  if (u) {
    return { ok: true, text: `${renderPage(u).trimEnd()}\n\n### Install\n\`${installCommand(key)}\`\n` }
  }
  const example = EXAMPLES.find((e) => e.name === key)
  if (example) {
    return {
      ok: true,
      text: `# ${example.title}\n\n${example.description}\n\nComposition: ${example.blocks.join(' → ')}.\n\n### Install\n\`${installCommand(key)}\`\n`,
    }
  }
  if (registryByName.has(key)) {
    return {
      ok: true,
      text: `\`${key}\` is part of Quill's setup, not a component. Call \`get_setup\` for how to install and wire it.\n`,
    }
  }
  const suggestions = ALL_USAGE.map((x) => [x.name, editDistance(key, x.name)])
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([n]) => `\`${n}\``)
  return {
    ok: false,
    text: `No Quill component is named "${name}". Closest real names: ${suggestions.join(', ')}. Or call \`find_component\` with the job you need done.\n`,
  }
}
