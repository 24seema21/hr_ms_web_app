/*
  ─────────────────────────────────────────────────────────────────────────────
  THE LEAVE DOMAIN
  ─────────────────────────────────────────────────────────────────────────────
  Same conventions as the employees and attendance slices: camelCase here,
  snake_case on the wire, translated in exactly one place (`api/leaveApi.ts`,
  when it exists). Calendar dates are `YYYY-MM-DD` in the working timezone —
  never a `Date` — because a leave day is a date, not an instant.
*/

/**
 * The leave types this org grants. Ordered as they are shown, and that order
 * is also the chart's stacking order — see `leavePresentation.ts`.
 */
export const LEAVE_TYPES = ['earned', 'casual', 'sick', 'unpaid'] as const
export type LeaveType = (typeof LEAVE_TYPES)[number]

/**
 * Where a request is in its life.
 *
 * `cancelled` is withdrawn by the employee; `rejected` is refused by the
 * approver. Collapsing the two into "not approved" loses the only distinction
 * anyone cares about when they look back at the row six months later.
 */
export const LEAVE_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'cancelled',
] as const
export type LeaveStatus = (typeof LEAVE_STATUSES)[number]

/**
 * How much of a single day is taken.
 *
 * Only meaningful when the request is one day long, which the schema enforces.
 * Modelling it as a portion rather than a `isHalfDay` boolean is what lets the
 * approver see *which* half — the afternoon clinic appointment and the morning
 * one are different days for whoever has to cover the desk.
 */
export const DAY_PORTIONS = ['full', 'first_half', 'second_half'] as const
export type DayPortion = (typeof DAY_PORTIONS)[number]

/** One application, and everything that has happened to it. */
export interface LeaveRequest {
  id: number
  type: LeaveType
  /** Inclusive `YYYY-MM-DD`. */
  startDate: string
  /** Inclusive. Equal to `startDate` for a single day. */
  endDate: string
  portion: DayPortion
  /**
   * Working days consumed — weekends and public holidays already excluded,
   * halved for a part day. Sent by the server rather than recomputed here:
   * the holiday calendar is org data, and a client that counts its own days
   * will eventually disagree with payroll.
   */
  days: number
  reason: string
  status: LeaveStatus
  appliedOn: string
  /** `null` while pending. */
  decidedOn: string | null
  approverName: string
  /** What the employee attached, if anything. Never the file itself. */
  attachmentName: string | null
  /** Why it was refused. Only ever set on a `rejected` row. */
  decisionNote: string | null
}

/** One row of the entitlement ledger, for one type, for the current year. */
export interface LeaveBalance {
  type: LeaveType
  /** Granted for the year. `null` for unpaid, which has no ceiling. */
  entitledDays: number | null
  /** Already approved and consumed. */
  usedDays: number
  /** Approved but still in the future — committed, not yet spent. */
  scheduledDays: number
  /** Awaiting a decision. Not yet deducted, but not available either. */
  pendingDays: number
}

/* ── The week overview ─────────────────────────────────────────────────── */

/**
 * What a single day of the current week turned out to be.
 *
 * `upcoming` is its own kind rather than an absence of data: a Thursday that
 * has not happened yet is not the same as a Thursday nobody turned up for, and
 * rendering both as an empty column is how a demo accidentally accuses
 * somebody of a week of absence.
 */
export const WEEK_DAY_KINDS = [
  'present',
  'half_day',
  'leave',
  'holiday',
  'weekend',
  'absent',
  'upcoming',
] as const
export type WeekDayKind = (typeof WEEK_DAY_KINDS)[number]

export const WEEK_EVENT_KINDS = [
  'meeting',
  'holiday',
  'birthday',
  'deadline',
] as const
export type WeekEventKind = (typeof WEEK_EVENT_KINDS)[number]

/** Something on the calendar that is not attendance — a meeting, a birthday. */
export interface WeekEvent {
  id: number
  title: string
  kind: WeekEventKind
  /** `HH:mm` in the working timezone, or `null` for an all-day marker. */
  startTime: string | null
}

/** One day of the current week: how it was worked, and what was on it. */
export interface WeekDay {
  workDate: string
  kind: WeekDayKind
  /** Minutes actually worked. `0` for any day nothing was owed on. */
  workedMinutes: number
  /** Minutes owed. `0` on weekends and holidays, which is what makes them off. */
  requiredMinutes: number
  /** Named so a holiday column can say which one it is. */
  holidayName: string | null
  /** Set when `kind` is `leave` or `half_day` taken as leave. */
  leaveType: LeaveType | null
  events: WeekEvent[]
}
