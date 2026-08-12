import { DEMO_POLICY, demoWorkingDay } from './demoDay'
import { isWeekendDate } from './workDate'
import type { AttendanceDay, AttendanceSession, DayState } from '../types'

/*
  ─────────────────────────────────────────────────────────────────────────────
  DEMO DATA — REMOVE WHEN /attendance/month IS LIVE
  ─────────────────────────────────────────────────────────────────────────────
  A month of plausible attendance, generated deterministically from the date
  itself so the same month always looks the same. Random data would reshuffle
  on every render and make a screenshot impossible to compare against the last
  one — and would occasionally invent something absurd, like a fortnight of
  unexplained absence.

  The shapes here are exactly what `/attendance/month` will return, so nothing
  above this file changes when it lands.
*/

/** IST wall-clock → the UTC instant it corresponds to. IST is UTC+5:30. */
function istInstant(workDate: string, hour: number, minute: number): Date {
  const midnightUtc = new Date(`${workDate}T00:00:00.000Z`).getTime()
  return new Date(midnightUtc + (hour * 60 + minute - 330) * 60_000)
}

/**
 * A small deterministic hash of the date, used for the minute-level variation
 * that makes the data look human. Same date, same numbers, every time.
 */
function jitter(workDate: string, salt: number): number {
  let hash = salt
  for (const character of workDate) {
    hash = (hash * 31 + character.charCodeAt(0)) % 997
  }
  return hash
}

function presentSessions(workDate: string, mode: 'office' | 'remote'): AttendanceSession[] {
  const startMinute = jitter(workDate, 7) % 40 // 09:00–09:39
  const lunchLength = 45 + (jitter(workDate, 11) % 30)
  const morningEnd = 13 * 60 + (jitter(workDate, 3) % 20)
  const afternoonStart = morningEnd + lunchLength
  const dayLength = 500 + (jitter(workDate, 5) % 60) // ~8h20m ± a bit

  const checkIn = 9 * 60 + startMinute
  const checkOut = checkIn + dayLength + lunchLength

  return [
    {
      id: Number(workDate.replaceAll('-', '')) * 10 + 1,
      checkInAt: istInstant(workDate, 0, checkIn),
      checkOutAt: istInstant(workDate, 0, morningEnd),
      mode,
      locationLabel: mode === 'office' ? 'Pune HQ' : 'Home',
    },
    {
      id: Number(workDate.replaceAll('-', '')) * 10 + 2,
      checkInAt: istInstant(workDate, 0, afternoonStart),
      checkOutAt: istInstant(workDate, 0, checkOut),
      mode,
      locationLabel: mode === 'office' ? 'Pune HQ' : 'Home',
    },
  ]
}

/**
 * The state a given demo date is in.
 *
 * Fixed dates rather than probabilities, so the month always contains one of
 * everything worth looking at: an absence to regularise, a request already
 * pending, a half day, a stretch of leave, a public holiday.
 */
function stateForDate(dayOfMonth: number, workDate: string): DayState {
  if (isWeekendDate(workDate)) return 'weekend'

  switch (dayOfMonth) {
    case 15:
      return 'holiday'
    case 6:
      return 'absent'
    case 5:
      return 'regularization_pending'
    case 11:
      return 'half_day'
    case 21:
    case 22:
      return 'leave'
    case 4:
      return 'regularized'
    default:
      return 'completed'
  }
}

function sessionsForState(state: DayState, workDate: string): AttendanceSession[] {
  switch (state) {
    case 'weekend':
    case 'holiday':
    case 'leave':
    case 'absent':
    case 'regularization_pending':
      return []

    case 'half_day': {
      const [first] = presentSessions(workDate, 'office')
      return [first]
    }

    case 'regularized':
      // Reconstructed by an approved request, which is why the mode is office
      // with no session-level location: nobody was there to record one.
      return [
        {
          id: Number(workDate.replaceAll('-', '')) * 10 + 9,
          checkInAt: istInstant(workDate, 9, 30),
          checkOutAt: istInstant(workDate, 18, 15),
          mode: 'office',
          locationLabel: null,
        },
      ]

    default:
      // Two days a week at home, deterministically.
      return presentSessions(
        workDate,
        jitter(workDate, 13) % 5 < 2 ? 'remote' : 'office',
      )
  }
}

/**
 * Every day of `month` (`YYYY-MM`) up to and including `todayWorkDate`.
 *
 * Future dates are omitted rather than rendered as empty rows: a table that
 * lists the rest of the month as blanks reads as missing data, and there is
 * nothing to say about a Thursday that has not happened.
 */
export function demoMonthDays(month: string, todayWorkDate: string): AttendanceDay[] {
  const [year, monthNumber] = month.split('-').map(Number)
  const lastDayOfMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()

  const days: AttendanceDay[] = []

  for (let dayOfMonth = 1; dayOfMonth <= lastDayOfMonth; dayOfMonth += 1) {
    const workDate = `${month}-${String(dayOfMonth).padStart(2, '0')}`
    if (workDate > todayWorkDate) break

    /*
      Today comes from the same fixture the dashboard card uses.

      Generating it independently produced the demo's one genuinely broken
      moment: the card said "Working" while the row for the same date said
      "Regularisation pending". Two sources of truth for one day is exactly the
      bug this module's architecture exists to prevent, and the demo data
      should not be the thing that reintroduces it. When the API is real, both
      read the same row for the same reason.
    */
    if (workDate === todayWorkDate) {
      days.push(demoWorkingDay())
      continue
    }

    const state = stateForDate(dayOfMonth, workDate)

    days.push({
      workDate,
      state,
      sessions: sessionsForState(state, workDate),
      policy: DEMO_POLICY,
      holidayName: state === 'holiday' ? 'Independence Day' : null,
    })
  }

  return days
}
