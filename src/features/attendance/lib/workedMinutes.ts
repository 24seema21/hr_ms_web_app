import { minutesBetween } from './duration'
import type { AttendanceDay, AttendanceSession } from '../types'

export interface WorkedTotals {
  /** Everything worked today, including the session still running. */
  totalMinutes: number
  /** How long the running session has been going, or `null` if none is. */
  currentMinutes: number | null
  /** Still owed. `0` once the day is met — never negative. */
  remainingMinutes: number
  /** Worked beyond the requirement. `0` until the day is met. */
  overtimeMinutes: number
  /** 0–1 for the progress bar. Can exceed 1; the bar clamps, the number does not. */
  ratio: number
  /** The open session, if there is one. */
  openSession: AttendanceSession | null
}

/**
 * The day's arithmetic, in one pure function.
 *
 * Two properties make this worth isolating rather than inlining into the card:
 *
 *  1. `now` is a parameter, not `Date.now()`. That is what makes the ticking
 *     display honest — every second the component recomputes from the *stored
 *     timestamps*, rather than incrementing a counter. Counters drift: a
 *     background tab throttles `setInterval` to once a minute or stops it
 *     entirely, and forty minutes of a locked laptop vanish from the total.
 *
 *  2. It is trivially testable — no clock, no render, no network. The awkward
 *     cases (open session, several sessions, a check-out before its check-in,
 *     a day with nothing in it) are all one assertion each.
 */
export function workedTotals(
  sessions: AttendanceSession[],
  requiredMinutes: number,
  now: Date,
): WorkedTotals {
  let totalMinutes = 0
  let currentMinutes: number | null = null
  let openSession: AttendanceSession | null = null

  for (const session of sessions) {
    /*
      An open session is measured *to now*. This is the whole reason the total
      is computed rather than read from a field: the number is only true for
      the instant it was calculated.
    */
    const end = session.checkOutAt ?? now
    const minutes = minutesBetween(session.checkInAt, end)

    totalMinutes += minutes

    if (session.checkOutAt === null) {
      currentMinutes = minutes
      openSession = session
    }
  }

  const remainingMinutes = Math.max(0, requiredMinutes - totalMinutes)
  const overtimeMinutes = Math.max(0, totalMinutes - requiredMinutes)

  return {
    totalMinutes,
    currentMinutes,
    remainingMinutes,
    overtimeMinutes,
    ratio: requiredMinutes > 0 ? totalMinutes / requiredMinutes : 0,
    openSession,
  }
}

/** The same totals for a whole day record — the form every component wants. */
export function totalsForDay(day: AttendanceDay, now: Date): WorkedTotals {
  return workedTotals(day.sessions, day.policy.requiredMinutes, now)
}

/** The first check-in of the day, or `null`. Sessions arrive in time order. */
export function firstCheckInOf(day: AttendanceDay): Date | null {
  return day.sessions[0]?.checkInAt ?? null
}

/** The last check-out, or `null` if the day is still open or empty. */
export function lastCheckOutOf(day: AttendanceDay): Date | null {
  const last = day.sessions[day.sessions.length - 1]
  return last?.checkOutAt ?? null
}
