/**
 * Turn a rendered Storybook story into HTML that Paper (paper.design) accepts.
 *
 * Paper builds its layers from HTML with inline styles, but only a subset of CSS: flex is
 * the one layout mode (no grid, no tables, no inline flow, no margins) and a text layer
 * holds one style. So the story is rendered in a real browser, its DOM is read with the
 * styles the browser computed, and each element is rewritten in Paper's terms:
 *
 *   grid           → a flex column, or flex rows with the measured cell widths
 *   table          → flex rows with the measured cell widths
 *   inline text    → a flex row of one-style text runs
 *   margin         → padding on the parent, or a spacer between two siblings
 *   a colour, size, radius, font that equals a Quill token → `var(--token)`
 *
 * Anything that could only be carried by measuring it (a fixed width where the code had a
 * rule) is counted as "approximated", with the reason, so the report can say how much of a
 * piece is a faithful translation and how much is a tracing.
 *
 *   node scripts/paper/convert.mjs <story-id> [--base http://localhost:6150]   # prints the HTML and the counts
 *
 * The pure half (everything but `captureStory`) runs without a browser and is unit-tested.
 */
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { formatColor, mapColors, parseColor, sameColor } from './color.mjs'
import { quillPaperTokens, resolveTokens } from './tokens.mjs'

export const STORYBOOK = process.env.PAPER_STORYBOOK_URL || 'http://localhost:6150'
export const CANVAS_PADDING = 24 // the same breathing room .storybook/preview.tsx gives a story
const SCALE = 2

// ------------------------------------------------------------------ small helpers

