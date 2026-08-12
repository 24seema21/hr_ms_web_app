import { useCallback, useMemo, useState } from 'react'
import { demoMonthDays } from '../lib/demoMonth'
import { summariseMonth } from '../lib/monthSummary'
import { serverNow } from '../lib/serverClock'
import { toWorkDate, weekOf } from '../lib/workDate'
import type { MonthSummary } from '../lib/monthSummary'
import type { AttendanceDay, AttendanceMode } from '../types'

/** What a regularisation request carries. Mirrors the POST body. */
export interface RegularizationRequest {
  workDate: string
  requestedCheckIn: string // 'HH:MM', the employee's working timezone
  requestedCheckOut: string
  mode: AttendanceMode
  reasonCode: string
  details: string
}

export interface UseAttendanceMonthResult {
  /** `YYYY-MM` currently being shown. */
  month: string
  setMonth: (month: string) => void
  days: AttendanceDay[]
  /** The seven days of the week containing today, oldest first. */
  weekDays: AttendanceDay[]
  summary: MonthSummary
  status: 'loading' | 'ready' | 'error'
  error: string | null
  submitRegularization: (request: RegularizationRequest) => Promise<void>
}

/*
  The month's swap seam, alongside `useTodayAttendance`.

  In-memory today; `attendanceApi.getMonth(month)` tomorrow. The components
  above it — the analytics row, the weekly log, the history table, the detail
  drawer — are written against this contract and do not change.

  Note that the summary is *derived*, not fetched. The server will send its own
  copy for reporting, and this is deliberately the same calculation done
  locally: it means an approved regularisation redraws the percentage
  immediately rather than after a round trip, and any drift between the two
  implementations shows up here, in a place with tests, rather than in payroll.
*/
export function useAttendanceMonth(): UseAttendanceMonthResult {
  const today = toWorkDate(serverNow())

  const [month, setMonth] = useState(() => today.slice(0, 7))
  const [pendingDates, setPendingDates] = useState<string[]>([])

  const days = useMemo(() => {
    const generated = demoMonthDays(month, today)

    /*
      Requests submitted in this session are layered over the generated data,
      so the row visibly becomes "Regularisation pending" the moment it is
      submitted. When the API is real this is what the refetch returns; the
      optimistic version is here so the demo behaves like the real thing.
    */
    if (pendingDates.length === 0) return generated

    return generated.map((day) =>
      pendingDates.includes(day.workDate)
        ? { ...day, state: 'regularization_pending' as const }
        : day,
    )
  }, [month, today, pendingDates])

  const weekDays = useMemo(() => {
    const dates = weekOf(today)
    const byDate = new Map(days.map((day) => [day.workDate, day]))

    /*
      The week is built from the *calendar*, not from the rows that happen to
      exist: a week whose Monday is in the previous month, or whose Friday has
      not happened yet, still needs seven slots. Missing days are synthesised
      as empty so the log never silently drops a row.
    */
    return dates
      .filter((date) => date <= today)
      .map(
        (date) =>
          byDate.get(date) ?? {
            workDate: date,
            state: 'not_checked_in' as const,
            sessions: [],
            policy: days[0]?.policy ?? {
              requiredMinutes: 480,
              halfDayMinutes: 240,
              regularizationWindowDays: 7,
            },
            holidayName: null,
          },
      )
  }, [days, today])

  const summary = useMemo(() => summariseMonth(days, serverNow()), [days])

  const submitRegularization = useCallback(
    async (request: RegularizationRequest) => {
      // Stands in for the POST. The dialog shows its own pending state and
      // keeps the typed values if this rejects — same contract as the employee
      // form, so swapping in the real call changes nothing above.
      await new Promise((resolve) => window.setTimeout(resolve, 500))
      setPendingDates((current) => [...current, request.workDate])
    },
    [],
  )

  return {
    month,
    setMonth,
    days,
    weekDays,
    summary,
    status: 'ready',
    error: null,
    submitRegularization,
  }
}
