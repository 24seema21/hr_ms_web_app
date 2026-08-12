import { serverNow } from './serverClock'
import type { AttendanceDay, AttendancePolicy } from '../types'

/*
  ─────────────────────────────────────────────────────────────────────────────
  DEMO DATA — REMOVE WHEN /attendance/today IS LIVE
  ─────────────────────────────────────────────────────────────────────────────
  Phase 3a's UI is being reviewed before the Go endpoints exist, so
  `useTodayAttendance` seeds itself from here and mutates in memory. Everything
  above the hook — the card, the state machine, the arithmetic, the formatting
  — is the real implementation and does not change when the API arrives.

  Times are relative to `serverNow()` rather than fixed, so the demo is
  plausible whenever it is opened and the running session actually ticks.
*/

export const DEMO_POLICY: AttendancePolicy = {
  requiredMinutes: 480, // 8h
  halfDayMinutes: 240,
  regularizationWindowDays: 7,
}

/** `YYYY-MM-DD` in the working timezone — the same rule the server applies. */
export function workDateOf(instant: Date): string {
  // `en-CA` formats as YYYY-MM-DD, which is the shortest correct way to get an
  // ISO date *in a specific timezone* without pulling in a date library.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
  }).format(instant)
}

function minutesAgo(minutes: number): Date {
  return new Date(serverNow().getTime() - minutes * 60_000)
}

/** Nothing recorded yet — the state most people open the dashboard in. */
export function demoFreshDay(): AttendanceDay {
  return {
    workDate: workDateOf(serverNow()),
    state: 'not_checked_in',
    sessions: [],
    policy: DEMO_POLICY,
    holidayName: null,
  }
}

/** A morning in the office, an afternoon at home, still running. */
export function demoWorkingDay(): AttendanceDay {
  return {
    workDate: workDateOf(serverNow()),
    state: 'working',
    sessions: [
      {
        id: 1,
        checkInAt: minutesAgo(405), // 6h 45m ago
        checkOutAt: minutesAgo(180), // 3h ago  → 3h 45m
        mode: 'office',
        locationLabel: 'Pune HQ',
      },
      {
        id: 2,
        checkInAt: minutesAgo(152), // → ticks
        checkOutAt: null,
        mode: 'remote',
        locationLabel: 'Home',
      },
    ],
    policy: DEMO_POLICY,
    holidayName: null,
  }
}

/** Checked out with the day met. */
export function demoCompletedDay(): AttendanceDay {
  return {
    workDate: workDateOf(serverNow()),
    state: 'completed',
    sessions: [
      {
        id: 1,
        checkInAt: minutesAgo(540),
        checkOutAt: minutesAgo(315),
        mode: 'office',
        locationLabel: 'Pune HQ',
      },
      {
        id: 2,
        checkInAt: minutesAgo(280),
        checkOutAt: minutesAgo(25),
        mode: 'office',
        locationLabel: 'Pune HQ',
      },
    ],
    policy: DEMO_POLICY,
    holidayName: null,
  }
}
