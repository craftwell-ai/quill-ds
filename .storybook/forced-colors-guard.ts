import { cdp } from 'vitest/browser'
import { tabTo } from '../src/stories/focus-ring'

// Test-runner-only annotations (both vitest setup files add them), not part of preview.tsx: turning on the
// browser's forced-colours mode (Windows High Contrast) needs the browser's own controls, which the real
// Storybook page does not have. A story opts in with `parameters.forcedColorsFocus`:
//   true                         measure every element marked `data-forced-colors-probe`
//   { selector, inset? }         measure what the selector finds anywhere on the page (a popover is rendered
//                                outside the story's own element); `inset: true` also requires the outline to be
//                                drawn inside the element (a negative offset)
//
// What it proves (CRA-294, WCAG 2.4.7): in that mode the browser drops every box-shadow, which is how a stock
// field, dropdown or button draws its focus ring, and their `outline-none` removes the outline. The theme's
// forced-colours rule has to win over that class and give each focused control a real outline. Without the
// rule this fails with `outline-style: none` on every stock control.
//
// It also proves the outline can be SEEN: a 2px outline 2px outside an element that fills an `overflow-hidden`
// or scrolling parent is cut off by that parent. Such an element carries `data-focus-inset`, which the theme
// answers with an outline drawn inside it.

const PROBE = 'data-forced-colors-probe'
const MIN_OUTLINE_PX = 2

type Option = boolean | { selector: string; inset?: boolean }

// Chromium's own switch for the media feature; the same one DevTools' Rendering panel flips.
const emulate = (value: 'active' | '') => cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value }] })

// What a person would call the control: its label, not an id the component library made up.
const nameOf = (control: HTMLElement) => {
  const labelledBy = control.getAttribute('aria-labelledby')?.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '').join(' ').trim()
  return control.getAttribute('aria-label') || labelledBy || control.textContent?.trim().slice(0, 40) || control.id || control.tagName.toLowerCase()
}

// The first ancestor that cuts off what is drawn outside it, and how far the outline sticks out of it.
const clippedBy = (control: HTMLElement, style: CSSStyleDeclaration): string | null => {
  const reach = Math.max(0, parseFloat(style.outlineOffset) + parseFloat(style.outlineWidth))
  const rect = control.getBoundingClientRect()
  const box = { left: rect.left - reach, top: rect.top - reach, right: rect.right + reach, bottom: rect.bottom + reach }
  for (let parent = control.parentElement; parent && parent !== document.documentElement; parent = parent.parentElement) {
    const overflow = getComputedStyle(parent)
    const clipsX = overflow.overflowX !== 'visible'
    const clipsY = overflow.overflowY !== 'visible'
    if (!clipsX && !clipsY) continue
    const outer = parent.getBoundingClientRect()
    const inner = { left: outer.left + parent.clientLeft, top: outer.top + parent.clientTop, right: outer.left + parent.clientLeft + parent.clientWidth, bottom: outer.top + parent.clientTop + parent.clientHeight }
    const over = Math.max(
      clipsX ? inner.left - box.left : 0, clipsX ? box.right - inner.right : 0,
      clipsY ? inner.top - box.top : 0, clipsY ? box.bottom - inner.bottom : 0,
    )
    if (over > 0.5) return `${over.toFixed(1)}px of it is cut off by <${parent.tagName.toLowerCase()}${parent.getAttribute('data-slot') ? ` data-slot="${parent.getAttribute('data-slot')}"` : ''}> (overflow: ${overflow.overflowX} ${overflow.overflowY})`
  }
  return null
}

export const afterEach = async (context: { id: string; viewMode?: string; canvasElement: HTMLElement; parameters: { forcedColorsFocus?: Option } }) => {
  const option = context.parameters.forcedColorsFocus
  if (!option || context.viewMode === 'docs') return
  const selector = option === true ? `[${PROBE}]` : option.selector
  const wantInset = option !== true && option.inset === true
  const controls = [...document.querySelectorAll<HTMLElement>(selector)]
  if (controls.length === 0) throw new Error(`Forced colours (${context.id}): nothing on the page matches ${selector}`)

  const problems: string[] = []
  await emulate('active')
  try {
    // If the switch did nothing, every measurement below would be of the normal page and prove nothing.
    if (!window.matchMedia('(forced-colors: active)').matches) throw new Error(`Forced colours (${context.id}): the browser did not enter forced-colours mode`)
    for (const control of controls) {
      await tabTo(control)
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
      const style = getComputedStyle(control)
      const name = nameOf(control)
      if (!control.matches(':focus-visible')) { problems.push(`${name}: not :focus-visible after Tab, so the measurement means nothing`); continue }
      if (style.outlineStyle !== 'solid' || parseFloat(style.outlineWidth) < MIN_OUTLINE_PX) {
        problems.push(`${name}: outline is ${style.outlineStyle} ${style.outlineWidth} (want solid, at least ${MIN_OUTLINE_PX}px)`)
        continue
      }
      if (wantInset && !(parseFloat(style.outlineOffset) < 0)) problems.push(`${name}: outline-offset is ${style.outlineOffset} (want it inside the element: negative)`)
      const clipped = clippedBy(control, style)
      if (clipped) problems.push(`${name}: the outline (offset ${style.outlineOffset}) is not fully visible, ${clipped}`)
    }
  } finally {
    await emulate('')
  }
  if (window.matchMedia('(forced-colors: active)').matches) problems.push('forced-colours mode was left on after the check')
  if (problems.length > 0) {
    throw new Error(
      `Keyboard focus in forced colours (${context.id}): ${problems.join('; ')}. The theme's ` +
        `\`@media (forced-colors: active)\` rules (scripts/build-tokens.mjs, FORCED_COLORS_RULES) must reach the page ` +
        `outside every cascade layer to beat \`outline-none\`; an element flush inside a clipping parent needs \`data-focus-inset\`.`,
    )
  }
}
