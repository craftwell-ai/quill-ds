import { useEffect } from 'react'
import type { RefObject } from 'react'

/**
 * Base UI's overlay primitives (Select, Combobox, DropdownMenu, Popover,
 * HoverCard, Tooltip, Command, Menubar, NavigationMenu, ContextMenu) all
 * render their open content through a `[data-base-ui-portal]` element
 * appended directly to <body>, positioned with `position: fixed` — entirely
 * outside wrapperRef's box. Storybook's canvas has nothing to naturally
 * reserve space for that overlay, so an open popup visually overlaps
 * whatever renders after the story on the page. This hook watches for open
 * portals and grows the wrapper's bottom padding to match, so the same
 * margin that appears above the story also appears below the open overlay.
 */
export function useOverlaySpace(wrapperRef: RefObject<HTMLElement | null>, basePadding: number) {
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    let frame = 0

    const measure = () => {
      // Reset to baseline first so every measurement starts from the same
      // known state — otherwise a padding boost from a previous measurement
      // would compound into the next one.
      wrapper.style.paddingBottom = `${basePadding}px`

      // Docs pages mount one hook instance per story, all sharing this
      // document — without this guard, an open popup in one story would
      // inflate every other story's canvas too. Base UI triggers carry
      // `data-popup-open` on themselves (not the portaled popup content)
      // while their popup is open, so this scopes the check to "does THIS
      // story's own trigger own an open popup" before touching the DOM.
      if (!wrapper.querySelector('[data-popup-open]')) return

      const naturalBottom = wrapper.getBoundingClientRect().bottom

      const openPopups = document.querySelectorAll('[data-base-ui-portal] [data-open]')
      let maxPopupBottom = 0
      for (const popup of openPopups) {
        const bottom = popup.getBoundingClientRect().bottom
        if (bottom > maxPopupBottom) maxPopupBottom = bottom
      }

      if (maxPopupBottom > naturalBottom - basePadding) {
        const extra = maxPopupBottom + basePadding - naturalBottom
        wrapper.style.paddingBottom = `${basePadding + extra}px`
      }
    }

    const scheduleMeasure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    const observer = new MutationObserver(scheduleMeasure)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-open'],
    })

    scheduleMeasure()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [wrapperRef, basePadding])
}
