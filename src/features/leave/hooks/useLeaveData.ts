import { useCallback, useMemo, useState } from 'react'
import { countWorkingDays, toWorkDate } from '../lib/leaveDates'
import {
  buildLeaveBalances,
  buildLeaveRequests,
  buildWeekOverview,
  holidaysAround,
} from '../mock/leaveMockData'
import type { LeaveApplicationValues } from '../schemas/leaveApplicationSchema'
import type { LeaveBalance, LeaveRequest, WeekDay } from '../types'

/*
  ─────────────────────────────────────────────────────────────────────────────
  THE API SEAM
  ─────────────────────────────────────────────────────────────────────────────
  Every component in this module reads its data from this hook and writes
  through `submitApplication`. Nothing below `hooks/` knows where any of it
  came from, which is the whole point: replacing the demo data with real calls
  is an edit to this one file.

  When the endpoints land:

    · `GET  /leave/requests?year=`  → `requests`
    · `GET  /leave/balances?year=`  → `balances`
    · `GET  /leave/week?date=`      → `week`
    · `GET  /org/holidays?year=`    → `holidays`
    · `POST /leave/requests`        → `submitApplication`

  Add `api/leaveApi.ts` alongside `employeeApi.ts` to do the snake_case ⇄
  camelCase translation and throw a typed `LeaveError`, then swap the fixtures
  below for state fed by an effect. What this hook *returns* should not change.
*/

export interface UseLeaveDataResult {
  /** `YYYY-MM-DD` — the date every relative calculation is anchored to. */
  todayWorkDate: string
  requests: LeaveRequest[]
  balances: LeaveBalance[]
  week: WeekDay[]
  /** Dates only, for the working-day count. */
  holidayDates: ReadonlySet<string>
  /** Dates → names, for the week card. */
  holidays: ReadonlyMap<string, string>
  submitApplication: (values: LeaveApplicationValues) => Promise<LeaveRequest>
}

/** How long the fake POST takes, so the button's loading state is visible. */
const DEMO_LATENCY_MS = 700

const APPROVER_NAME = 'Priya Desai'

export function useLeaveData(): UseLeaveDataResult {
  /*
    Today, captured once per mount rather than read on every render.

    A component that calls `new Date()` inline re-renders itself into a
    different day at midnight and, more practically, defeats every `useMemo`
    below it because the dependency changes on every pass.

    When the API lands this should come from the server's clock the way
    attendance does — see `features/attendance/lib/serverClock.ts` for why a
    browser's idea of the date is not allowed near anything payroll reads.
  */
  const [todayWorkDate] = useState(() => toWorkDate(new Date()))

  const holidays = useMemo(() => holidaysAround(todayWorkDate), [todayWorkDate])
  const holidayDates = useMemo(() => new Set(holidays.keys()), [holidays])

  const [requests, setRequests] = useState<LeaveRequest[]>(() =>
    buildLeaveRequests(todayWorkDate, holidayDates),
  )

  /*
    Balances are derived from the requests, not held beside them.

    That is a demo convenience and a real invariant: the moment a submitted
    request lands in the list, the panel above it is already correct. Two
    pieces of state for one fact is how a UI ends up claiming eight days
    remaining next to a table that accounts for nine.

    The real API computes balances server-side; this stays a `useMemo` over
    whatever `requests` holds either way.
  */
  const balances = useMemo(
    () => buildLeaveBalances(requests, todayWorkDate),
    [requests, todayWorkDate],
  )

  const week = useMemo(
    () => buildWeekOverview(todayWorkDate, holidays, requests),
    [todayWorkDate, holidays, requests],
  )

  /**
   * Submits an application and resolves with the created row.
   *
   * Rejects rather than resolving with an error value: the dialog's submit
   * handler already has a `try`/`catch`, and the failure case has to leave the
   * dialog open with the typed reason intact.
   */
  const submitApplication = useCallback(
    async (values: LeaveApplicationValues): Promise<LeaveRequest> => {
      await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS))

      const workingDays = countWorkingDays(
        values.startDate,
        values.endDate,
        holidayDates,
      )

      /*
        The row the demo pretends the server created.

        When `POST /leave/requests` is real, this object is replaced by the
        parsed response — the id, the day count and the approver are all
        server-assigned, which is why none of them is anything the form could
        have supplied.
      */
      const created: LeaveRequest = {
        id: Date.now(),
        type: values.type,
        startDate: values.startDate,
        endDate: values.endDate,
        portion: values.portion,
        days: values.portion === 'full' ? workingDays : workingDays - 0.5,
        reason: values.reason.trim(),
        // Everything starts in the queue. A client that invented an approval
        // would be lying about the one thing this screen exists to report.
        status: 'pending',
        appliedOn: todayWorkDate,
        decidedOn: null,
        approverName: APPROVER_NAME,
        // The name only — the file itself goes up as multipart form data and
        // is never held in this state.
        attachmentName: values.attachment?.name ?? null,
        decisionNote: null,
      }

      setRequests((current) => [created, ...current])
      return created
    },
    [todayWorkDate, holidayDates],
  )

  return {
    todayWorkDate,
    requests,
    balances,
    week,
    holidayDates,
    holidays,
    submitApplication,
  }
}
