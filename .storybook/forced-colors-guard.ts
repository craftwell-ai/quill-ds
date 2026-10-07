import { cdp } from 'vitest/browser'
import { tabTo } from '../src/stories/focus-ring'

// Test-runner-only annotations (both vitest setup files add them), not part of preview.tsx: turning on the
// browser's forced-colours mode (Windows High Contrast) needs the browser's own controls, which the real
// Storybook page does not have. A story opts in with `parameters.forcedColorsFocus` and marks the controls to
// measure with `data-forced-colors-probe`.
//
// What it proves (CRA-294, WCAG 2.4.7): in that mode the browser drops every box-shadow, which is how a stock
// field, dropdown or button draws its focus ring, and their `outline-none` removes the outline. The theme's
// one forced-colours rule has to win over that class and give each focused control a real outline. Without the
// rule this fails with `outline-style: none` on every stock control.

const PROBE = 'data-forced-colors-probe'
const MIN_OUTLINE_PX = 2

// Chromium's own switch for the media feature; the same one DevTools' Rendering panel flips.
const emulate = (value: 'active' | '') => cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value }] })

export const afterEach = async (context: { id: string; viewMode?: string; canvasElement: HTMLElement; parameters: { forcedColorsFocus?: boolean } }) => {
  if (!context.parameters.forcedColorsFocus || context.viewMode === 'docs') return
  const controls = [...context.canvasElement.querySelectorAll<HTMLElement>(`[${PROBE}]`)]
  if (controls.length === 0) throw new Error(`Forced colours (${context.id}): the story marks no control with ${PROBE}`)

  const problems: string[] = []
  await emulate('active')
  try {
    // If the switch did nothing, every measurement below would be of the normal page and prove nothing.
    if (!window.matchMedia('(forced-colors: active)').matches) throw new Error(`Forced colours (${context.id}): the browser did not enter forced-colours mode`)
    ;(document.activeElement as HTMLElement | null)?.blur()
    for (const control of controls) {
      await tabTo(control)
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
      const style = getComputedStyle(control)
      const name = control.id || control.textContent?.trim() || control.tagName.toLowerCase()
      if (!control.matches(':focus-visible')) problems.push(`${name}: not :focus-visible after Tab, so the measurement means nothing`)
      else if (style.outlineStyle !== 'solid' || parseFloat(style.outlineWidth) < MIN_OUTLINE_PX) {
        problems.push(`${name}: outline is ${style.outlineStyle} ${style.outlineWidth} (want solid, at least ${MIN_OUTLINE_PX}px)`)
      }
    }
  } finally {
    await emulate('')
  }
  if (window.matchMedia('(forced-colors: active)').matches) problems.push('forced-colours mode was left on after the check')
  if (problems.length > 0) {
    throw new Error(
      `Keyboard focus in forced colours (${context.id}): ${problems.join('; ')}. The theme's ` +
        `\`@media (forced-colors: active) { :focus-visible { outline … } }\` rule (scripts/build-tokens.mjs, ` +
        `FORCED_COLORS_RULES) must reach the page outside every cascade layer to beat \`outline-none\`.`,
    )
  }
}