const round = (value, places = 2) => Math.round(value * 10 ** places) / 10 ** places
export const px = (value) => `${round(value)}px`
const num = (value) => (typeof value === 'number' ? value : parseFloat(value) || 0)
const escapeText = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escapeAttr = (text) => escapeText(text).replace(/"/g, '&quot;')

// ------------------------------------------------------------------ style diffing

/**
 * Values that say nothing: the CSS initial value, or what a flex child gets anyway.
 * Dropping them is what keeps the HTML readable in Paper's inspector.
 */
export const DEFAULTS = {
  'flex-direction': ['row'],
  'flex-wrap': ['nowrap'],
  'align-items': ['normal', 'stretch'],
  'justify-content': ['normal', 'flex-start', 'start'],
  'align-self': ['auto', 'normal'],
  'flex-grow': ['0'],
  'flex-shrink': ['1'],
  'flex-basis': ['auto'],
  gap: ['0px', 'normal', 'normal normal', '0px 0px'],
  'row-gap': ['0px', 'normal'],
  'column-gap': ['0px', 'normal'],
  padding: ['0px', '0px 0px 0px 0px'],
  width: ['auto'],
  height: ['auto'],
  'min-width': ['auto'],
  'min-height': ['auto', '0px'],
  'max-width': ['none'],
  'max-height': ['none'],
  position: ['static'],
  top: ['auto'],
  right: ['auto'],
  bottom: ['auto'],
  left: ['auto'],
  'z-index': ['auto'],
  overflow: ['visible'],
  opacity: ['1'],
  'background-color': ['transparent', 'rgba(0, 0, 0, 0)'],
  'background-image': ['none'],
  'background-size': ['auto', 'auto auto'],
  'background-position': ['0% 0%'],
  'background-repeat': ['repeat'],
  'background-clip': ['border-box'],
  'border-radius': ['0px'],
  'box-shadow': ['none'],
  'font-style': ['normal'],
  'letter-spacing': ['normal', '0px', '0em'],
  'line-height': ['normal'],
  'text-align': ['start', 'left'],
  'white-space': ['normal'],
  'text-transform': ['none'],
  'text-decoration': ['none'],
  'text-overflow': ['clip'],
  'font-variation-settings': ['normal'],
  'font-variant-numeric': ['normal'],
}

/** Drop every declaration that equals its default (or is empty); order is kept. */
export function dropDefaults(style, defaults = DEFAULTS) {
  const kept = {}
  for (const [property, value] of Object.entries(style)) {
    if (value === undefined || value === null || value === '') continue
    if (defaults[property]?.includes(String(value))) continue
    kept[property] = String(value)
  }
  return kept
}

// ------------------------------------------------------------------ margins

/**
 * Paper has no margin. Rewrite the children's margins along the parent's main axis:
 * a margin on the outer edge of the first or last child becomes parent padding (exact);
 * a margin between two siblings becomes a spacer, shortened by the parent's gap because a
 * spacer is one more flex item and so adds one more gap (exact when margin ≥ gap); an
 * `auto` margin becomes a spacer that grows. Negative and cross-axis margins cannot be
 * carried and are reported.
 *
 * `children` is `[{ margin: { top, right, bottom, left } }]` with px numbers or 'auto'.
 * Returns `{ padding: { top, right, bottom, left }, spacers: [{ before: index, size | grow }], lost: [reason] }`.
 */
export function translateMargins({ axis, gap = 0, collapse = false }, children) {
  const [start, end, crossStart, crossEnd] = axis === 'row' ? ['left', 'right', 'top', 'bottom'] : ['top', 'bottom', 'left', 'right']
  const padding = { top: 0, right: 0, bottom: 0, left: 0 }
  const spacers = []
  const lost = []
  const size = (value) => (value === 'auto' ? 0 : value)
  children.forEach((child, index) => {
    const margin = child.margin
    for (const side of [crossStart, crossEnd]) {
      if (margin[side] === 'auto') lost.push(`auto margin across the ${axis} dropped`)
      else if (margin[side] > 0) lost.push(`${margin[side]}px ${side} margin across the ${axis} dropped`)
    }
    for (const side of [start, end, crossStart, crossEnd]) if (margin[side] < 0) lost.push(`negative ${side} margin (${margin[side]}px) dropped`)
    const before = margin[start]
    const previous = index > 0 ? children[index - 1].margin[end] : null
    if (index === 0) {
      if (before === 'auto') spacers.push({ before: 0, grow: true })
      else if (before > 0) padding[start] += before
    } else {
      if (before === 'auto' || previous === 'auto') {
        spacers.push({ before: index, grow: true })
        return
      }
      const [a, b] = [Math.max(0, size(previous)), Math.max(0, before)]
      // siblings in normal block flow share the larger margin; flex and grid items add theirs up
      const between = collapse ? Math.max(a, b) : a + b
      if (between <= 0) return
      if (between >= gap) spacers.push({ before: index, size: between - gap })
      else lost.push(`${between}px margin smaller than the ${gap}px gap dropped`)
    }
  })
  const last = children.at(-1)?.margin[end]
  if (last === 'auto') spacers.push({ before: children.length, grow: true })
  else if (last > 0) padding[end] += last
  return { padding, spacers, lost }
}

// ------------------------------------------------------------------ grid

/**
 * Paper has no grid. A one-column grid is a flex column with the row gap. Anything wider
 * becomes flex rows: children are grouped by the top edge the browser gave them, and each
 * cell keeps its measured width (a fraction or `max-content` track has no flex spelling
 * that survives different content, so the width is traced, not translated).
 *
 * `columns` are the resolved track widths in px, `children` are `[{ x, y, width }]` in
 * document order, positions relative to the grid's content box.
 */
export function planGrid({ columns, columnGap = 0, rowGap = 0, children }) {
  if (columns.length <= 1) return { kind: 'column', gap: rowGap }
  const rows = []
  children.forEach((child, index) => {
    const row = rows.at(-1)
    if (row && Math.abs(row.y - child.y) <= 1) row.cells.push({ index, ...child })
    else rows.push({ y: child.y, cells: [{ index, ...child }] })
  })
  return {
    kind: 'rows',
    rowGap,
    columnGap,
    rows: rows.map((row) => row.cells.map((cell, position) => {
      // a cell that starts further right than the previous one ended plus the gap skipped a track
      const expected = position === 0 ? 0 : row.cells[position - 1].x + row.cells[position - 1].width + columnGap
      return { index: cell.index, width: cell.width, offset: Math.max(0, round(cell.x - expected)) }
    })),
  }
}

// ------------------------------------------------------------------ token binding

const COLOR_PREFERENCE = {
  // what a role is FOR decides which of several same-valued tokens a property takes
  text: [/^--color-foreground$/, /-foreground$/, /^--color-(link|success|warning|info|working|queued|destructive|text-accent-color)$/],
  background: [/^--color-(background|card|popover|muted|secondary|accent|primary|sidebar|destructive)$/],
  border: [/^--color-(border|input|ring|sidebar-border)$/],
}
const CLASS_PREFIX = { text: ['text'], background: ['bg'], border: ['border', 'divide', 'outline'] }

/**
 * The matcher that swaps a computed value for `var(--token)`. One per conversion: it also
 * counts how many tokenisable values it met (`bindable`) and how many it bound (`bound`).
 */
export function createBinder(tokenTable) {
  const stats = { bound: 0, bindable: 0, unbound: {} }
  const colors = tokenTable.filter((token) => token.type === 'color' && token.color)
  const ofType = (type) => tokenTable.filter((token) => token.type === type)
  const semanticRank = (token) => (token.alias ? 0 : 1)
  const miss = (kind, value) => { stats.unbound[`${kind} ${value}`] = (stats.unbound[`${kind} ${value}`] ?? 0) + 1 }
  const hit = (expression) => { stats.bound++; return expression }

  const preferred = (kind) => {
    const patterns = COLOR_PREFERENCE[kind] ?? []
    const rank = (token) => { const at = patterns.findIndex((pattern) => pattern.test(token.name)); return at < 0 ? patterns.length : at }
    return [...colors].sort((a, b) => rank(a) - rank(b) || semanticRank(a) - semanticRank(b) || a.order - b.order)
  }
  const tint = (token, alpha) => `color-mix(in oklab, var(${token.name}) ${Math.round(alpha * 100)}%, transparent)`

  /** `classes` are the element's own class names (for text: its ancestors' too, nearest first). */
  function color(kind, value, classes = []) {
    const parsed = parseColor(value)
    if (!parsed) return value
    if (parsed.a === 0) return 'transparent'
    stats.bindable++
    // 1. the token the source class named, when it still explains the computed colour
    for (const name of classes) {
      const match = name.match(/^([a-z]+)-([a-z0-9-]+?)(?:\/(\d+))?$/)
      if (!match || !CLASS_PREFIX[kind]?.includes(match[1])) continue
      const token = colors.find((candidate) => candidate.name === `--color-${match[2]}`)
      if (!token) continue
      const percent = match[3] ? Number(match[3]) / 100 : 1
      if (sameColor({ ...token.color, a: token.color.a * percent }, parsed, 1.6)) return hit(percent === 1 ? `var(${token.name})` : tint(token, percent))
    }
    // 2. any token with exactly this colour, semantic roles before the raw palette
    const exact = preferred(kind).find((token) => sameColor(token.color, parsed))
    if (exact) return hit(`var(${exact.name})`)
    // 3. a token at a whole-percent opacity (`bg-destructive/10` computes to a translucent colour)
    if (parsed.a < 1 && Math.abs(parsed.a * 100 - Math.round(parsed.a * 100)) < 0.3) {
      const base = preferred(kind).find((token) => token.color.a === 1 && sameColor(token.color, { ...parsed, a: 1 }, 1.6))
      if (base) return hit(tint(base, parsed.a))
    }
    miss(kind, formatColor(parsed))
    return formatColor(parsed)
  }

  function length(type, pixels, { classes = [], count = true } = {}) {
    if (!pixels) return '0px'
    if (count) stats.bindable++
    const candidates = ofType(type).filter((token) => Math.abs(token.px - pixels) < 0.01)
    // `rounded-lg` names --radius-lg; without a class, a named step beats the bare `--radius`
    const named = candidates.find((token) => classes.some((name) => /^rounded-/.test(name) && token.name === `--radius-${name.slice(8)}`))
    const chosen = named ?? candidates.find((token) => !token.alias && token.name !== '--radius') ?? candidates[0]
    if (chosen) return count ? hit(`var(${chosen.name})`) : `var(${chosen.name})`
    if (count) miss(type, px(pixels))
    return px(pixels)
  }

  function fontFamily(stack) {
    stats.bindable++
    const first = stack.split(',')[0].replace(/["']/g, '').trim()
    // --font-heading before --font-display: both are Fraunces and "heading" is the role components use
    const order = ['--font-sans', '--font-heading', '--font-mono', '--font-ui', '--font-data', '--font-display']
    const token = ofType('fontFamily').filter((candidate) => candidate.family === first).sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))[0]
    if (token) return hit(`var(${token.name})`)
    miss('fontFamily', first)
    return stack
  }

  function fontSize(pixels) {
    return length('fontSize', pixels)
  }

  function lineHeight(pixels, fontPixels) {
    stats.bindable++
    const ratio = pixels / fontPixels
    const sizeToken = ofType('fontSize').find((token) => Math.abs(token.px - fontPixels) < 0.01)
    const candidates = ofType('lineHeight').filter((token) => Math.abs(token.ratio - ratio) < 0.002)
    // the line height that ships WITH this size (`text-sm` carries its own) before a role
    const paired = sizeToken && candidates.find((token) => token.name === `--leading-${sizeToken.name.slice(2)}`)
    const chosen = paired ?? candidates.find((token) => !token.name.startsWith('--leading-text-'))
    if (chosen) return hit(`var(${chosen.name})`)
    miss('lineHeight', `${round(ratio, 3)} of ${px(fontPixels)}`)
    return px(pixels)
  }

  function letterSpacing(pixels, fontPixels) {
    stats.bindable++
    const em = pixels / fontPixels
    const token = ofType('letterSpacing').find((candidate) => Math.abs(candidate.em - em) < 0.001)
    if (token) return hit(`var(${token.name})`)
    miss('letterSpacing', `${round(em, 3)}em`)
    return `${round(em, 3)}em`
  }

  function fontWeight(weight) {
    stats.bindable++
    const token = ofType('fontWeight').find((candidate) => candidate.weight === Number(weight))
    if (token) return hit(`var(${token.name})`)
    miss('fontWeight', weight)
    return String(weight)
  }

  /** Colours inside a gradient: exact token matches only, nothing is counted as missed. */
  function colorsIn(value) {
    return mapColors(value, (parsed) => {
      if (parsed.a === 0) return 'transparent'
      const exact = preferred('background').find((token) => sameColor(token.color, parsed))
      stats.bindable++
      return exact ? hit(`var(${exact.name})`) : formatColor(parsed)
    })
  }

  return { stats, color, length, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, colorsIn }
}

// ------------------------------------------------------------------ the tree → Paper nodes

const NAMED_TAGS = new Set(['nav', 'button', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'header', 'footer', 'form', 'label', 'a', 'input', 'textarea', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
const TABLE_SECTION = new Set(['table-row-group', 'table-header-group', 'table-footer-group'])
const isFlex = (display) => display === 'flex' || display === 'inline-flex'
const isGrid = (display) => display === 'grid' || display === 'inline-grid'
const isInlineLevel = (display) => display.startsWith('inline') || display === 'ruby'
const isText = (item) => typeof item.text === 'string'
const outOfFlow = (node) => !isText(node) && (node.used.position === 'absolute' || node.used.position === 'fixed')

const layerName = (node) => node.slot || node.role || (NAMED_TAGS.has(node.tag) ? node.tag : null)
const label = (node) => layerName(node) ?? node.tag

/** Collapse a text node the way the browser's `white-space` would. */
export function normalizeText(text, whiteSpace = 'normal') {
  return whiteSpace.startsWith('pre') || whiteSpace === 'break-spaces' ? text : text.replace(/\s+/g, ' ')
}

function sides(used, prefix, suffix = '') {
  return ['Top', 'Right', 'Bottom', 'Left'].map((side) => used[`${prefix}${side}${suffix}`])
}

/** `1px 1px 1px 1px` → `1px`; `1px 2px 1px 2px` → `1px 2px`. */
export function shorthand(values) {
  const [top, right, bottom, left] = values
  if (top === right && right === bottom && bottom === left) return top
  if (top === bottom && right === left) return `${top} ${right}`
  return values.join(' ')
}

/**
 * Tailwind composes `box-shadow` from five variables, so a plain `shadow-sm` computes to four
 * invisible layers and the real one. Keep the layers that draw something.
 */
export function visibleShadows(value) {
  const layers = value.split(/,(?![^(]*\))/).map((layer) => layer.trim())
  const drawn = layers.filter((layer) => { const color = parseColor(layer.match(/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|oklab|oklch|color)\([^()]*\)/)?.[0] ?? ''); return !color || color.a > 0 })
  return drawn.length ? drawn.map((layer) => mapColors(layer, (parsed) => formatColor(parsed))).join(', ') : 'none'
}

function boxStyles(node, context, extraPadding = { top: 0, right: 0, bottom: 0, left: 0 }) {
  const { used } = node
  const { binder, note } = context
  const style = {}
  const background = parseColor(used.backgroundColor)
  if (background && background.a > 0) style['background-color'] = binder.color('background', used.backgroundColor, node.classes)
  if (used.backgroundImage && used.backgroundImage !== 'none') {
    style['background-image'] = binder.colorsIn(used.backgroundImage)
    style['background-size'] = used.backgroundSize
    style['background-position'] = used.backgroundPosition
    style['background-repeat'] = used.backgroundRepeat
  }
  // Paper has no background-clip. It only shows where a border is see-through over a fill (every Quill
  // button variant): there Paper paints the fill under the 1px border, so the shape reads 1px larger all round.
  if (used.backgroundClip === 'padding-box' && style['background-color'] && sides(used, 'border', 'Width').some((width, index) => num(width) > 0 && parseColor(sides(used, 'border', 'Color')[index])?.a === 0)) {
    note('lost', node, 'background-clip: padding-box not carried (the fill runs under the transparent border)')
  }

  const widths = sides(used, 'border', 'Width').map(num)
  const styles = sides(used, 'border', 'Style')
  const colors = sides(used, 'border', 'Color')
  const drawn = widths.map((width, index) => width > 0 && styles[index] !== 'none' && styles[index] !== 'hidden')
  if (drawn.some(Boolean)) {
    const declaration = (index) => `${px(widths[index])} ${styles[index]} ${binder.color('border', colors[index], node.classes)}`
    const same = drawn.every(Boolean) && new Set(widths).size === 1 && new Set(styles).size === 1 && new Set(colors).size === 1
    if (same) style.border = declaration(0)
    else ['top', 'right', 'bottom', 'left'].forEach((side, index) => { if (drawn[index]) style[`border-${side}`] = declaration(index) })
  }

  const radii = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map((corner) => num(used[`border${corner}Radius`]))
  if (radii.some((radius) => radius > 0)) {
    // `rounded-full` computes to an astronomically large px value; any radius past half the box is a pill
    const pill = (radius) => radius >= 9999 || radius >= Math.max(node.rect.w, node.rect.h)
    const each = radii.map((radius) => (pill(radius) ? '9999px' : binder.length('radius', radius, { classes: node.classes })))
    style['border-radius'] = shorthand(each)
  }
  if (used.boxShadow && used.boxShadow !== 'none') style['box-shadow'] = visibleShadows(used.boxShadow)
  if (used.outlineStyle !== 'none' && num(used.outlineWidth) > 0) {
    style.outline = `${px(num(used.outlineWidth))} ${used.outlineStyle} ${binder.color('border', used.outlineColor, node.classes)}`
    if (num(used.outlineOffset)) style['outline-offset'] = px(num(used.outlineOffset))
  }
  style.opacity = String(round(num(used.opacity), 3))
  if ([used.overflowX, used.overflowY].some((value) => value && value !== 'visible')) style.overflow = 'hidden'

  const padding = sides(used, 'padding').map(num)
  const merged = [padding[0] + extraPadding.top, padding[1] + extraPadding.right, padding[2] + extraPadding.bottom, padding[3] + extraPadding.left]
  if (merged.some((value) => value > 0)) style.padding = shorthand(merged.map((value) => binder.length('spacing', value)))

  for (const [property, name] of [['transform', 'transform'], ['maskImage', 'mask'], ['clipPath', 'clip-path'], ['filter', 'filter'], ['backdropFilter', 'backdrop-filter']]) {
    if (used[property] && used[property] !== 'none') note('lost', node, `${name} not carried (${String(used[property]).slice(0, 60)})`)
  }
  return style
}

/** Width, height, min/max and position, from the values the stylesheet asked for (not the px they resolved to). */
function sizeStyles(node, context, { parentIsFlex, isRoot = false, cellWidth = null } = {}) {
  const { spec, used, rect } = node
  const style = {}
  const fromSpec = (value, measured, what) => {
    if (!value || value === 'auto' || value === 'none') return value
    if (/^-?[\d.]+(px|%)$/.test(value)) return value.endsWith('px') ? px(parseFloat(value)) : value
    if (/^(fit|min|max)-content$/.test(value)) return value
    // `calc(100% + 12px)` and friends: Paper takes plain lengths, so the measured size stands in
    context.note('approximated', node, `${what} ${value} replaced by its measured size`)
    return px(measured)
  }
  style.width = cellWidth !== null ? px(cellWidth) : fromSpec(spec.width, rect.w, 'width')
  style.height = fromSpec(spec.height, rect.h, 'height')
  // A root that simply fills Storybook's canvas has no width of its own: outside that canvas it needs the one it had.
  // A root that shrink-wraps its content keeps doing so in Paper (Paper rounds text boxes up to whole pixels, so a
  // traced width would be a hair too narrow and wrap the last item).
  if (isRoot && (style.width?.endsWith('%') || ((!style.width || style.width === 'auto') && node.fillsCanvas))) style.width = px(rect.w)
  style['min-width'] = fromSpec(spec.minWidth, rect.w, 'min-width')
  style['max-width'] = fromSpec(spec.maxWidth, rect.w, 'max-width')
  style['min-height'] = fromSpec(spec.minHeight, rect.h, 'min-height')
  style['max-height'] = fromSpec(spec.maxHeight, rect.h, 'max-height')
  if (parentIsFlex) {
    style['flex-grow'] = used.flexGrow
    style['flex-shrink'] = used.flexShrink
    style['flex-basis'] = fromSpec(spec.flexBasis, rect.w, 'flex-basis')
    style['align-self'] = used.alignSelf
  }
  if (cellWidth !== null) style['flex-shrink'] = '0'
  if (used.position === 'absolute' || used.position === 'fixed') {
    style.position = 'absolute'
    const insets = ['top', 'right', 'bottom', 'left'].map((side) => [side, spec[side]])
    const stated = insets.filter(([, value]) => value && value !== 'auto' && /^-?[\d.]+(px|%)$/.test(value))
    if (stated.length) for (const [side, value] of stated) style[side] = value
    else { style.left = px(rect.x - (context.parentRect?.x ?? 0)); style.top = px(rect.y - (context.parentRect?.y ?? 0)) }
    if (used.zIndex !== 'auto') style['z-index'] = used.zIndex
  } else if (used.position === 'relative' || used.position === 'sticky') {
    style.position = 'relative'
  }
  return style
}

function textStyles(used, classes, context) {
  const { binder } = context
  const fontPixels = num(used.fontSize)
  const style = {
    'font-family': binder.fontFamily(used.fontFamily),
    'font-size': binder.fontSize(fontPixels),
    // 400 is every text layer's default; naming it on each run would bury the weights that mean something
    'font-weight': Number(used.fontWeight) === 400 ? undefined : binder.fontWeight(used.fontWeight),
    'font-style': used.fontStyle,
    'line-height': used.lineHeight === 'normal' ? 'normal' : binder.lineHeight(num(used.lineHeight), fontPixels),
    'letter-spacing': used.letterSpacing === 'normal' || !num(used.letterSpacing) ? 'normal' : binder.letterSpacing(num(used.letterSpacing), fontPixels),
    color: binder.color('text', used.color, classes),
    'text-align': used.textAlign === 'end' ? 'right' : used.textAlign,
    'white-space': used.whiteSpace === 'pre-wrap' || used.whiteSpace === 'pre-line' ? used.whiteSpace : used.whiteSpace === 'nowrap' ? 'nowrap' : used.whiteSpace === 'pre' ? 'pre' : 'normal',
    'text-transform': used.textTransform,
    'text-decoration': used.textDecorationLine,
    'font-variation-settings': used.fontVariationSettings,
    'font-variant-numeric': used.fontVariantNumeric,
  }
  if (used.textOverflow === 'ellipsis' && used.overflowX !== 'visible') { style.overflow = 'hidden'; style['text-overflow'] = 'ellipsis' }
  return style
}

function layoutOf(node) {
  const { used } = node
  if (isFlex(used.display)) return { kind: 'flex', axis: used.flexDirection.startsWith('column') ? 'column' : 'row' }
  if (isGrid(used.display)) return { kind: 'grid' }
  if (used.display === 'table' || used.display === 'inline-table') return { kind: 'table' }
  if (TABLE_SECTION.has(used.display)) return { kind: 'section' }
  if (used.display === 'table-row') return { kind: 'table-row' }
  return { kind: 'flow' }
}

const gapOf = (used) => ({ row: num(used.rowGap), column: num(used.columnGap) })
const marginOf = (node) => Object.fromEntries(['top', 'right', 'bottom', 'left'].map((side) => {
  const value = node.spec?.[`margin${side[0].toUpperCase()}${side.slice(1)}`]
  return [side, value === 'auto' ? 'auto' : parseFloat(value) || 0]
}))

/** Does this element draw or size a box of its own (as opposed to being a bare run of text)? */
function hasBox(node) {
  const { used } = node
  const painted = (parseColor(used.backgroundColor)?.a ?? 0) > 0 || used.backgroundImage !== 'none' || used.boxShadow !== 'none'
  const bordered = sides(used, 'border', 'Width').some((width, index) => num(width) > 0 && sides(used, 'border', 'Style')[index] !== 'none')
  const padded = sides(used, 'padding').some((value) => num(value) > 0)
  return painted || bordered || padded || isFlex(used.display) || isGrid(used.display) || node.tag === 'button' || used.display.startsWith('table')
}

function spacer(axis, { size, grow }) {
  const style = grow ? { 'flex-grow': '1' } : axis === 'row' ? { width: px(size), 'flex-shrink': '0' } : { height: px(size), 'flex-shrink': '0' }
  return { tag: 'div', name: 'spacer', style: { display: 'flex', ...style }, children: [] }
}

/**
 * Convert a captured tree (see `captureStory`) to Paper nodes.
 * Returns `{ root, stats }`; `serialize(root)` gives the HTML.
 */
export function convertTree(tree, tokenTable) {
  const binder = createBinder(tokenTable)
  const notes = { approximated: new Map(), lost: [] }
  const stats = { nodes: 0 }
  const note = (kind, node, reason) => {
    if (kind === 'lost') { notes.lost.push(`${label(node)}: ${reason}`); return }
    const reasons = notes.approximated.get(node) ?? []
    notes.approximated.set(node, [...reasons, reason])
  }
  const emit = (paperNode) => { stats.nodes++; return paperNode }

  const textNode = (text, owner, classes, context, extra = {}) => emit({
    tag: 'span',
    text,
    style: dropDefaults({ ...textStyles(owner.used, classes, context), ...extra }),
    children: [],
  })

  function convertSvg(node, context, extra) {
    const fill = context.binder.color('text', node.used.color, context.textClasses)
    let markup = node.svg.replace(/(fill|stroke)="currentColor"/g, `$1="${fill}"`)
    // explicit paints: bind a colour that is exactly a token, leave gradients (`url(#…)`) alone
    markup = markup.replace(/(fill|stroke)="((?:rgba?|oklab|oklch|color)\([^"]*\))"/g, (_, attribute, value) => `${attribute}="${context.binder.color('background', value)}"`)
    // gradient stops stay literal (Paper does not resolve a token there) but in the short spelling
    markup = markup.replace(/stop-color="([^"]+)"/g, (_, value) => { const parsed = parseColor(value); return `stop-color="${parsed ? formatColor(parsed) : value}"` })
    const style = dropDefaults({ ...extra, 'flex-shrink': '0', opacity: String(round(num(node.used.opacity), 3)) })
    const css = Object.entries(style).map(([property, value]) => `${property}:${value}`).join(';')
    const name = node.slot || 'svg'
    return emit({ tag: 'svg', raw: markup.replace(/^<svg/, `<svg layer-name="${escapeAttr(name)}" style="${escapeAttr(css)}"`), style: {}, children: [] })
  }

  function convert(node, inherited) {
    const context = { ...inherited, binder, note }
    const textClasses = [...node.classes, ...inherited.textClasses]
    context.textClasses = textClasses
    const size = sizeStyles(node, context, inherited)
    if (node.tag === 'svg') return convertSvg(node, context, size)

    const layout = layoutOf(node)
    const flowing = node.children.filter((child) => !outOfFlow(child))
    const floating = node.children.filter(outOfFlow)
    const elements = flowing.filter((child) => !isText(child))
    const runs = flowing.filter(isText).map((child) => normalizeText(child.text, node.used.whiteSpace)).filter((text) => text.trim())
    const childContext = { textClasses, parentRect: node.rect }

    // A form field shows its value (or its placeholder) as text; the caret and selection are not design.
    if (node.tag === 'input' || node.tag === 'textarea') {
      const shown = node.value || node.placeholder || ''
      const tone = node.value ? {} : { color: binder.color('text', node.placeholderColor ?? node.used.color) }
      note('approximated', node, 'form field drawn as a frame holding its text')
      const frame = { display: 'flex', 'flex-direction': 'column', 'justify-content': node.tag === 'input' ? 'center' : 'flex-start', ...boxStyles(node, context), ...size }
      return emit({ tag: 'div', name: layerName(node), style: dropDefaults(frame), children: shown ? [textNode(shown, node, textClasses, context, tone)] : [] })
    }

    // A bare run of text: one Paper text layer, no frame around it.
    if (!elements.length && !floating.length && runs.length === 1 && !hasBox(node)) {
      const own = dropDefaults(size)
      return textNode(runs[0].trim(), node, textClasses, context, own)
    }

    let frame = { display: 'flex' }
    let children = []
    let axis = 'row'
    let gap = 0
    let collapse = false
    let marginItems = elements
    const convertChild = (child, extra = {}) => convert(child, { ...childContext, ...extra })

    if (layout.kind === 'flex') {
      axis = layout.axis
      const gaps = gapOf(node.used)
      gap = axis === 'row' ? gaps.column : gaps.row
      Object.assign(frame, {
        'flex-direction': node.used.flexDirection,
        'flex-wrap': node.used.flexWrap,
        'align-items': node.used.alignItems,
        'justify-content': node.used.justifyContent,
        gap: gaps.row === gaps.column ? binder.length('spacing', gaps.row) : `${binder.length('spacing', gaps.row)} ${binder.length('spacing', gaps.column)}`,
      })
      // Paper rounds every text box up to a whole pixel after it has sized the row, so a wrapping row that
      // exactly fitted its items in the browser pushes its last item onto a second line. A row that sat on
      // one line and has no growing child is written as not wrapping.
      const tops = elements.map((child) => child.rect.y)
      if (node.used.flexWrap !== 'nowrap' && axis === 'row' && elements.length > 1 && Math.max(...tops) - Math.min(...tops) < Math.min(...elements.map((child) => child.rect.h || 1)) && !elements.some((child) => Number(child.used.flexGrow) > 0)) {
        frame['flex-wrap'] = 'nowrap'
        note('approximated', node, 'a one-line wrapping row written as non-wrapping (Paper rounds text widths up, which would wrap it)')
      }
      // text directly inside a flex box is an anonymous flex item: it becomes a run of its own
      marginItems = flowing.filter((child) => !isText(child) || normalizeText(child.text, node.used.whiteSpace).trim())
      children = marginItems.map((child) => (isText(child) ? textNode(normalizeText(child.text, node.used.whiteSpace).trim(), node, textClasses, context) : convertChild(child, { parentIsFlex: true })))
    } else if (layout.kind === 'grid') {
      const columns = node.used.gridTemplateColumns.split(/\s+/).map(num).filter((value) => value > 0)
      const gaps = gapOf(node.used)
      const inner = { x: node.rect.x + num(node.used.borderLeftWidth) + num(node.used.paddingLeft), y: node.rect.y + num(node.used.borderTopWidth) + num(node.used.paddingTop) }
      const plan = planGrid({ columns, columnGap: gaps.column, rowGap: gaps.row, children: elements.map((child) => ({ x: child.rect.x - inner.x, y: child.rect.y - inner.y, width: child.rect.w })) })
      if (runs.length) note('lost', node, 'text directly inside a grid dropped')
      axis = 'column'
      frame['flex-direction'] = 'column'
      if (plan.kind === 'column') {
        gap = plan.gap
        frame.gap = binder.length('spacing', plan.gap)
        // in a column, `justify-items` is the cross axis and `align-content` the main one
        if (!['normal', 'stretch', 'legacy'].includes(node.used.justifyItems)) frame['align-items'] = node.used.justifyItems
        if (!['normal', 'stretch'].includes(node.used.alignContent)) frame['justify-content'] = node.used.alignContent
        children = elements.map((child) => convertChild(child))
      } else {
        note('approximated', node, `${columns.length}-column grid drawn as flex rows with measured cell widths`)
        frame.gap = binder.length('spacing', plan.rowGap)
        marginItems = []
        children = plan.rows.map((row) => emit({
          tag: 'div',
          name: 'row',
          style: dropDefaults({ display: 'flex', gap: binder.length('spacing', plan.columnGap), 'align-items': ['normal', 'stretch'].includes(node.used.alignItems) ? 'stretch' : node.used.alignItems }),
          children: row.flatMap((cell) => [
            ...(cell.offset > 0.5 ? [emit(spacer('row', { size: cell.offset - plan.columnGap }))] : []),
            convertChild(elements[cell.index], { cellWidth: cell.width }),
          ]),
        }))
      }
    } else if (layout.kind === 'table' || layout.kind === 'section') {
      axis = 'column'
      frame['flex-direction'] = 'column'
      marginItems = []
      children = elements.map((child) => convertChild(child))
    } else if (layout.kind === 'table-row') {
      note('approximated', node, 'table row drawn as a flex row with measured cell widths')
      marginItems = []
      children = elements.map((child) => convertChild(child, { cellWidth: child.rect.w }))
    } else {
      // Normal flow. Blocks stack; inline content sits in a line.
      const inline = elements.filter((child) => isInlineLevel(child.used.display))
      const stacked = elements.length > 0 && inline.length === 0 && runs.length === 0
      if (stacked) {
        axis = 'column'
        collapse = true
        frame['flex-direction'] = 'column'
        children = elements.map((child) => convertChild(child))
      } else if (!elements.length) {
        // only text, but the element has a box (padding, a fill, a fixed height): a frame holding one text layer
        axis = 'column'
        frame['flex-direction'] = 'column'
        // a <button> centres its label vertically on its own; a block does not
        if (node.tag === 'button' || node.used.display === 'table-cell') frame['justify-content'] = node.used.verticalAlign === 'top' ? 'flex-start' : 'center'
        marginItems = []
        children = runs.length ? [textNode(runs.join(' ').trim(), node, textClasses, context)] : []
      } else {
        // Mixed inline content (text beside an icon, a bold figure inside a sentence). Paper's
        // text layers hold one style, so each run is its own layer on a wrapping flex line.
        frame['flex-wrap'] = node.used.whiteSpace === 'nowrap' ? 'nowrap' : 'wrap'
        frame['align-items'] = 'baseline'
        frame['justify-content'] = { center: 'center', right: 'flex-end', end: 'flex-end' }[node.used.textAlign]
        if (inline.length !== elements.length) note('approximated', node, 'block and inline children mixed on one line')
        const items = flowing.filter((child) => !isText(child) || normalizeText(child.text, node.used.whiteSpace).trim())
        if (items.filter(isText).length && items.length > 1) note('approximated', node, `rich text split into ${items.length} one-style runs (it can no longer rewrap as a sentence)`)
        marginItems = []
        children = items.map((child, index) => {
          if (!isText(child)) return convertChild(child)
          let text = normalizeText(child.text, node.used.whiteSpace)
          if (index === 0) text = text.trimStart()
          if (index === items.length - 1) text = text.trimEnd()
          // the space between two runs lives at the edge of one of them; `pre` stops it collapsing
          return textNode(text, node, textClasses, context, /^\s|\s$/.test(text) ? { 'white-space': 'pre' } : {})
        })
      }
    }

    // Margins on the in-flow children, rewritten in the parent's terms.
    let extraPadding
    if (marginItems.length) {
      const moved = translateMargins({ axis, gap, collapse }, marginItems.map((child) => ({ margin: isText(child) ? { top: 0, right: 0, bottom: 0, left: 0 } : marginOf(child) })))
      extraPadding = moved.padding
      for (const reason of moved.lost) note('approximated', node, reason)
      for (const entry of [...moved.spacers].sort((a, b) => b.before - a.before)) children.splice(entry.before, 0, emit(spacer(axis, entry)))
    }

    for (const pseudo of node.pseudo ?? []) {
      const pseudoNode = convert({ ...pseudo, tag: 'div', classes: [], children: pseudo.content ? [{ text: pseudo.content }] : [], slot: `::${pseudo.which}` }, childContext)
      if (pseudo.which === 'before') children.unshift(pseudoNode)
      else children.push(pseudoNode)
      note('approximated', node, `::${pseudo.which} drawn as a real layer`)
    }
    for (const child of floating) children.push(convertChild(child))

    frame = { ...frame, ...boxStyles(node, context, extraPadding), ...size }
    // Paper keeps a gradient but drops background-size, so a gradient stretched wider than its box (the usage
    // meter shows the first 30 % of a full-width AI gradient) would be squeezed in whole. Draw it as a child
    // layer of the stated size, clipped by this frame.
    const stretched = frame['background-image'] && node.used.backgroundRepeat === 'no-repeat' && node.used.backgroundSize.match(/^([\d.]+)% ([\d.]+)%$/)
    if (stretched && (Number(stretched[1]) !== 100 || Number(stretched[2]) !== 100)) {
      children.unshift(emit({ tag: 'div', name: 'gradient', style: { display: 'flex', position: 'absolute', left: '0px', top: '0px', width: `${round(Number(stretched[1]))}%`, height: `${round(Number(stretched[2]))}%`, 'background-image': frame['background-image'] }, children: [] }))
      for (const property of ['background-image', 'background-size', 'background-position', 'background-repeat']) delete frame[property]
      frame.overflow = 'hidden'
      frame.position = frame.position ?? 'relative'
      note('approximated', node, 'background-size is not kept by Paper: the gradient is a clipped child layer')
    }
    // Paper drops an absolutely positioned child unless its parent is positioned, as CSS does
    if (floating.length && !frame.position) frame.position = 'relative'
    return emit({ tag: 'div', name: layerName(node), style: dropDefaults(frame), children })
  }

  const root = convert(tree, { textClasses: [], isRoot: true, parentRect: tree.rect })
  const approximated = [...notes.approximated].map(([node, reasons]) => ({ node: label(node), reasons }))
  return {
    root,
    stats: {
      nodes: stats.nodes,
      approximated: approximated.length,
      approximations: approximated,
      lost: notes.lost,
      bound: binder.stats.bound,
      bindable: binder.stats.bindable,
      bindingRate: binder.stats.bindable ? round(binder.stats.bound / binder.stats.bindable, 3) : 1,
      unbound: binder.stats.unbound,
    },
  }
}

