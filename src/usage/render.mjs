/**
 * Formats a usage module into the markdown Storybook accepts in
 * `parameters.docs.description.component`. Every docs page derives from this
 * one function, so the human-facing docs cannot drift from the usage source.
 */
export function renderUsageDocs(u) {
  const L = []
  const p = (s = '') => L.push(s)

  p(u.summary)
  p()
  p('### When to use')
  for (const w of u.useWhen) p(`- ${w}`)
  p()
  if (u.alternatives.length) {
    p('### Reach for instead')
    for (const a of u.alternatives) p(`- **${a.name}** — when ${a.when}`)
    p()
  }
  if (u.rules.length) {
    p('### Rules')
    for (const r of u.rules) p(`- **Do:** ${r.do} **Don't:** ${r.dont}`)
    p()
  }
  if (u.a11y.length) {
    p('### Accessibility')
    for (const a of u.a11y) p(`- ${a}`)
    p()
  }
  if (u.tokens.length) {
    p('### Design tokens')
    p(u.tokens.map((t) => `\`${t}\``).join(' · '))
    p()
  }
  return L.join('\n')
}
