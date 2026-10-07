/**
 * Draw the Foundations page of the Paper file from the tokens themselves: colour swatches
 * with their names and values, the AI gradient, the data series, the type scale, spacing
 * and radius. Laid out as the owner's "Mantis Design System" Foundations page is (header,
 * then titled sections; 184px swatches; a label column beside each type sample).
 *
 * Nothing on the page is typed by hand: every swatch is `var(--token)` and every caption is
 * read from the token list, so a re-run after a token change redraws it correctly.
 *
 *   node scripts/paper/sync-foundations.mjs
 */
import { pathToFileURL } from 'node:url'
import { connect } from './client.mjs'
import { formatColor } from './color.mjs'
import { serialize } from './convert.mjs'
import { digest, ensureArtboard, ensurePages, FOUNDATIONS, openQuillFile, readState, today, writeState, writeTree } from './file.mjs'
import { artboardStyles, frame, header, section, text } from './page.mjs'
import { quillPaperTokens, resolveTokens } from './tokens.mjs'

const SWATCH_GROUPS = [
  ['Surfaces and text', ['background', 'card', 'muted', 'foreground', 'muted-foreground', 'border', 'input']],
  ['Roles', ['primary', 'secondary', 'destructive', 'ring', 'link', 'success', 'warning', 'info', 'working', 'queued']],
  ['Pigments', ['terracotta', 'terracotta-deep', 'moss', 'moss-deep', 'indigo', 'indigo-deep', 'gold', 'gold-deep', 'gold-text', 'teal', 'teal-deep']],
]
const SAMPLE = 'Quiet ink on warm paper'

const row = (name, children, style = {}) => frame(name, { 'flex-wrap': 'wrap', 'align-items': 'flex-start', gap: 'var(--spacing-4)', ...style }, children)
const caption = (token) => (token.alias ? `${token.value.slice(4, -1).replace('--color-', '')} · ${formatColor(token.color)}` : formatColor(token.color))

