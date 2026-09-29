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

const STOP = new Set(
  'a an and the to of for in on with my our your their i we you it is are be need needs want wants show shows that this some from or as at by when user users page'.split(' '),
)
// Crude stem so "deleting"/"delete" and "files"/"file" meet. Word overlap, not an
// embedding: free, predictable, and good enough when the guides name their jobs.
const stem = (w) => w.replace(/(ing|ed|s)$/, '').replace(/e$/, '')
const words = (s) => (String(s).toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((w) => w.length > 1 && !STOP.has(w)).map(stem)

const searchIndex = ALL_USAGE.map((u) => {
  const meta = registryByName.get(u.name)?.meta
  const nameWords = new Set(words(u.name.replace(/-/g, ' ')))
  const hay = new Set(words([u.name.replace(/-/g, ' '), u.summary, ...u.useWhen, ...(meta?.intent ?? []), meta?.use_when ?? ''].join(' ')))
  const notFor = new Set(words(meta?.not_for ?? u.alternatives.map((a) => a.when).join(' ')))
  return { u, nameWords, hay, notFor }
})

export function findComponent(task, limit = 5) {
  const taskWords = new Set(words(task))
  const ranked = searchIndex
    .map(({ u, nameWords, hay, notFor }) => {
      let score = 0
      for (const w of taskWords) {
        if (hay.has(w)) score += 1
        if (nameWords.has(w)) score += 1
        // A word only its "not for" line mentions means another item owns this job.
        if (notFor.has(w) && !hay.has(w)) score -= 0.5
      }
      return { u, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.u.name.localeCompare(b.u.name))
    .slice(0, limit)

  if (!ranked.length) {
    return {
      ok: false,
      names: [],
      text: 'No Quill component fits that description. Compose it from the stock primitives with Quill tokens (call `get_foundations`), and do not invent a component name.\n',
    }
  }
  const lines = ranked.map(({ u }) => `- **${u.name}** (${u.kind}) — ${u.summary}\n  Use when: ${u.useWhen[0]}`)
  return {
    ok: true,
    names: ranked.map((r) => r.u.name),
    text: `Best matches, best first. Call \`get_component\` on your pick for its rules and install line.\n\n${lines.join('\n')}\n`,
  }
}
