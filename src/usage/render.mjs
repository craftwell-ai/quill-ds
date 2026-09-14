// A tag-like run of text outside a code span: `<button>`, `</p>`, `<input type="radio">`.
const TAG = /<\/?[a-z][a-z0-9-]*(?:\s[^<>]*)?\/?>/gi

/**
 * Makes raw tag-like text (e.g. "Native <button> semantics") survive the
 * target renderer. Text inside `backticks` is left untouched — it already
 * renders as a code span.
 *   mdx      — Storybook's docs renderer parses `<button>` as JSX/HTML and
 *              silently drops it, so `<` becomes `&lt;`.
 *   markdown — the published pages (public/usage/*.md) are read raw by agents
 *              and rendered by ordinary markdown; `&lt;` there is just noise, so
 *              the tag is wrapped in backticks instead. 26 pages shipped with
 *              literal `&lt;` before the two targets were told apart.
 */
function esc(s, format) {
  return s
    .split(/(`[^`]*`)/)
    .map((part, i) => {
      if (i % 2 === 1) return part
      return format === 'markdown' ? part.replace(TAG, (m) => `\`${m}\``) : part.replace(/</g, '&lt;')
    })
    .join('')
}

/**
 * Formats a usage module into markdown. Storybook consumes the default `mdx`
 * form in `parameters.docs.description.component`; `build:usage` renders the
 * published pages with `{ format: 'markdown' }`. Every docs page derives from
 * this one function, so the human-facing docs cannot drift from the usage source.
 */
export function renderUsageDocs(u, { format = 'mdx' } = {}) {
  const L = []
  const p = (s = '') => L.push(s)
  const e = (s) => esc(s, format)

  p(e(u.summary))
  p()
  p('### When to use')
  for (const w of u.useWhen) p(`- ${e(w)}`)
  p()
  if (u.alternatives.length) {
    p('### Reach for instead')
    for (const a of u.alternatives) p(`- **${e(a.name)}** — when ${e(a.when)}`)
    p()
  }
  if (u.rules.length) {
    p('### Rules')
    for (const r of u.rules) p(`- **Do:** ${e(r.do)} **Don't:** ${e(r.dont)}`)
    p()
  }
  if (u.a11y.length) {
    p('### Accessibility')
    for (const a of u.a11y) p(`- ${e(a)}`)
    p()
  }
  if (u.tokens.length) {
    p('### Design tokens')
    p(u.tokens.map((t) => `\`${t}\``).join(' · '))
    p()
  }
  return L.join('\n')
}