/** The whole page as node objects: pure, so a test can read it without Paper. */
export function foundationsPage(tokens = quillPaperTokens().tokens) {
  const table = resolveTokens(tokens).map((entry, index) => ({ ...entry, value: String(tokens[index].value) }))
  const named = (name) => table.find((entry) => entry.name === name)
  const ofType = (type) => table.filter((entry) => entry.type === type)

  const swatch = (short) => {
    const token = named(`--color-${short}`)
    if (!token) return null
    return frame(short, { 'flex-direction': 'column', gap: 'var(--spacing-1)', width: '184px', 'flex-shrink': '0' }, [
      frame('swatch', { height: '96px', 'background-color': `var(${token.name})`, border: '1px solid var(--color-border)', 'border-radius': 'var(--radius-xl)' }),
      text('body', short, { 'font-weight': 'var(--font-weight-medium)', padding: 'var(--spacing-1) 0px 0px 0px' }),
      text('label', caption(token)),
    ])
  }
  const legend = (names) => row('Legend', names.map((short) => text('label', `${short} · ${formatColor(named(`--color-${short}`).color)}`)), { gap: 'var(--spacing-6)' })
  const bar = (name, style) => frame(name, { height: '12px', width: '100%', 'border-radius': '9999px', ...style })

  const charts = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5']
  const sizes = ofType('fontSize').sort((a, b) => b.px - a.px)
  const typeRow = (size) => {
    const short = size.name.replace('--text-', '')
    const leading = named(`--leading-text-${short}`)
    const display = size.px >= 24
    return frame(short, { 'align-items': 'center', gap: 'var(--spacing-8)', padding: 'var(--spacing-4) 0px', 'border-top': '1px solid var(--color-border)', width: '100%' }, [
      text('label', `text-${short} · ${display ? 'Fraunces' : 'Raleway'} ${size.px}px${leading ? ` / ${Math.round(leading.ratio * size.px * 10) / 10}px` : ''}`, { width: '280px', 'flex-shrink': '0' }),
      text(display ? 'title' : 'body', SAMPLE, { 'font-size': `var(${size.name})`, 'line-height': leading ? `var(${leading.name})` : 'var(--leading-ui)', 'white-space': 'nowrap' }),
    ])
  }
  const spacingStep = (token) => frame(token.name.slice(2), { 'flex-direction': 'column', 'align-items': 'flex-start', gap: 'var(--spacing-2)' }, [
    frame('step', { width: `var(${token.name})`, height: 'var(--spacing-6)', 'background-color': 'var(--color-moss)', 'border-radius': 'var(--radius-xs)', 'flex-shrink': '0' }),
    text('label', `${token.name.replace('--spacing-', '').replace('_', '.')} · ${token.px}`),
  ])
  const radiusSample = (token) => frame(token.name.slice(2), { 'flex-direction': 'column', gap: 'var(--spacing-2)' }, [
    frame('sample', { width: '96px', height: '64px', 'background-color': 'var(--color-card)', border: '1px solid var(--color-border)', 'border-radius': `var(${token.name})` }),
    text('label', `${token.name.replace('--radius-', '').replace('--radius', 'base')} · ${token.px}`),
  ])

  return [
    header('Quill · Foundations', 'Foundations', 'Every value on this page is a Paper token pushed from Quill’s shipped theme, in Dawn (the default theme). Paper holds one value per token, so the other four themes are not here.'),
    ...SWATCH_GROUPS.map(([title, names]) => section(title, [row('Swatches', names.map(swatch).filter(Boolean))])),
    section('AI gradient', [
      bar('Bar', { 'background-image': 'linear-gradient(90deg, var(--color-ai-from), var(--color-ai-via) 50%, var(--color-ai-to))' }),
      legend(['ai-from', 'ai-via', 'ai-to', 'ai-text-from', 'ai-text-via', 'ai-text-to']),
    ], { width: '100%' }),
    section('Data series', [
      frame('Bar', { gap: 'var(--spacing-1)', width: '100%' }, charts.map((short) => frame(short, { height: '12px', 'flex-grow': '1', 'flex-basis': '0%', 'background-color': `var(--color-${short})`, 'border-radius': '9999px' }))),
      legend(charts),
    ], { width: '100%' }),
    section('Type', sizes.map(typeRow), { width: '100%', gap: '0px' }),
    section('Spacing', [row('Steps', ofType('spacing').map(spacingStep), { 'align-items': 'flex-end', gap: 'var(--spacing-6)' })]),
    section('Radius', [row('Samples', ofType('radius').filter((token) => token.name !== '--radius').map(radiusSample), { gap: 'var(--spacing-6)' })]),
  ]
}

export async function syncFoundations({ log = console.log } = {}) {
  const paper = await connect()
  const state = readState()
  const file = await openQuillFile(paper, { state })
  const { pages } = await ensurePages(file, [FOUNDATIONS])
  const nodes = foundationsPage()
  const artboard = await ensureArtboard(file, { pageId: pages[FOUNDATIONS], name: FOUNDATIONS, styles: artboardStyles(), knownId: state.foundations?.artboardId })
  let calls = 0
  const placeholders = []
  try {
    for (const node of nodes) calls += (await writeTree(file, serialize, node, artboard.id, { placeholders })).calls
    if (placeholders.length) await file.call('delete_nodes', { nodeIds: placeholders })
  } finally {
    await file.call('finish_working_on_nodes', { nodeIds: [artboard.id] })
  }
  writeState({ ...readState(), foundations: { page: FOUNDATIONS, pageId: pages[FOUNDATIONS], artboardId: artboard.id, sections: nodes.length - 1, htmlHash: digest(nodes.map((node) => serialize(node)).join('')), syncedAt: today() } })
  log(`${FOUNDATIONS}: ${nodes.length - 1} sections · ${calls} writes${artboard.created ? ' · new artboard' : ''}`)
  return { artboardId: artboard.id }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await syncFoundations()
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
