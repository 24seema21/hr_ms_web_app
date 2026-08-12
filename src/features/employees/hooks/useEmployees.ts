import { useCallback, useEffect, useRef, useState } from 'react'
import * as employeeApi from '../api/employeeApi'
import { EmployeeError } from '../types'
import type { Employee } from '../types'

export type EmployeesStatus = 'loading' | 'ready' | 'error'

export interface UseEmployeesResult {
  employees: Employee[]
  /** 'loading' only until the first answer arrives; after that it is settled. */
  status: EmployeesStatus
  /** A message written for a person, or null. */
  error: string | null
  /** True while a *subsequent* fetch is in flight, with data already on screen. */
  isRefreshing: boolean
  reload: () => Promise<void>
}

/**
 * Loads the employee directory and keeps it fresh.
 *
 * This is deliberately hand-rolled rather than TanStack Query: the project has
 * one screen reading one endpoint, and a caching library would be more concept
 * than code here. What the hook does contain is the part that is easy to get
 * wrong and painful to debug — the stale-response guard below.
 *
 * Reads only. Create, update and delete live in the page, which owns the
 * modals that report their failures, and they call `reload()` when they are
 * done. Mixing mutations in here would mean this hook needed to know about
 * form state too.
 */
export function useEmployees(): UseEmployeesResult {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [status, setStatus] = useState<EmployeesStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  /*
    The stale-response guard.

    Two fetches can be in flight at once — someone clicks Retry twice, or a
    delete finishes while a manual refresh is still running. HTTP gives no
    promise that they come back in the order they were sent, so without this
    the *older* response can land last and overwrite the newer list with data
    that is already out of date. The bug looks like "the deleted row came
    back", it is intermittent, and it is miserable to reproduce.

    A ref rather than state because changing it must not trigger a render —
    it is bookkeeping, not something the UI displays.
  */
  const latestRequestId = useRef(0)

  /*
    Note where the state updates are: every one of them is *after* an `await`.

    That is not stylistic. React's lint rules flag a `setState` called
    synchronously from inside an effect, because it schedules a second render
    before the browser has painted the first — a cascade that gets expensive
    fast. Starting the request and only touching state once its answer comes
    back keeps the mount render clean. The "we are refreshing" flag, which does
    have to be immediate, is set in `reload()` below — an event handler, where
    a synchronous update is exactly right.
  */
  const load = useCallback(async (): Promise<void> => {
    const requestId = ++latestRequestId.current

    try {
      const result = await employeeApi.listEmployees()

      // A newer request has started since this one — its answer is the truth.
      if (requestId !== latestRequestId.current) return

      setEmployees(result)
      setStatus('ready')
      // Cleared on success rather than at the start of the request, so a
      // failed load keeps its explanation on screen while the retry runs.
      setError(null)
    } catch (caught) {
      if (requestId !== latestRequestId.current) return

      // Only an EmployeeError carries text meant for a human; anything else is
      // an unexpected bug whose raw message could leak internals.
      setError(
        caught instanceof EmployeeError
          ? caught.message
          : 'Something went wrong. Please try again.',
      )
      setStatus('error')
    } finally {
      if (requestId === latestRequestId.current) setIsRefreshing(false)
    }
  }, [])

  /**
   * The public re-fetch: shows the "Refreshing…" indicator, then loads.
   *
   * Called from the Refresh button and after every create, update and delete.
   * It never rejects — failures land in `error` — so a caller can `await` it
   * without a try/catch and without a refresh failure being mistaken for a
   * save failure.
   */
  const reload = useCallback(async (): Promise<void> => {
    setIsRefreshing(true)
    await load()
  }, [load])

  /*
    `void load()` — the `void` is not decoration. An `async` function returns a
    promise, and returning a promise from `useEffect` makes React treat it as
    the cleanup function and throw. `void` discards it explicitly, which also
    tells the next reader the floating promise is intentional.

    `load` is wrapped in `useCallback` with an empty dependency array, so it is
    the same function forever and this effect runs exactly once per mount — not
    on every render, which is the classic infinite fetch loop.

    The first load calls `load` rather than `reload`: `status` already starts at
    'loading', so raising the "Refreshing…" flag as well would be redundant —
    and *that* one would genuinely be a synchronous `setState` inside an effect.

    About the disable below: `react-hooks/set-state-in-effect` exists to catch
    the render cascade of `useEffect(() => setThing(x))`. It flags this too,
    because its analysis follows any async function called from an effect
    through to the state updates at the end. Here every one of those updates is
    behind an `await` on a network response — the mount render finishes long
    before any of them run, so the cascade the rule guards against cannot
    happen. Fetching on mount is the one place this pattern is correct, and the
    alternative to the escape hatch is contorting `load()` into `.then()`
    chains purely to slip past a heuristic.

    (When this project grows a data-fetching library, this hook and this
    comment both disappear — that is the real fix, and it is a Phase-3 problem,
    not a today problem.)
  */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see above
    void load()
  }, [load])

  return { employees, status, error, isRefreshing, reload }
}
