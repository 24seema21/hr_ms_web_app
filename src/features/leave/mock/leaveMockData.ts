import {
  countWorkingDays,
  isWeekendDate,
  shiftDays,
  weekOf,
} from '../lib/leaveDates'
import { LEAVE_TYPES } from '../types'
import type {
  LeaveBalance,
  LeaveRequest,
  LeaveType,
  WeekDay,
  WeekDayKind,
  WeekEvent,
} from '../types'

/*
  ─────────────────────────────────────────────────────────────────────────────
  DEMO DATA — REMOVE WHEN THE LEAVE ENDPOINTS ARE LIVE
  ─────────────────────────────────────────────────────────────────────────────
  Everything here is generated from `todayWorkDate` rather than written as
  fixed calendar dates, so the demo still looks like a working year whenever it
  is opened rather than decaying into "all of this happened in 2026".

  Two rules this file follows, both of them lessons from `demoMonth.ts`:

  1. **Deterministic.** No `Math.random()`. Random data reshuffles on every
     render, makes screenshots incomparable, and occasionally invents something
     absurd like eleven consecutive days of sick leave.

  2. **One source of truth.** Balances are *derived* from the requests below,
     never typed out beside them. Hand-written totals are how a demo ends up
     with a chart that says 7 days and a panel that says 9, which is exactly
     the disagreement the real module's architecture exists to prevent.

  The shapes are what the API will return, so nothing above this file changes
  when it lands.
*/

/** Public holidays, as `MM-DD` so they apply to whatever year the demo runs in. */
const HOLIDAY_CALENDAR: { monthDay: string; name: string }[] = [
  { monthDay: '01-26', name: 'Republic Day' },
  { monthDay: '03-06', name: 'Holi' },
  { monthDay: '05-01', name: 'Maharashtra Day' },
  { monthDay: '08-15', name: 'Independence Day' },
  { monthDay: '10-02', name: 'Gandhi Jayanti' },
  { monthDay: '10-21', name: 'Diwali' },
  { monthDay: '12-25', name: 'Christmas Day' },
]

/**
 * The holiday dates for the twelve months around `todayWorkDate`.
 *
 * A window rather than a single year, because the six-month trend chart and
 * the "book leave next month" form both routinely straddle a January.
 */
export function holidaysAround(todayWorkDate: string): Map<string, string> {
  const year = Number(todayWorkDate.slice(0, 4))
  const holidays = new Map<string, string>()

  for (const offset of [-1, 0, 1]) {
    for (const { monthDay, name } of HOLIDAY_CALENDAR) {
      holidays.set(`${year + offset}-${monthDay}`, name)
    }
  }

  return holidays
}

/** A request before its working days have been counted. */
interface RequestSeed {
  id: number
  type: LeaveType
  /** Working days back from today for the *start* of the leave. Negative = future. */
  startOffset: number
  /** Length in calendar days, minus one. `0` is a single day. */
  span: number
  portion: LeaveRequest['portion']
  status: LeaveRequest['status']
  reason: string
  attachmentName: string | null
  decisionNote: string | null
}

