/**
 * The usage-file contract. A usage module is the ONLY place a component's
 * usage guidance is written; Storybook docs, public/usage pages, registry
 * docs fields, and llms.txt links are all derived from it.
 * Returns a list of problems (empty = valid) so tests can show every issue
 * at once instead of dying on the first.
 */
export function validateUsage(u) {
  const problems = []
  const need = (cond, msg) => { if (!cond) problems.push(msg) }

  need(typeof u?.name === 'string' && /^[a-z0-9-]+$/.test(u?.name ?? ''), 'name must be a kebab-case string matching the registry/story name')
  need(u?.kind === 'component' || u?.kind === 'pattern', "kind must be 'component' or 'pattern'")
  need(typeof u?.summary === 'string' && u.summary.length > 0, 'summary must be a non-empty one-line string')
  need(Array.isArray(u?.useWhen) && u.useWhen.length > 0 && u.useWhen.every((s) => typeof s === 'string' && s.length > 0), 'useWhen must be a non-empty array of sentences')
  need(Array.isArray(u?.alternatives) && u.alternatives.every((a) => typeof a?.name === 'string' && typeof a?.when === 'string'), 'alternatives must be { name, when } objects')
  need(Array.isArray(u?.rules) && u.rules.every((r) => typeof r?.id === 'string' && /^[a-z0-9-]+$/.test(r.id) && typeof r?.do === 'string' && typeof r?.dont === 'string' && typeof r?.visual === 'boolean'), 'rules must be { id (kebab), do, dont, visual } objects')
  const ids = Array.isArray(u?.rules) ? u.rules.map((r) => r?.id) : []
  need(new Set(ids).size === ids.length, 'rule ids must be unique within a usage file')
  need(Array.isArray(u?.a11y) && u.a11y.every((s) => typeof s === 'string'), 'a11y must be an array of strings')
  need(Array.isArray(u?.tokens) && u.tokens.every((s) => typeof s === 'string' && s.startsWith('--')), "tokens must be an array of '--*' custom-property names")
  return problems
}
