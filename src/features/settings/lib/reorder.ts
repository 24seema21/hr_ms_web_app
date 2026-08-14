import type { Identified } from '../types'

/**
 * Moves a record `delta` positions within a list, clamped to the ends.
 *
 * Returns the original array reference when nothing would change, so a click on
 * a disabled-looking arrow at the end of the list cannot trigger a re-render.
 */
export function moveById<T extends Identified>(
  items: T[],
  id: string,
  delta: number,
): T[] {
  const from = items.findIndex((item) => item.id === id)
  if (from === -1) return items

  const to = Math.min(Math.max(from + delta, 0), items.length - 1)
  if (to === from) return items

  const next = [...items]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}