/*
  A year that contains one of everything worth looking at: a rejection with a
  reason, a request still in the queue, a half day, a stretch of earned leave,
  an unpaid day, something approved and still in the future, and one the
  employee withdrew themselves.

  Offsets are in calendar days back from today, chosen so each lands on a
  weekday for a Thursday "today" and stays plausible for any other.
*/
const REQUEST_SEEDS: RequestSeed[] = [
  {
    id: 4021,
    type: 'earned',
    startOffset: -21,
    span: 4,
    portion: 'full',
    status: 'approved',
    reason:
      'Family wedding in Nashik — travelling on the Friday and back on the Tuesday.',
    attachmentName: null,
    decisionNote: null,
  },
  {
    id: 4018,
    type: 'sick',
    startOffset: 4,
    span: 0,
    portion: 'full',
    status: 'pending',
    reason:
      'Dental surgery scheduled for the morning, advised to rest for the day.',
    attachmentName: 'apollo-dental-advice.pdf',
    decisionNote: null,
  },
  {
    id: 4011,
    type: 'casual',
    startOffset: 9,
    span: 0,
    portion: 'second_half',
    status: 'approved',
    reason: 'School parent-teacher meeting at 2pm, back online by 5.',
    attachmentName: null,
    decisionNote: null,
  },
  {
    id: 4004,
    type: 'sick',
    startOffset: 26,
    span: 2,
    portion: 'full',
    status: 'approved',
    reason: 'Viral fever, advised three days of rest by the physician.',
    attachmentName: 'medical-certificate-mar.pdf',
    decisionNote: null,
  },
  {
    id: 3996,
    type: 'casual',
    startOffset: 38,
    span: 0,
    portion: 'full',
    status: 'approved',
    reason: 'Passport renewal appointment at the Pune Seva Kendra.',
    attachmentName: null,
    decisionNote: null,
  },
  {
    id: 3987,
    type: 'earned',
    startOffset: 52,
    span: 6,
    portion: 'full',
    status: 'approved',
    reason: 'Annual holiday — Kerala with family, booked in February.',
    attachmentName: null,
    decisionNote: null,
  },
  {
    id: 3975,
    type: 'casual',
    startOffset: 67,
    span: 0,
    portion: 'first_half',
    status: 'rejected',
    reason: 'Wanted the morning off before the quarterly release.',
    attachmentName: null,
    decisionNote:
      'Release window — please re-apply for any day after the 30th.',
  },
  {
    id: 3968,
    type: 'unpaid',
    startOffset: 81,
    span: 1,
    portion: 'full',
    status: 'approved',
    reason: 'Paid balance exhausted; needed two days for a house move.',
    attachmentName: null,
    decisionNote: null,
  },
  {
    id: 3959,
    type: 'sick',
    startOffset: 95,
    span: 0,
    portion: 'full',
    status: 'approved',
    reason: 'Food poisoning, unable to work.',
    attachmentName: null,
    decisionNote: null,
  },
  {
    id: 3944,
    type: 'casual',
    startOffset: 112,
    span: 0,
    portion: 'full',
    status: 'cancelled',
    reason: 'Planned a long weekend, then the trip fell through.',
    attachmentName: null,
    decisionNote: null,
  },
  {
    id: 3931,
    type: 'earned',
    startOffset: 133,
    span: 3,
    portion: 'full',
    status: 'approved',
    reason: 'Short break after the platform migration shipped.',
    attachmentName: null,
    decisionNote: null,
  },
  {
    id: 3922,
    type: 'sick',
    startOffset: 151,
    span: 0,
    portion: 'second_half',
    status: 'approved',
    reason: 'Migraine — logged off after lunch.',
    attachmentName: null,
    decisionNote: null,
  },
]

const APPROVER_NAME = 'Priya Desai'

/**
 * Nudges a date off a weekend and onto the following Monday.
 *
 * Leave that starts on a Saturday is legal but reads as a mistake in a demo,
 * and a request whose range contains no working days at all would render as a
 * zero-day row.
 */
function ontoWorkingDay(workDate: string): string {
  let date = workDate
  while (isWeekendDate(date)) date = shiftDays(date, 1)
  return date
}

/** The earlier of two `YYYY-MM-DD` dates. Lexical order is date order. */
function earlier(a: string, b: string): string {
  return a < b ? a : b
}

/** The request list, newest first — the order the history table wants. */
export function buildLeaveRequests(
  todayWorkDate: string,
  holidays: ReadonlySet<string>,
): LeaveRequest[] {
  return REQUEST_SEEDS.map((seed) => {
    const startDate = ontoWorkingDay(
      shiftDays(todayWorkDate, -seed.startOffset),
    )
    const endDate = shiftDays(startDate, seed.span)

    /*
      Counted, not declared. A hand-written `days: 5` next to a range that
      contains a public holiday is a demo that argues with itself the moment
      anyone checks — and this is the exact number payroll would query.
    */
    const workingDays = countWorkingDays(startDate, endDate, holidays)
    const days = seed.portion === 'full' ? workingDays : workingDays - 0.5

    /*
      Applied a few days before the leave, and decided a day or two after that
      — but never in the future, which is the trap the first version fell into.
      A request whose leave starts next month would otherwise be stamped
      "applied 29 Aug" on a screen dated the 13th, and a row that claims to
      have been filed in the future undermines every other date on the page.
    */
    const appliedOn = earlier(shiftDays(startDate, -5), todayWorkDate)
    const decidedOn =
      seed.status === 'pending' ? null : earlier(shiftDays(appliedOn, 2), todayWorkDate)

    return {
      id: seed.id,
      type: seed.type,
      startDate,
      endDate,
      portion: seed.portion,
      days: Math.max(0.5, days),
      reason: seed.reason,
      status: seed.status,
      appliedOn,
      decidedOn,
      approverName: APPROVER_NAME,
      attachmentName: seed.attachmentName,
      decisionNote: seed.decisionNote,
    }
  }).sort((a, b) => b.appliedOn.localeCompare(a.appliedOn))
}

/** What the org grants per year. `null` means uncapped. */
const ENTITLEMENTS: Record<LeaveType, number | null> = {
  earned: 18,
  casual: 8,
  sick: 10,
  unpaid: null,
}

