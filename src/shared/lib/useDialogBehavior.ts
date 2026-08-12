import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

/*
  Everything that can take focus. Used by the tab trap below; the
  `:not([disabled])` clauses matter because a disabled control is skipped by
  the browser too, and trapping onto one would strand the user.
*/
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

interface DialogBehaviorOptions {
  /** The panel element. Focus is trapped inside it. */
  panelRef: RefObject<HTMLElement | null>
  /** Called by Escape. */
  onClose: () => void
}

/**
 * The four behaviours any dialog owes the user, in one place:
 *
 *   1. Escape closes it.
 *   2. Tab cycles inside it and never escapes to the page behind.
 *   3. Focus moves in on open and returns to the trigger on close.
 *   4. The page behind does not scroll.
 *
 * All four are invisible when they work and infuriating when they are missing,
 * and all four are needed identically by the centre-screen `Modal` and the
 * side-anchored `Drawer`. Written once here rather than twice there: two
 * copies of a focus trap is two chances to fix a bug in only one of them.
 *
 * Not the native `<dialog>` element, which would give most of this for free —
 * jsdom 29 still does not implement `showModal()`, so every component test
 * that opened one would throw. A UI that cannot be tested is not a saving.
 */
export function useDialogBehavior({
  panelRef,
  onClose,
}: DialogBehaviorOptions): void {
  /*
    `onClose` is read through a ref so the effect below can depend on nothing
    and therefore run exactly once, on mount.

    Callers pass an inline arrow — `onClose={() => setDialog(null)}` — which is
    a different function object on every parent render. With `onClose` in the
    dependency array, every keystroke in the page's search box would tear the
    effect down and set it up again: focus would be yanked back to whatever
    opened the dialog, mid-sentence. The ref keeps the latest callback
    available without making the effect care that it changed.
  */
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    /*
      Remember what had focus *before* the dialog opened, so it can be handed
      back on close. Without this, closing the dialog drops focus onto <body>
      and a keyboard user has to tab from the top of the page to get back to
      the button they just pressed.
    */
    const previouslyFocused = document.activeElement as HTMLElement | null

    const panel = panelRef.current
    const firstFocusable =
      panel?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? panel
    firstFocusable?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) return

      /*
        The tab trap. Focusables are re-read on every Tab rather than cached
        once, because the dialog's contents change while it is open — a
        validation error appears, a button becomes disabled mid-submit — and a
        stale list would send focus to an element that is no longer reachable.
      */
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      )
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement

      // Wrap around at both ends: Tab past the last control returns to the
      // first, Shift+Tab before the first jumps to the last.
      if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault()
        last.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Stops the page behind the dialog scrolling when the wheel is over the
    // backdrop — the "scrolled to a different place after closing" bug.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
    /*
      Mount and unmount only. `panelRef` is listed because it is a prop and the
      exhaustive-deps rule is right to ask for it — but a ref object keeps the
      same identity for the life of the component, so listing it costs nothing
      and the effect still runs exactly once. `onClose` is deliberately absent;
      it is read through the ref above for the reason explained there.
    */
  }, [panelRef])
}
