import { totalsForDay } from './workedMinutes'
import type { AttendanceDay } from '../types'

/*
  ─────────────────────────────────────────────────────────────────────────────
  THE MONTH'S NUMBERS, WITH THEIR DEFINITIONS
  ─────────────────────────────────────────────────────────────────────────────
  Every figure the analytics row shows is computed here, once, and the
  definition is written down next to it. That is not documentation for its own
  sake: an attendance percentage is the number an employee and their HR
  business partner will eventually disagree about, and "which denominator?" is
  always the reason. Two implementations of this, in two components, guarantees
  the disagreement.

  The server computes the same figures with the same rules for reporting and
  payroll; this exists so the screen does not have to wait for a round trip to
  redraw after a regularisation is approved.
*/

export interface MonthSummary {
  /** Days somebody was expected to work: excludes weekends, holidays and leave. */
  workingDays: number
  /** Present days. A half day counts as 0.5 — rounding it up starts disputes. */
  presentDays: number
  absentDays: number
  leaveDays: number
  holidayDays: number
  /** `presentDays / workingDays`, 0–100, rounded to a whole number. */
  attendancePercent: number
  totalWorkedMinutes: number
  /** Mean over days actually worked, not over the calendar. */
  averageWorkedMinutes: number
  /** Days still awaiting a manager's decision. */
  pendingRegularizations: number
}

const EMPTY: MonthSummary = {
  workingDays: 0,
  presentDays: 0,
  absentDays: 0,
  leaveDays: 0,
  holidayDays: 0,
  attendancePercent: 0,
  totalWorkedMinutes: 0,
  averageWorkedMinutes: 0,
  pendingRegularizations: 0,
}

export function summariseMonth(days: AttendanceDay[], now: Date): MonthSummary {
  if (days.length === 0) return EMPTY

  const summary = { ...EMPTY }
  let daysWorked = 0

  for (const day of days) {
    const { totalMinutes } = totalsForDay(day, now)
    summary.totalWorkedMinutes += totalMinutes
    if (totalMinutes > 0) daysWorked += 1

    switch (day.state) {
      case 'weekend':
        // Not a working day, so it is in no denominator. Counting weekends as
        // "present" is how a five-day week reports 71% attendance.
        break

      case 'holiday':
        summary.holidayDays += 1
        break

      case 'leave':
        /*
          Approved leave is excluded from the denominator rather than counted
          as an absence. Someone who took a fortnight of earned leave did not
          have 50% attendance — they had leave, which the company granted.
        */
        summary.leaveDays += 1
        break

      case 'absent':
        summary.workingDays += 1
        summary.absentDays += 1
        break

      case 'half_day':
        summary.workingDays += 1
        summary.presentDays += 0.5
        break

      case 'regularization_pending':
        /*
          Counted as a working day and as *not yet* present. Optimistically
          crediting a pending request would let the number drop when a manager
          rejects it, which is the worst possible moment for a surprise.
        */
        summary.workingDays += 1
        summary.pendingRegularizations += 1
        break

      case 'regularization_rejected':
        summary.workingDays += 1
        summary.absentDays += 1
        break

      default:
        // working, on_break, completed, not_checked_in, regularized — a day
        // that is being worked or was worked.
        summary.workingDays += 1
        if (day.sessions.length > 0 || day.state === 'regularized') {
          summary.presentDays += 1
        }
        break
    }
  }

  summary.attendancePercent =
    summary.workingDays === 0
      ? 0
      : Math.round((summary.presentDays / summary.workingDays) * 100)

  summary.averageWorkedMinutes =
    daysWorked === 0 ? 0 : Math.round(summary.totalWorkedMinutes / daysWorked)

  return summary
}
