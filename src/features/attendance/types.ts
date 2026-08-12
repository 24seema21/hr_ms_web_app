/*
  ─────────────────────────────────────────────────────────────────────────────
  THE ATTENDANCE DOMAIN
  ─────────────────────────────────────────────────────────────────────────────
  Same conventions as the employees slice: camelCase here, snake_case on the
  wire, translated in exactly one place (`api/attendanceApi.ts`).

  One difference worth calling out. Every instant in this module is a `Date`
  built from an ISO-8601 UTC string the *server* produced. The client never
  invents a timestamp — see `lib/serverClock.ts` for why a browser's clock is
  not allowed anywhere near a payroll number.
*/

/** Where the work happened. Recorded per session, not per day. */
export const ATTENDANCE_MODES = ['office', 'remote'] as const
export type AttendanceMode = (typeof ATTENDANCE_MODES)[number]

/**
 * One continuous stretch of work.
 *
 * A day is a list of these, and `checkOutAt: null` is what makes one "running".
 * Modelling the day as a single check-in/check-out pair instead would make the
 * most ordinary pattern there is — office in the morning, home after lunch —
 * unrepresentable.
 */
export interface AttendanceSession {
  id: number
  checkInAt: Date
  /** `null` while the session is open. */
  checkOutAt: Date | null
  mode: AttendanceMode
  /** "Pune HQ", "Home". Optional: the mode is the required part. */
  locationLabel: string | null
}

/*
  Every state a day can be in.

  Derived, never stored on the client: `lib/attendanceState.ts` computes it
  from the sessions and the clock, and the server computes the same thing with
  the same rules. A state that is *sent* from one place and *believed* in
  another is a state that goes stale in an open tab.
*/
export const DAY_STATES = [
  'not_checked_in',
  'working',
  'on_break',
  'completed',
  'half_day',
  'absent',
  'regularization_pending',
  'regularized',
  'regularization_rejected',
  'leave',
  'holiday',
  'weekend',
] as const
export type DayState = (typeof DAY_STATES)[number]

/** The rules for a working day. Org-level today; per-employee later. */
export interface AttendancePolicy {
  /** Minutes owed on a normal working day, e.g. 480 for 8 hours. */
  requiredMinutes: number
  /** Worked minutes below which a present day counts as a half day. */
  halfDayMinutes: number
  /** How many days back a regularisation may be raised. */
  regularizationWindowDays: number
}

/** One employee, one day, everything known about it. */
export interface AttendanceDay {
  /** `YYYY-MM-DD` in the employee's working timezone, not UTC. */
  workDate: string
  /**
   * What the *server* believes, which is authoritative for finalised days
   * (absent, holiday, leave) and a starting point for today, whose real state
   * depends on a clock that keeps moving. `dayStateOf()` reconciles the two.
   */
  state: DayState
  sessions: AttendanceSession[]
  policy: AttendancePolicy
  /** Set for holidays, so the card can name the day rather than just mute it. */
  holidayName: string | null
}

/**
 * The failure shape every caller of `attendanceApi` can rely on, mirroring
 * `EmployeeError` and `AuthError`.
 */
export class AttendanceError extends Error {
  readonly code: AttendanceErrorCode

  constructor(
    code: AttendanceErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = 'AttendanceError'
    // Assigned in the body, not as a parameter property — `erasableSyntaxOnly`
    // in tsconfig.app.json bans those.
    this.code = code
  }
}

/*
  `already_open` and `already_closed` are the two that earn their place.

  Both mean "the server and this tab disagree about reality", which is a
  refetch, not an error message — the phone in the user's pocket checked them
  out, or they double-clicked. Everything else is the usual trio.
*/
export const ATTENDANCE_ERROR_CODES = [
  'already_open',
  'already_closed',
  'invalid_request',
  'network',
  'server',
] as const
export type AttendanceErrorCode = (typeof ATTENDANCE_ERROR_CODES)[number]
