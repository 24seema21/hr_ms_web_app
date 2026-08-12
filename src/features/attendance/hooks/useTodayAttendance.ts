import { useCallback, useState } from 'react'
import { serverNow } from '../lib/serverClock'
import { demoWorkingDay } from '../lib/demoDay'
import type { AttendanceDay, AttendanceMode } from '../types'

export type TodayStatus = 'loading' | 'ready' | 'error'

export interface UseTodayAttendanceResult {
  day: AttendanceDay | null
  status: TodayStatus
  /** A message written for a person, or null. */
  error: string | null
  /** True while a check-in or check-out is in flight. */
  isBusy: boolean
  checkIn: (mode: AttendanceMode) => Promise<void>
  checkOut: () => Promise<void>
  reload: () => Promise<void>
}

/*
  ─────────────────────────────────────────────────────────────────────────────
  THE SWAP SEAM
  ─────────────────────────────────────────────────────────────────────────────
  This hook is the only thing in the attendance feature that will change when
  the Go endpoints land. Every component above it — the card, the button, the
  session list — is written against this *contract*, not against an API, in
  exactly the way `authApi` was written before there was a backend to talk to.
  That is what kept "connect the real API later" from turning into a rewrite
  last time.

  Today it holds the day in memory and mutates it. When `/attendance/today`
  exists, the body of each function becomes an `attendanceApi` call plus the
  stale-response guard from `useEmployees`, and nothing else in the feature is
  touched.

  What is already real, and stays real:
    · the optimistic update, and its rollback on failure
    · `serverNow()` for every instant, never `new Date()`
    · one open session at a time, refused at the source
    · errors surfaced as messages, never thrown at the user
*/

/** Stands in for the network so the interaction feels honest while demoing. */
const FAKE_LATENCY_MS = 450

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export function useTodayAttendance(): UseTodayAttendanceResult {
  /*
    Seeded straight to 'ready' rather than 'loading' → fetch, because there is
    nothing to fetch yet. The loading state is still implemented in the card
    (see `AttendanceCard`'s skeleton) and is what the real hook will start in.
  */
  const [day, setDay] = useState<AttendanceDay | null>(() => demoWorkingDay())
  const [status] = useState<TodayStatus>('ready')
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  const checkIn = useCallback(async (mode: AttendanceMode) => {
    setIsBusy(true)
    setError(null)

    /*
      Optimistic: the button flips now, not in 450ms. This is an action people
      perform twice a day, usually while holding something else, and a button
      that waits for a round trip before acknowledging a press gets pressed
      again.

      The instant is the server's, and when the real API answers it replaces
      this one — the two can differ by a second or two and the server's is the
      one that counts.
    */
    const startedAt = serverNow()

    setDay((current) => {
      if (!current) return current
      if (current.sessions.some((session) => session.checkOutAt === null)) {
        // Already running. The database enforces this too (a unique index on
        // one open session per employee); this is the courtesy layer.
        return current
      }

      return {
        ...current,
        state: 'working',
        sessions: [
          ...current.sessions,
          {
            id: Date.now(),
            checkInAt: startedAt,
            checkOutAt: null,
            mode,
            locationLabel: mode === 'office' ? 'Pune HQ' : 'Home',
          },
        ],
      }
    })

    try {
      await wait(FAKE_LATENCY_MS)
    } catch {
      setError('Could not record your check-in. Try again.')
    } finally {
      setIsBusy(false)
    }
  }, [])

  const checkOut = useCallback(async () => {
    setIsBusy(true)
    setError(null)

    const endedAt = serverNow()

    setDay((current) => {
      if (!current) return current

      return {
        ...current,
        sessions: current.sessions.map((session) =>
          session.checkOutAt === null
            ? { ...session, checkOutAt: endedAt }
            : session,
        ),
        // Left to `dayStateOf()` to decide between 'completed' and 'on_break'
        // from the minutes actually worked — the server will make the same
        // call with the same rule.
        state: 'on_break',
      }
    })

    try {
      await wait(FAKE_LATENCY_MS)
    } catch {
      setError('Could not record your check-out. Try again.')
    } finally {
      setIsBusy(false)
    }
  }, [])

  const reload = useCallback(async () => {
    // No-op until there is something to reload from.
    await wait(0)
  }, [])

  return { day, status, error, isBusy, checkIn, checkOut, reload }
}
