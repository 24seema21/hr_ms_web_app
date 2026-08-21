import { useEffect, useState } from 'react'

/**
 * Which of the given sections the reader is currently standing in.
 *
 * This is what makes the flow rail a *position* indicator rather than a second
 * menu — and it is the whole reason the page reads as a guided sequence
 * instead of a stack of unrelated bands.
 *
 * ── Why IntersectionObserver and not a scroll handler ────────────────────────
 * The obvious implementation reads `getBoundingClientRect()` for every section
 * on every scroll event. That is a forced synchronous layout per frame, on the
 * main thread, during the one interaction where jank is most visible. The
 * observer does the same work off the main thread and only calls back when an
 * answer actually changes.
 *
 * ── Why the lopsided rootMargin ──────────────────────────────────────────────
 * `-25% 0px -65% 0px` shrinks the viewport down to a band across its upper
 * third. Without it, "visible" means "any part on screen", and two sections are
 * visible for most of a scroll — so the rail flickers between them. The band
 * makes the question precise: whichever section is under the reader's eye is
 * the active one. The top inset also clears the sticky header, which would
 * otherwise mark a section active while it is still hidden behind the chrome.
 *
 * @param ids Section element ids, in document order. Must be a stable
 *   reference — pass a module-level constant, not an inline array.
 */
export function useScrollSpy(ids: readonly string[]): string {
  const [activeId, setActiveId] = useState<string>(ids[0] ?? '')

  useEffect(() => {
    /*
      jsdom has no IntersectionObserver and no layout to feed one, so tests
      would throw here. Bailing out leaves `activeId` on the first section,
      which is exactly what the rail shows at the top of a real page — the
      component under test still renders something truthful.
    */
    if (typeof IntersectionObserver === 'undefined') return

    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)

    if (targets.length === 0) return

    /*
      The observer reports *changes*, not the current state, so we keep the
      running set ourselves. A Set rather than an array because the only
      questions asked of it are "add", "delete" and "has".
    */
    const onScreen = new Set<string>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onScreen.add(entry.target.id)
          else onScreen.delete(entry.target.id)
        }

        /*
          Ties go to the earliest section in document order. Scrolling down,
          the next section enters the band before the current one has left it;
          taking the first keeps the rail from jumping ahead of the reader.

          When the set is empty — mid-scroll through a gap, or during the
          momentum at the very bottom of the page — we deliberately keep the
          previous value rather than clearing it. An indicator that blanks out
          is worse than one that is briefly a section behind.
        */
        const next = ids.find((id) => onScreen.has(id))
        if (next) setActiveId(next)
      },
      { rootMargin: '-25% 0px -65% 0px' },
    )

    for (const target of targets) observer.observe(target)
    return () => observer.disconnect()
  }, [ids])

  return activeId
}