// ------------------------------------------------------------------ Paper nodes → HTML

export function serialize(node, { children = true } = {}) {
  if (node.raw) return node.raw
  const css = Object.entries(node.style).map(([property, value]) => `${property}:${value}`).join(';')
  const name = node.name ? ` layer-name="${escapeAttr(node.name)}"` : ''
  const inner = node.text !== undefined ? escapeText(node.text) : children ? node.children.map((child) => serialize(child)).join('') : ''
  return `<${node.tag}${name} style="${escapeAttr(css)}">${inner}</${node.tag}>`
}

/** The visible text of a captured tree, in order: what Paper's text layers should read. */
export function visibleTexts(tree) {
  const texts = []
  const walk = (node, whiteSpace) => {
    if (isText(node)) { const text = normalizeText(node.text, whiteSpace).trim(); if (text) texts.push(text); return }
    if (node.tag === 'input' || node.tag === 'textarea') { const shown = node.value || node.placeholder; if (shown) texts.push(shown.trim()) }
    for (const child of node.children ?? []) walk(child, node.used.whiteSpace)
  }
  walk(tree, 'normal')
  return texts
}

// ------------------------------------------------------------------ the browser half

/* The properties read from the browser. `used` are resolved values (px, rgb); `spec` are
   the values the cascade asked for (`auto`, `100%`), which is how a rule is told from a result. */
