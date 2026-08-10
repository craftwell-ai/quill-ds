/**
 * Escapes `<` outside backtick spans so raw tag-like text (e.g. "Native
 * <button> semantics") survives Storybook's markdown renderer instead of
 * being parsed as HTML and silently dropped. Text inside `backticks` is
 * left untouched — it already renders as a code span.
 */
function esc(s) {
  return s
    .split(/(`[^`]*`)/)
    .map((part, i) => (i % 2 === 1 ? part : part.replace(/</g, '&lt;')))
    .join('')
}

/**
 * Formats a usage module into the markdown Storybook accepts in
 * `parameters.docs.description.component`. Every docs page derives from this
 * one function, so the human-facing docs cannot drift from the usage source.
 */
export function renderUsageDocs(u) {
  const L = []
  const p = (s = '') => L.push(s)

  p(esc(u.summary))
  p()
  p('### When to use')
  for (const w of u.useWhen) p(`- ${esc(w)}`)
  p()
  if (u.alternatives.length) {
    p('### Reach for instead')
    for (const a of u.alternatives) p(`- **${esc(a.name)}** — when ${esc(a.when)}`)
    p()
  }
  if (u.rules.length) {
    p('### Rules')
    for (const r of u.rules) p(`- **Do:** ${esc(r.do)} **Don't:** ${esc(r.dont)}`)
    p()
  }
  if (u.a11y.length) {
    p('### Accessibility')
    for (const a of u.a11y) p(`- ${esc(a)}`)
    p()
  }
  if (u.tokens.length) {
    p('### Design tokens')
    p(u.tokens.map((t) => `\`${t}\``).join(' · '))
    p()
  }
  return L.join('\n')
}
