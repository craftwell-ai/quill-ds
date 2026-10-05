import { page } from 'vitest/browser'
import { isDoDontStory, DO_DONT_MAX_WIDTH_PX } from '../src/stories/DoDont'

// Test-runner-only annotations (both vitest setup files add them), not part of preview.tsx: the guard needs the
// browser's viewport control, which the real Storybook page does not have. Project-level, so every Do/Don't story is
// checked without its file opting in — the file that forgets is exactly the one this exists for.
//
// The bug it prevents: a meta decorator sizes every story to one component (`w-64`, `w-[30rem]`...), so the Do and the
// Don't shared a column meant for one example and each got roughly half of it (26 story files, 120px at the worst).

const DESKTOP = { width: 1280, height: 800 }

// The floor per figure at the desktop viewport. The well-framed Do/Don't stories measure 592px a side there (a 1200px
// canvas, two columns, a 16px gap) and the squeezed ones topped out at 312; 560 sits just under the good ones so a
// layout tweak of a few pixels does not trip it, and far above anything squeezed.
const MIN_FIGURE_WIDTH_PX = 560

let restoreViewport: { width: number; height: number } | null = null

export const beforeEach = async (context: { id: string; viewMode?: string }) => {
  if (!isDoDontStory(context) || context.viewMode === 'docs') return
  // A phone-width test viewport stacks the pair into one column, which hides the squeeze this checks for.
  restoreViewport = { width: window.innerWidth, height: window.innerHeight }
  await page.viewport(DESKTOP.width, DESKTOP.height)
}

export const afterEach = async (context: { id: string; viewMode?: string; canvasElement: HTMLElement; parameters: { layout?: string } }) => {
  if (!isDoDontStory(context) || context.viewMode === 'docs') return
  try {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
    const problems = measureProblems(context.canvasElement)
    // Storybook's own `layout: 'centered'` (the global default) shrink-wraps the story root, so a pair that forgets
    // 'padded' is only as wide as its content in the real Storybook. That CSS is absent from the test runner's page, so
    // the measurements above cannot see it; the parameter is the thing to check.
    if (context.parameters.layout !== 'padded') problems.push(`parameters.layout is '${context.parameters.layout}', not 'padded'`)
    if (problems.length > 0) {
      throw new Error(
        `Do/Don't framing (${context.id}): ${problems.join('; ')}. A squeezed pair usually means a meta decorator sizes ` +
          `the story to one component: use inColumn() from src/stories/DoDont. An example that overflows or stretches ` +
          `needs exampleClassName on its DoDontPair.`,
      )
    }
  } finally {
    if (restoreViewport) await page.viewport(restoreViewport.width, restoreViewport.height)
    restoreViewport = null
  }
}

function measureProblems(canvasElement: HTMLElement): string[] {
  const pairs = [...canvasElement.querySelectorAll<HTMLElement>('[data-quill-dodont]')]
  if (pairs.length === 0) return ['the story renders no DoDontPair']

  // The preview decorator's padded wrapper is the canvas the pair is supposed to fill.
  const canvas = canvasElement.querySelector<HTMLElement>('[data-accent]') ?? canvasElement
  const canvasStyle = getComputedStyle(canvas)
  const canvasRect = canvas.getBoundingClientRect()
  const left = canvasRect.left + parseFloat(canvasStyle.paddingLeft)
  const innerWidth = canvasRect.width - parseFloat(canvasStyle.paddingLeft) - parseFloat(canvasStyle.paddingRight)
  const expectedWidth = Math.min(innerWidth, DO_DONT_MAX_WIDTH_PX)

  const problems: string[] = []
  pairs.forEach((pair, index) => {
    const label = pairs.length > 1 ? `pair ${index + 1}: ` : ''
    const pairRect = pair.getBoundingClientRect()
    const figures = [...pair.querySelectorAll<HTMLElement>(':scope > figure')]
    const widths = figures.map((figure) => figure.getBoundingClientRect().width)

    if (pairRect.width < expectedWidth - 1) {
      problems.push(`${label}the pair is ${pairRect.width.toFixed(0)}px wide in a ${expectedWidth.toFixed(0)}px canvas`)
    }
    widths.forEach((width) => {
      if (width < MIN_FIGURE_WIDTH_PX) problems.push(`${label}a figure is ${width.toFixed(0)}px wide (minimum ${MIN_FIGURE_WIDTH_PX})`)
    })
    if (widths.length === 2 && Math.abs(widths[0] - widths[1]) > 1) {
      problems.push(`${label}the figures are ${widths[0].toFixed(1)}px and ${widths[1].toFixed(1)}px wide, not equal`)
    }
    const offCentre = pairRect.left + pairRect.width / 2 - (left + innerWidth / 2)
    if (Math.abs(offCentre) > 0.5) problems.push(`${label}the pair is ${offCentre.toFixed(1)}px off the canvas centre`)
    figures.forEach((figure, side) => {
      const example = figure.firstElementChild as HTMLElement | null
      if (example && example.scrollWidth > example.clientWidth + 0.5) {
        problems.push(`${label}the ${side === 0 ? 'Do' : "Don't"} example overflows its figure (${example.scrollWidth}px in ${example.clientWidth}px)`)
      }
    })
  })
  return problems
}
