/*
  Calendar-date helpers for the leave module.

  These deliberately mirror `features/attendance/lib/workDate.ts` rather than
  importing it: `shared/` may not import from `features/`, and one feature
  reaching into another's `lib/` is the same coupling with an extra hop. When
  leave ships for real, the three generic helpers here and their attendance
  twins should be promoted into `shared/lib/workDate.ts` and both features
  should import that.
*/

export const WORK_TIMEZONE = 'Asia/Kolkata'

/**
 * `'2026-08-12'` → a `Date` at midday UTC.
 *
 * Midday, not midnight: parsed at midnight a date renders as the *previous*
 * day anywhere west of Greenwich. Midday is more than twelve hours from either
 * boundary, so the calendar date survives formatting in any timezone.
 */
export function parseWorkDate(workDate: string): Date {
  return new Date(`${workDate}T12:00:00.000Z`)
}

/** A `Date` → its `YYYY-MM-DD` in the working timezone. */
export function toWorkDate(instant: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: WORK_TIMEZONE }).format(
    instant,
  )
}

/** Saturday or Sunday. A per-org setting the day this product leaves India. */
export function isWeekendDate(workDate: string): boolean {
  const weekday = parseWorkDate(workDate).getUTCDay()
  return weekday === 0 || weekday === 6
}

/** `workDate` shifted by whole days, staying valid across month and year ends. */
export function shiftDays(workDate: string, delta: number): string {
  const date = parseWorkDate(workDate)
  date.setUTCDate(date.getUTCDate() + delta)
  return date.toISOString().slice(0, 10)
}

/**
 * The seven dates of the week containing `workDate`, Monday first.
 *
 * Monday, not Sunday: the working week starts on Monday here, and a weekly
 * strip that opens with the weekend puts two dead columns before the data.
 */
export function weekOf(workDate: string): string[] {
  const date = parseWorkDate(workDate)
  // getUTCDay: 0 = Sunday. Shift so Monday is 0 and Sunday is 6.
  const offsetFromMonday = (date.getUTCDay() + 6) % 7
  const monday = new Date(date)
  monday.setUTCDate(date.getUTCDate() - offsetFromMonday)

  return Array.from({ length: 7 }, (_, index) => shiftDays(
    monday.toISOString().slice(0, 10),
    index,
  ))
}

/** Every date from `startDate` to `endDate` inclusive, ascending. */
export function datesBetween(startDate: string, endDate: string): string[] {
  if (endDate < startDate) return []

  const dates: string[] = []
  for (let date = startDate; date <= endDate; date = shiftDays(date, 1)) {
    dates.push(date)
  }
  return dates
}

/**
 * Working days in an inclusive range, excluding weekends and public holidays.
 *
 * This is the number the employee sees while filling the form, and it is the
 * single most reassuring thing on it: "Mon 24th to Fri 28th" is five days to a
 * calendar and four to payroll if the Thursday is a holiday, and finding that
 * out after approval is how somebody ends up a day short.
 *
 * The server recomputes it on submit and its answer wins — see `LeaveRequest.days`.
 */
export function countWorkingDays(
  startDate: string,
  endDate: string,
  holidays: ReadonlySet<string>,
): number {
  return datesBetween(startDate, endDate).filter(
    (date) => !isWeekendDate(date) && !holidays.has(date),
  ).length
}

/* Formatters built once at module load — `new Intl.DateTimeFormat()` resolves
   locale data on every construction, and these run per table row. */

const shortDateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  timeZone: 'UTC',
})

const longDateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

const weekdayFormatter = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  timeZone: 'UTC',
})

const monthFormatter = new Intl.DateTimeFormat('en-IN', {
  month: 'short',
  timeZone: 'UTC',
})

/** `12 Aug`. */
export function formatShortDate(workDate: string): string {
  return shortDateFormatter.format(parseWorkDate(workDate))
}

/** `12 August 2026`. */
export function formatLongDate(workDate: string): string {
  return longDateFormatter.format(parseWorkDate(workDate))
}

/** `Tue`. */
export function formatWeekday(workDate: string): string {
  return weekdayFormatter.format(parseWorkDate(workDate))
}

/** `'2026-08'` → `Aug`. */
export function formatMonthShort(month: string): string {
  return monthFormatter.format(new Date(`${month}-01T12:00:00.000Z`))
}

/** The day number, unpadded — for the week grid's date corner. */
export function dayOfMonth(workDate: string): number {
  return parseWorkDate(workDate).getUTCDate()
}

/**
 * A date range said the way a person would: one date when it is one day,
 * two when it is not, and the month named once when both fall inside it.
 */
export function formatDateRange(startDate: string, endDate: string): string {
  if (startDate === endDate) return formatLongDate(startDate)

  const sameMonth = startDate.slice(0, 7) === endDate.slice(0, 7)
  const start = sameMonth
    ? String(dayOfMonth(startDate))
    : formatShortDate(startDate)

  return `${start} – ${formatLongDate(endDate)}`
}

/** `405` → `6h 45m`. Mirrors the attendance module's formatter. */
export function formatDuration(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes))
  const hours = Math.floor(safe / 60)
  const remainder = safe % 60

  if (hours === 0) return `${remainder}m`
  if (remainder === 0) return `${hours}h`
  return `${hours}h ${String(remainder).padStart(2, '0')}m`
}

/**
 * `2.5` → `2.5`, `3.0` → `3`.
 *
 * Half days are real and `3.0 days` looks like a rounding artefact, while
 * silently showing `3` when the truth is `2.5` is a payroll dispute.
 */
export function formatDays(days: number): string {
  return Number.isInteger(days) ? String(days) : days.toFixed(1)
}

/** `2.5` → `2.5 days`, `1` → `1 day`. */
export function formatDayCount(days: number): string {
  return `${formatDays(days)} ${days === 1 ? 'day' : 'days'}`
}
