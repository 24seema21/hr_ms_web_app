import { useEffect, useState } from 'react'
import { serverNow } from '../lib/serverClock'

/**
 * A `Date` that advances while `active` is true.
 *
 * Three deliberate choices, each preventing a specific bug:
 *
 *  1. **It returns an instant, not an elapsed count.** Callers recompute their
 *     durations from stored timestamps every tick. An incrementing counter
 *     loses time whenever the browser throttles the interval — which it does
 *     to about once a minute in a background tab, and to never on a sleeping
 *     laptop — and the employee's hours come out short.
 *
 *  2. **It stops when the tab is hidden and resyncs on return.** No point
 *     re-rendering once a second for a screen nobody is looking at, and the
 *     first thing anyone wants on coming back is a correct number, not a stale
 *     one that catches up a second later.
 *
 *  3. **`active` is a parameter.** Nothing ticks unless a session is actually
 *     running, so a completed day costs zero renders.
 *
 * Use it as low in the tree as possible — see `LiveDuration`. A ticker at page
 * level re-renders the whole page every second.
 */
export function useTicker(active: boolean, intervalMs = 1000): Date {
  const [now, setNow] = useState<Date>(() => serverNow())

  useEffect(() => {
    if (!active) return

    let timer: number | undefined

    const tick = () => setNow(serverNow())

    const start = () => {
      // Cleared first so a resume can never leave two intervals running — the
      // classic cause of a timer that visibly speeds up after a few tab switches.
      if (timer !== undefined) window.clearInterval(timer)
      timer = window.setInterval(tick, intervalMs)
    }

    const stop = () => {
      if (timer !== undefined) window.clearInterval(timer)
      timer = undefined
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Recompute immediately, then resume. This is an event handler, so the
        // synchronous update is fine — and it is what makes returning to the
        // tab show the right number in the same frame.
        tick()
        start()
      } else {
        stop()
      }
    }

    if (document.visibilityState === 'visible') start()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [active, intervalMs])

  return now
}
