import { WORK_TIMEZONE } from './duration'

/*
  `work_date` is a calendar date, not an instant, and the difference is the
  source of most date bugs in attendance software.

  It is written as `YYYY-MM-DD` in the *employee's working timezone*: a 00:30
  IST check-in belongs to that IST date, not to the previous UTC one. These
  helpers are the only place that converts between the string and a `Date`, so
  the off-by-one lives in one function or in none.
*/

/**
 * `'2026-08-12'` → a `Date` at midday UTC on that date.
 *
 * Midday, not midnight, and that is the whole trick: parsed at midnight UTC,
 * a date renders as the *previous* day anywhere west of Greenwich and as the
 * same day everywhere else — a bug that only appears for some users, in some
 * months. Midday is more than twelve hours from either boundary, so the
 * calendar date survives formatting in any timezone on earth.
 */
export function parseWorkDate(workDate: string): Date {
  return new Date(`${workDate}T12:00:00.000Z`)
}

/** A `Date` → its `YYYY-MM-DD` in the working timezone. */
export function toWorkDate(instant: Date): string {
  // `en-CA` happens to format as YYYY-MM-DD, which is the shortest correct way
  // to get an ISO date *in a specific timezone* without a date library.
  return new Intl.DateTimeFormat('en-CA', { timeZone: WORK_TIMEZONE }).format(
    instant,
  )
}

/** Saturday or Sunday. A per-org setting the day this product leaves India. */
export function isWeekendDate(workDate: string): boolean {
  const weekday = parseWorkDate(workDate).getUTCDay()
  return weekday === 0 || weekday === 6
}

/** `'2026-08'` → `'August 2026'`. */
export function formatMonthLabel(month: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${month}-01T12:00:00.000Z`))
}

/** `'2026-08'` shifted by whole months, staying valid across year ends. */
export function shiftMonth(month: string, delta: number): string {
  const [year, monthNumber] = month.split('-').map(Number)
  // `Date.UTC` normalises month 12 to January of the next year and month -1 to
  // December of the previous one, so December and January need no special case.
  const shifted = new Date(Date.UTC(year, monthNumber - 1 + delta, 1))
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}`
}

/** The `YYYY-MM` a date belongs to. */
export function monthOf(workDate: string): string {
  return workDate.slice(0, 7)
}

/**
 * The seven `YYYY-MM-DD` dates of the week containing `workDate`, Monday first.
 *
 * Monday, not Sunday: the working week starts on Monday here, and a weekly log
 * that opens with the weekend puts two empty rows before the data every time.
 */
export function weekOf(workDate: string): string[] {
  const date = parseWorkDate(workDate)
  // getUTCDay: 0 = Sunday. Shift so Monday is 0 and Sunday is 6.
  const offsetFromMonday = (date.getUTCDay() + 6) % 7
  const monday = new Date(date)
  monday.setUTCDate(date.getUTCDate() - offsetFromMonday)

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday)
    day.setUTCDate(monday.getUTCDate() + index)
    return day.toISOString().slice(0, 10)
  })
}
