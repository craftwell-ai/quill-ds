import { expect, userEvent } from 'storybook/test'

// Walks the page with Tab until the element has focus. Pressing Tab (not calling .focus()) is what makes
// :focus-visible apply, the same way a keyboard user reaches the control.
export const tabTo = async (element: HTMLElement, maxPresses = 30) => {
  for (let press = 0; press < maxPresses && document.activeElement !== element; press++) {
    await userEvent.tab()
  }
  await expect(element).toHaveFocus()
}

// The stock Button draws its keyboard focus as a 3px ring (a box-shadow); an unfocused control has none.
export const expectFocusRing = async (element: HTMLElement) => {
  await expect(getComputedStyle(element).boxShadow).toBe('none')
  await tabTo(element)
  await expect(getComputedStyle(element).boxShadow).not.toBe('none')
}