const USED = ['display', 'position', 'visibility', 'flexDirection', 'flexWrap', 'alignItems', 'justifyContent', 'alignSelf', 'alignContent', 'justifyItems', 'flexGrow', 'flexShrink', 'columnGap', 'rowGap', 'gridTemplateColumns',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'overflowX', 'overflowY', 'backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition', 'backgroundRepeat', 'backgroundClip',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
  'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius', 'boxShadow', 'opacity', 'outlineStyle', 'outlineWidth', 'outlineColor', 'outlineOffset',
  'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing', 'color', 'textAlign', 'whiteSpace', 'textTransform', 'textDecorationLine', 'textOverflow', 'fontVariationSettings', 'fontVariantNumeric',
  'verticalAlign', 'transform', 'zIndex', 'clipPath', 'maskImage', 'filter', 'backdropFilter']
const SPEC = { width: 'width', height: 'height', minWidth: 'min-width', maxWidth: 'max-width', minHeight: 'min-height', maxHeight: 'max-height', flexBasis: 'flex-basis', marginTop: 'margin-top', marginRight: 'margin-right', marginBottom: 'margin-bottom', marginLeft: 'margin-left', top: 'top', right: 'right', bottom: 'bottom', left: 'left' }

/* Runs inside the page. Self-contained: it cannot see anything in this module but its arguments. */
function captureInPage({ usedProperties, specProperties }) {
  const wrapper = document.querySelector('#storybook-root > div')
  // the same element the Figma visual diff shoots: the theme wrapper's one real child, without the canvas padding
  const kids = [...(wrapper?.children ?? [])].filter((element) => !element.matches('section[aria-label], ol[data-sonner-toaster]'))
  const target = kids.length === 1 ? kids[0] : wrapper
  target.setAttribute('data-paper-root', '')
  const origin = target.getBoundingClientRect()
  const trim = (value) => Math.round(value * 100) / 100

  const read = (computed, map, element) => {
    const used = Object.fromEntries(usedProperties.map((property) => [property, computed[property]]))
    const spec = {}
    if (map) for (const [key, property] of Object.entries(specProperties)) spec[key] = map.get(property)?.toString() ?? 'auto'
    const box = element?.getBoundingClientRect()
    return { used, spec, rect: box ? { x: trim(box.x - origin.x), y: trim(box.y - origin.y), w: trim(box.width), h: trim(box.height) } : { x: 0, y: 0, w: 0, h: 0 } }
  }

  const hidden = (element, computed) => {
    if (computed.display === 'none' || computed.visibility === 'hidden' || computed.visibility === 'collapse' || element.hasAttribute('hidden')) return true
    const box = element.getBoundingClientRect()
    // screen-reader-only text: clipped to nothing, or squeezed into one pixel
    if (computed.clipPath === 'inset(50%)') return true
    if (computed.position !== 'static' && box.width <= 1 && box.height <= 1 && computed.overflowX !== 'visible') return true
    // an empty, sizeless, out-of-flow element (a live region waiting for a message) draws nothing and moves nothing
    if ((computed.position === 'absolute' || computed.position === 'fixed') && box.width * box.height === 0 && !element.childNodes.length) return true
    return false
  }

  const SHAPES = 'path, circle, rect, line, polyline, polygon, ellipse, text, use'
  const svgMarkup = (svg, computed) => {
    const clone = svg.cloneNode(true)
    const originals = [svg, ...svg.querySelectorAll('*')]
    const copies = [clone, ...clone.querySelectorAll('*')]
    const stated = (element, attribute) => { for (let at = element; at && at !== svg.parentElement; at = at.parentElement) { const value = at.getAttribute?.(attribute); if (value) return value } return null }
    originals.forEach((original, index) => {
      const copy = copies[index]
      for (const attribute of [...copy.attributes]) if (/^(class|role|focusable|style|aria-|data-)/.test(attribute.name)) copy.removeAttribute(attribute.name)
      if (original.matches('stop')) {
        // Paper does not resolve var() inside a gradient stop, so stops are written as literal colours
        const style = getComputedStyle(original)
        copy.setAttribute('stop-color', style.stopColor)
        if (style.stopOpacity !== '1') copy.setAttribute('stop-opacity', style.stopOpacity)
      } else if (original.matches(SHAPES)) {
        const style = getComputedStyle(original)
        for (const paint of ['fill', 'stroke']) {
          const attribute = stated(original, paint)
          const value = style[paint]
          if (value === 'none') { if (paint === 'fill' || attribute) copy.setAttribute(paint, 'none'); continue }
          if (value.startsWith('url(')) { copy.setAttribute(paint, value.replace(/"/g, '')); continue }
          // an icon inherits the text colour; keep that link so it can bind to the text's token
          copy.setAttribute(paint, attribute === 'currentColor' || value === computed.color ? 'currentColor' : value)
        }
        if (style.stroke !== 'none' && !copy.getAttribute('stroke-width')) copy.setAttribute('stroke-width', style.strokeWidth)
      }
    })
    for (const paint of ['fill', 'stroke']) clone.removeAttribute(paint)
    const box = svg.getBoundingClientRect()
    clone.setAttribute('width', String(trim(box.width)))
    clone.setAttribute('height', String(trim(box.height)))
    return clone.outerHTML
  }

  const pseudoOf = (element) => {
    const found = []
    for (const which of ['before', 'after']) {
      const computed = getComputedStyle(element, `::${which}`)
      if (!computed.content || computed.content === 'none' || computed.content === 'normal' || computed.display === 'none') continue
      const captured = read(computed, null, null)
      // a pseudo-element has no box to measure; its stated size is the best there is
      captured.spec = Object.fromEntries(Object.keys(specProperties).map((key) => [key, computed[key] || 'auto']))
      captured.rect = { x: 0, y: 0, w: parseFloat(computed.width) || 0, h: parseFloat(computed.height) || 0 }
      found.push({ which, content: computed.content.replace(/^["']|["']$/g, ''), ...captured })
    }
    return found
  }

  const walk = (element) => {
    const computed = getComputedStyle(element)
    if (hidden(element, computed)) return null
    const tag = element.tagName.toLowerCase()
    const node = {
      tag,
      slot: element.getAttribute('data-slot'),
      role: element.getAttribute('role'),
      classes: typeof element.className === 'string' ? element.className.split(/\s+/).filter(Boolean) : [],
      ...read(computed, element.computedStyleMap(), element),
      children: [],
      pseudo: tag === 'svg' ? [] : pseudoOf(element),
    }
    if (tag === 'svg') { node.svg = svgMarkup(element, computed); return node }
    if (tag === 'input' || tag === 'textarea') {
      node.value = element.value
      node.placeholder = element.getAttribute('placeholder')
      node.placeholderColor = getComputedStyle(element, '::placeholder').color
      return node
    }
    for (const child of element.childNodes) {
      // React writes `of {total}` as two text nodes; to the reader, and to Paper, they are one run
      if (child.nodeType === Node.TEXT_NODE) { const last = node.children.at(-1); if (last && typeof last.text === 'string') last.text += child.data; else node.children.push({ text: child.data }) }
      else if (child.nodeType === Node.ELEMENT_NODE) {
        const captured = walk(child)
        if (!captured) continue
        // `display: contents` has no box: its children belong to this element's layout
        if (captured.used.display === 'contents') node.children.push(...captured.children)
        else node.children.push(captured)
      }
    }
    return node
  }
  const tree = walk(target)
  if (tree) {
    const canvas = getComputedStyle(wrapper)
    // "fills" means: the canvas spans the window and the piece spans the canvas. A centred layout shrinks the canvas to the piece instead.
    const spansWindow = wrapper.getBoundingClientRect().width >= document.documentElement.clientWidth - 1
    tree.fillsCanvas = spansWindow && origin.width >= wrapper.clientWidth - parseFloat(canvas.paddingLeft) - parseFloat(canvas.paddingRight) - 1
  }
  return tree
}

/** Open a story the way the Figma visual diff does (Dawn, motion frozen, fonts loaded) and leave the page on it. */
export async function openStory(page, storyId, base = STORYBOOK) {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(`${base}/iframe.html?viewMode=story&id=${storyId}&globals=theme:light`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('#storybook-root')?.children.length > 0, null, { timeout: 30000 })
  await page.evaluate(() => document.fonts.ready)
  await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' })
  // play functions (a story that focuses its primary button) need a beat to finish
  await page.waitForTimeout(1500)
}

/** The story's tree, plus a 2x PNG of the same element for the picture check. */
export async function captureStory(page, storyId, { base = STORYBOOK, screenshot = false } = {}) {
  await openStory(page, storyId, base)
  const tree = await page.evaluate(captureInPage, { usedProperties: USED, specProperties: SPEC })
  if (!tree) throw new Error(`${storyId}: the story rendered nothing visible`)
  let png = null
  if (screenshot) {
    // A centred story sits on a fraction of a pixel, which smears every edge by one device pixel against
    // Paper's export. Slide it onto the pixel grid (a paint-only move: layout is already captured).
    // Paper draws all text with grayscale smoothing; without the same here, light-on-dark labels read a weight heavier.
    await page.addStyleTag({ content: '* { -webkit-font-smoothing: antialiased !important; }' })
    await page.evaluate(() => { const target = document.querySelector('[data-paper-root]'); const box = target.getBoundingClientRect(); target.style.translate = `${Math.round(box.x) - box.x}px ${Math.round(box.y) - box.y}px` })
    png = await page.locator('[data-paper-root]').screenshot({ type: 'png' })
  }
  return { tree, png }
}

export async function launch() {
  const { chromium } = createRequire(import.meta.url)('playwright')
  const browser = await chromium.launch()
  const page = await browser.newPage({ deviceScaleFactor: SCALE })
  return { browser, page }
}

export const quillTokenTable = () => resolveTokens(quillPaperTokens().tokens)

/** A story → `{ root, html, stats, texts, size }`. */
export async function convertStory(page, storyId, { base = STORYBOOK, tokenTable = quillTokenTable(), screenshot = false } = {}) {
  const { tree, png } = await captureStory(page, storyId, { base, screenshot })
  const { root, stats } = convertTree(tree, tokenTable)
  return { tree, root, html: serialize(root), stats, texts: visibleTexts(tree), size: { width: tree.rect.w, height: tree.rect.h }, png }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2)
  const base = args.includes('--base') ? args[args.indexOf('--base') + 1] : STORYBOOK
  const storyId = args.find((arg) => !arg.startsWith('--') && arg !== base)
  if (!storyId) { console.error('usage: node scripts/paper/convert.mjs <story-id> [--base http://localhost:6150]'); process.exit(1) }
  const { browser, page } = await launch()
  try {
    const result = await convertStory(page, storyId, { base })
    console.log(result.html)
    console.error(JSON.stringify({ size: result.size, ...result.stats }, null, 2))
  } finally {
    await browser.close()
  }
}
