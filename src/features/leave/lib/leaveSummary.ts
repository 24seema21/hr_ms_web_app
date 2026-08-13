import { formatMonthShort } from './leaveDates'
import { LEAVE_TYPES } from '../types'
import type { LeaveBalance, LeaveRequest, LeaveType, WeekDay } from '../types'

/*
  Every derived number the analysis section shows, computed here as plain
  functions over plain data.

  Kept out of the components for the usual two reasons — they are the part
  worth unit-testing, and a component that both derives and renders is one that
  recomputes on every unrelated re-render. The page memoises the calls.
*/

/** The headline figures, for the tile row. */
export interface LeaveSummary {
  /** Approved days already taken, across the paid types. */
  takenDays: number
  /** Approved and still in the future. Committed, not yet spent. */
  scheduledDays: number
  /** Granted across the paid types. Unpaid has no ceiling and is excluded. */
  entitledDays: number
  /** What is left to book: entitled − taken − scheduled − pending. */
  availableDays: number
  /** Days sitting in the approver's queue. */
  pendingDays: number
  /** How many requests are pending, which is the number people chase. */
  pendingCount: number
  /** Unpaid days taken this year — the one that costs money. */
  unpaidDays: number
}

/** One bar of the type breakdown. */
export interface LeaveTypeTotal {
  type: LeaveType
  days: number
  /** Share of all days taken, 0–100. */
  percent: number
}

/** One column of the trend chart. */
export interface LeaveMonthTotal {
  /** `YYYY-MM`. */
  month: string
  /** `Aug`, for the axis. */
  label: string
  /** Days per type, in `LEAVE_TYPES` order — the stacking order. */
  byType: { type: LeaveType; days: number }[]
  totalDays: number
}

/** Approved-and-in-the-past, plus approved-and-still-to-come. */
function isCounted(request: LeaveRequest): boolean {
  return request.status === 'approved'
}

export function summariseBalances(
  balances: LeaveBalance[],
  requests: LeaveRequest[],
): LeaveSummary {
  const paid = balances.filter((balance) => balance.type !== 'unpaid')

  const takenDays = sum(paid.map((balance) => balance.usedDays))
  const scheduledDays = sum(paid.map((balance) => balance.scheduledDays))
  const pendingDays = sum(paid.map((balance) => balance.pendingDays))

  /*
    `entitledDays` is `null` for uncapped types, which is why this filters
    rather than defaulting to 0 — a type with no ceiling must not quietly
    contribute a zero to a total that is then presented as "your entitlement".
  */
  const entitledDays = sum(
    paid
      .map((balance) => balance.entitledDays)
      .filter((days): days is number => days !== null),
  )

  const unpaid = balances.find((balance) => balance.type === 'unpaid')

  return {
    takenDays,
    scheduledDays,
    entitledDays,
    // Clamped: an org that grants leave in arrears can legitimately put an
    // employee past their entitlement, and a negative "available" reads as a
    // bug rather than as an overdraft.
    availableDays: Math.max(
      0,
      entitledDays - takenDays - scheduledDays - pendingDays,
    ),
    pendingDays,
    pendingCount: requests.filter((request) => request.status === 'pending')
      .length,
    unpaidDays: unpaid ? unpaid.usedDays + unpaid.scheduledDays : 0,
  }
}

/**
 * Days taken per type, for the breakdown.
 *
 * Only approved requests count. Including pending ones would make the chart
 * disagree with the balance panel beside it, and the balance panel is the one
 * payroll will be asked about.
 */
export function totalsByType(requests: LeaveRequest[]): LeaveTypeTotal[] {
  const counted = requests.filter(isCounted)
  const total = sum(counted.map((request) => request.days))

  return LEAVE_TYPES.map((type) => {
    const days = sum(
      counted.filter((request) => request.type === type).map((r) => r.days),
    )

    return {
      type,
      days,
      percent: total === 0 ? 0 : (days / total) * 100,
    }
  })
}

/**
 * The last `monthCount` months ending with the one containing `todayWorkDate`,
 * each broken down by type.
 *
 * Months with nothing in them are kept as empty columns rather than dropped: a
 * trend chart that silently omits the quiet months is not a trend chart, it is
 * a list of the busy ones with a misleading axis.
 *
 * A multi-day request is attributed to the month it *starts* in. Splitting it
 * across the boundary is more truthful and much harder to read, and the case
 * it fixes — a fortnight straddling the 31st — is rare enough that the axis
 * label carries the ambiguity better than the bars would.
 */
export function totalsByMonth(
  requests: LeaveRequest[],
  todayWorkDate: string,
  monthCount = 6,
): LeaveMonthTotal[] {
  const counted = requests.filter(isCounted)
  const [year, month] = todayWorkDate.slice(0, 7).split('-').map(Number)

  return Array.from({ length: monthCount }, (_, index) => {
    const offset = index - (monthCount - 1)
    // `Date.UTC` normalises month 0 to December of the previous year, so the
    // year boundary needs no special case.
    const date = new Date(Date.UTC(year, month - 1 + offset, 1))
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`

    const inMonth = counted.filter(
      (request) => request.startDate.slice(0, 7) === key,
    )

    const byType = LEAVE_TYPES.map((type) => ({
      type,
      days: sum(inMonth.filter((r) => r.type === type).map((r) => r.days)),
    }))

    return {
      month: key,
      label: formatMonthShort(key),
      byType,
      totalDays: sum(byType.map((entry) => entry.days)),
    }
  })
}

/** Totals for the week strip, for the card's caption. */
export interface WeekTotals {
  workedMinutes: number
  requiredMinutes: number
  leaveDays: number
  eventCount: number
}

/**
 * The week in four numbers.
 *
 * `requiredMinutes` counts only the days that owed something, so a week with a
 * public holiday in it reports "22h of 32h" rather than "22h of 40h" and
 * nobody looks like they are behind for taking a day the office was shut.
 */
export function summariseWeek(week: WeekDay[]): WeekTotals {
  return {
    workedMinutes: sum(week.map((day) => day.workedMinutes)),
    requiredMinutes: sum(week.map((day) => day.requiredMinutes)),
    leaveDays: sum(
      week.map((day) =>
        day.kind === 'leave' ? 1 : day.kind === 'half_day' ? 0.5 : 0,
      ),
    ),
    eventCount: week.reduce((total, day) => total + day.events.length, 0),
  }
}

function sum(values: number[]): number {
  // `toFixed(2)` then back: half days are 0.5 and floating-point addition of
  // enough of them produces 6.999999999999999, which formats as "7" but fails
  // an `=== 7` check somewhere downstream a month later.
  return Number(values.reduce((total, value) => total + value, 0).toFixed(2))
}
