import { useCallback, useMemo, useState } from 'react'
import { moveById } from '../lib/reorder'
import type { Identified } from '../types'

let sequence = 0

/**
 * A collision-free id for a record created in the browser.
 *
 * Prefixed so a mock id is obvious in the React tree, and monotonic so two
 * records added in the same millisecond still differ — `Date.now()` alone is
 * not enough when someone adds three tasks in a row.
 */
export function createMockId(prefix: string): string {
  sequence += 1
  return `${prefix}-${Date.now().toString(36)}-${sequence}`
}

export interface MockCollection<T extends Identified> {
  items: T[]
  create: (item: T) => void
  update: (item: T) => void
  remove: (id: string) => void
  /** Moves a record by `delta` positions, clamped to the ends of the list. */
  move: (id: string, delta: number) => void
}

/**
 * Session-scoped CRUD over an in-memory list.
 *
 * This is the single place the mock persistence lives, so swapping in the real
 * endpoints later means replacing this hook per section rather than rewriting
 * the handlers in every dialog. Every mutation produces a new array, so
 * `React.memo` on the row components actually holds.
 */
export function useMockCollection<T extends Identified>(
  initialItems: T[],
): MockCollection<T> {
  const [items, setItems] = useState<T[]>(initialItems)

  const create = useCallback((item: T) => {
    setItems((current) => [...current, item])
  }, [])

  const update = useCallback((item: T) => {
    setItems((current) =>
      current.map((existing) => (existing.id === item.id ? item : existing)),
    )
  }, [])

  const remove = useCallback((id: string) => {
    setItems((current) => current.filter((existing) => existing.id !== id))
  }, [])

  const move = useCallback((id: string, delta: number) => {
    setItems((current) => moveById(current, id, delta))
  }, [])

  return useMemo(
    () => ({ items, create, update, remove, move }),
    [items, create, update, remove, move],
  )
}