/**
 * Balances, derived from the requests rather than declared beside them.
 *
 * "Used" is leave that has already happened; "scheduled" is approved leave
 * still in the future. Keeping them apart matters because they answer
 * different questions — how much have I spent, and how much have I already
 * committed — and a single "used" figure that quietly includes next month's
 * holiday is the one people dispute.
 */
export function buildLeaveBalances(
  requests: LeaveRequest[],
  todayWorkDate: string,
): LeaveBalance[] {
  return LEAVE_TYPES.map((type) => {
    const forType = requests.filter((request) => request.type === type)

    const daysWhere = (predicate: (request: LeaveRequest) => boolean) =>
      Number(
        forType
          .filter(predicate)
          .reduce((total, request) => total + request.days, 0)
          .toFixed(2),
      )

    return {
      type,
      entitledDays: ENTITLEMENTS[type],
      usedDays: daysWhere(
        (request) =>
          request.status === 'approved' && request.startDate <= todayWorkDate,
      ),
      scheduledDays: daysWhere(
        (request) =>
          request.status === 'approved' && request.startDate > todayWorkDate,
      ),
      pendingDays: daysWhere((request) => request.status === 'pending'),
    }
  })
}

/* ── This week ─────────────────────────────────────────────────────────── */

/** Events keyed by how far into the week they fall (0 = Monday). */
const WEEK_EVENT_SEEDS: Record<number, Omit<WeekEvent, 'id'>[]> = {
  0: [
    { title: 'Sprint planning', kind: 'meeting', startTime: '10:00' },
    { title: 'Payroll cut-off', kind: 'deadline', startTime: null },
  ],
  1: [{ title: 'Design review', kind: 'meeting', startTime: '15:30' }],
  2: [{ title: "Anjali's birthday", kind: 'birthday', startTime: null }],
  3: [
    { title: 'One-on-one with Priya', kind: 'meeting', startTime: '11:00' },
    { title: 'Release sign-off', kind: 'deadline', startTime: '17:00' },
  ],
  4: [{ title: 'Team retro', kind: 'meeting', startTime: '16:00' }],
}

/**
 * The current week, Monday to Sunday.
 *
 * Days after today are `upcoming` rather than absent — a Friday that has not
 * happened yet is not a Friday nobody turned up for, and rendering the two the
 * same way is how a demo accidentally reports a week of absence.
 */
export function buildWeekOverview(
  todayWorkDate: string,
  holidays: ReadonlyMap<string, string>,
  requests: LeaveRequest[],
): WeekDay[] {
  const standardMinutes = 480

  /** The approved leave covering a date, if any. */
  const leaveOn = (workDate: string) =>
    requests.find(
      (request) =>
        request.status === 'approved' &&
        request.startDate <= workDate &&
        request.endDate >= workDate,
    )

  return weekOf(todayWorkDate).map((workDate, index) => {
    const events: WeekEvent[] = (WEEK_EVENT_SEEDS[index] ?? []).map(
      (event, eventIndex) => ({ ...event, id: index * 10 + eventIndex }),
    )

    const holidayName = holidays.get(workDate) ?? null
    const leave = leaveOn(workDate)

    /*
      The kind is decided in priority order, and the order is the point: a
      public holiday during a week of approved leave is a holiday, not a leave
      day, because it must not be deducted from the balance twice.
    */
    let kind: WeekDayKind
    if (isWeekendDate(workDate)) kind = 'weekend'
    else if (holidayName) kind = 'holiday'
    else if (leave) kind = leave.portion === 'full' ? 'leave' : 'half_day'
    else if (workDate > todayWorkDate) kind = 'upcoming'
    // One deliberate absence, on the Tuesday, so the bar view has something
    // that is not a full column and the grid has a red dot to explain.
    else if (index === 1) kind = 'absent'
    else kind = 'present'

    if (holidayName) {
      events.unshift({
        id: index * 10 + 9,
        title: holidayName,
        kind: 'holiday',
        startTime: null,
      })
    }

    /*
      Worked minutes, varied by a small deterministic function of the date so
      the bar view has a readable shape rather than five identical columns.
      Nothing here is random — the same week always draws the same chart.
    */
    const variance = (Number(workDate.slice(-2)) * 37) % 90

    const workedMinutes =
      kind === 'present'
        ? standardMinutes - 20 + variance
        : kind === 'half_day'
          ? Math.round(standardMinutes / 2) - 10 + (variance % 30)
          : 0

    return {
      workDate,
      kind,
      workedMinutes,
      // Nothing is owed on a day off, which is what keeps the week's
      // "22h of 32h" honest when there is a holiday in it.
      requiredMinutes:
        kind === 'weekend' || kind === 'holiday' || kind === 'leave'
          ? 0
          : kind === 'half_day'
            ? standardMinutes / 2
            : standardMinutes,
      holidayName,
      leaveType: leave?.type ?? null,
      events,
    }
  })
}
