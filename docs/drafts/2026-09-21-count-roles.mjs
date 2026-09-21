// Counts every Tailwind utility (and CSS-variable reference) that uses a colour
// role in Quill's SHIPPED code. Read-only: it never writes inside the repo.
//
// Method: enumerate first, classify second.
//   1. Split every file into class-like "words" (whitespace / quote / backtick / brace separated).
//   2. Strip variant prefixes (hover:, data-[…]:, [&>svg]: …) to get the bare utility.
//   3. Strip an opacity modifier (/10, /[0.08], /(--x)).
//   4. Find the LONGEST role name the utility ends with ("-<role>"), so
//      text-muted-foreground is muted-foreground, never muted or foreground.
//   5. Record the prefix that is left over. Unknown prefixes are printed for review
//      rather than silently dropped.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const REPO = '/Users/ryanphillips/projects/quill-ds'
const OUT = process.argv[2]
const SHIPPED_DIRS = ['registry/blocks', 'registry/lib', 'registry/examples', 'src/components/ui']

const CONTRACT_ROLES = [
  'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
  'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
  'accent', 'accent-foreground', 'destructive', 'border', 'input', 'ring',
  'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
  'sidebar', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground',
  'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring',
]
const QUILL_ROLES = ['text-accent-color', 'link', 'success', 'warning', 'danger', 'info', 'working', 'queued']

// Every Tailwind prefix that takes a colour. Anything else that ends in "-<role>"
// is listed under "unclassified" so a human can judge it.
const COLOR_PREFIXES = new Set([
  'bg', 'text', 'border', 'border-t', 'border-r', 'border-b', 'border-l', 'border-x', 'border-y',
  'border-s', 'border-e', 'ring', 'ring-offset', 'inset-ring', 'outline', 'fill', 'stroke',
  'from', 'via', 'to', 'divide', 'decoration', 'shadow', 'inset-shadow', 'drop-shadow',
  'caret', 'accent', 'placeholder', 'text-shadow',
])

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

// Last segment after a ':' that is not inside [] or ().
function stripVariants(word) {
  let depth = 0
  let cut = 0
  for (let i = 0; i < word.length; i++) {
    const ch = word[i]
    if (ch === '[' || ch === '(') depth++
    else if (ch === ']' || ch === ')') depth = Math.max(0, depth - 1)
    else if (ch === ':' && depth === 0) cut = i + 1
  }
  return { variants: word.slice(0, cut), utility: word.slice(cut) }
}

function splitModifier(utility) {
  // opacity modifier = a '/' outside brackets, followed by digits, [..] or (..)
  let depth = 0
  for (let i = 0; i < utility.length; i++) {
    const ch = utility[i]
    if (ch === '[' || ch === '(') depth++
    else if (ch === ']' || ch === ')') depth = Math.max(0, depth - 1)
    else if (ch === '/' && depth === 0) return { base: utility.slice(0, i), modifier: utility.slice(i + 1) }
  }
  return { base: utility, modifier: '' }
}

const ROLES_LONGEST_FIRST = [...CONTRACT_ROLES].sort((a, b) => b.length - a.length)

function isCommentLine(line) {
  const t = line.trim()
  return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('{/*')
}

const files = SHIPPED_DIRS.flatMap((d) => walk(join(REPO, d))).sort()
const hits = [] // { role, prefix, variants, modifier, form, file, line, word, comment }
const unclassified = []
const varHits = [] // var(--role) / --color-role references

const ALL_VAR_NAMES = [...CONTRACT_ROLES, ...QUILL_ROLES]
const varRegex = new RegExp(`--(color-)?(${[...ALL_VAR_NAMES].sort((a, b) => b.length - a.length).join('|')})(?![A-Za-z0-9_-])`, 'g')

for (const file of files) {
  const rel = relative(REPO, file)
  const text = readFileSync(file, 'utf8')
  const lines = text.split('\n')
  lines.forEach((line, idx) => {
    const comment = isCommentLine(line)
    // CSS-variable references: var(--primary), bg-(--primary), [var(--color-chart-1)] …
    for (const m of line.matchAll(varRegex)) {
      varHits.push({ role: m[2], raw: m[0], file: rel, line: idx + 1, comment })
    }
    for (const rawWord of line.split(/[\s"'`{}<>,;]+/)) {
      if (!rawWord || !rawWord.includes('-')) continue
      let word = rawWord
      const { variants, utility: u0 } = stripVariants(word)
      let utility = u0.replace(/^!/, '').replace(/!$/, '')
      if (utility.startsWith('-')) utility = utility.slice(1)
      const { base, modifier } = splitModifier(utility)
      if (!/^[a-z][a-z0-9-]*$/.test(base)) continue
      const role = ROLES_LONGEST_FIRST.find((r) => base.endsWith(`-${r}`))
      if (!role) continue
      const prefix = base.slice(0, base.length - role.length - 1)
      const rec = { role, prefix, variants, modifier, form: `${prefix}-${role}${modifier ? `/${modifier}` : ''}`, file: rel, line: idx + 1, word: rawWord, comment }
      if (COLOR_PREFIXES.has(prefix)) hits.push(rec)
      else unclassified.push(rec)
    }
  })
}

writeFileSync(OUT, JSON.stringify({ files: files.map((f) => relative(REPO, f)), hits, unclassified, varHits }, null, 2))

const byExt = {}
for (const f of files) { const e = f.split('.').pop(); byExt[e] = (byExt[e] ?? 0) + 1 }
console.log('files scanned:', files.length, JSON.stringify(byExt))
console.log('utility hits:', hits.length, '| in comment lines:', hits.filter((h) => h.comment).length)
console.log('unclassified "-<role>" endings:', unclassified.length)
console.log('var hits:', varHits.length)
