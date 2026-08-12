/*
  Every duration and every clock time in the product is formatted here.

  Not because formatting is hard, but because *consistency* is: three
  components each calling `toLocaleTimeString()` produce three different
  answers on the same data, and the one that forgets `timeZone` produces the
  wrong one on a laptop that travelled.
*/

/**
 * The organisation's working timezone.
 *
 * Deliberately explicit rather than the browser's. An employee who opens the
 * dashboard from an airport in Dubai must still see their Indian working day —
 * their shift did not move because their laptop did. This becomes a per-employee
 * field when the product has more than one office.
 */
export const WORK_TIMEZONE = 'Asia/Kolkata'

/*
  Formatters are created once at module load, not per call.

  `new Intl.DateTimeFormat(...)` is surprisingly expensive — it resolves locale
  data every time — and the running-session clock re-renders every second.
*/
const timeFormatter = new Intl.DateTimeFormat('en-IN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
  timeZone: WORK_TIMEZONE,
})

const dayFormatter = new Intl.DateTimeFormat('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: WORK_TIMEZONE,
})

const shortDayFormatter = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  timeZone: WORK_TIMEZONE,
})

/**
 * `09:15 AM` — a wall-clock time in the working timezone.
 *
 * The meridiem is upper-cased by hand because `en-IN` emits "am"/"pm" in
 * lower case, which reads as an afterthought next to figures and is
 * inconsistent with every other clock in the product. Uppercasing the letters
 * rather than the whole string keeps whatever separator the locale chose —
 * some use a narrow no-break space, and replacing it breaks copy-paste.
 */
export function formatClockTime(instant: Date): string {
  return timeFormatter
    .format(instant)
    .replace(/\b(am|pm)\b/i, (meridiem) => meridiem.toUpperCase())
}

/** `Tuesday, 12 August 2026`. */
export function formatFullDay(instant: Date): string {
  return dayFormatter.format(instant)
}

/** `Tue, 12 Aug`. */
export function formatShortDay(instant: Date): string {
  return shortDayFormatter.format(instant)
}

/**
 * `405` → `6h 45m`, `45` → `45m`, `0` → `0m`.
 *
 * Minutes in, never seconds: the rounding rule is applied once, on the way in
 * (`minutesBetween` floors), so two places can never disagree about whether
 * 44 minutes and 55 seconds is 44 or 45. Payroll rounds down; a minute the
 * employee did not work is a minute nobody should be paying for, and the
 * seconds even out across a month.
 */
export function formatDuration(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes))
  const hours = Math.floor(safe / 60)
  const remainder = safe % 60

  if (hours === 0) return `${remainder}m`
  if (remainder === 0) return `${hours}h`
  // `padStart` so "8h 05m" lines up under "8h 45m" in a column of figures.
  return `${hours}h ${String(remainder).padStart(2, '0')}m`
}

/**
 * The same duration, spelled out for a screen reader.
 *
 * "6h 45m" is read as "six h forty-five m" by most engines, which is not what
 * anyone means. Used in `aria-valuetext` and `aria-label`, never on screen.
 */
export function spellDuration(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes))
  const hours = Math.floor(safe / 60)
  const remainder = safe % 60
  const parts: string[] = []

  if (hours > 0) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`)
  if (remainder > 0 || hours === 0) {
    parts.push(`${remainder} minute${remainder === 1 ? '' : 's'}`)
  }

  return parts.join(' ')
}

/**
 * Whole minutes between two instants, floored, never negative.
 *
 * The clamp is not defensive programming for its own sake: a session whose
 * check-out precedes its check-in is a real thing that happens when a server
 * clock is corrected mid-shift, and the honest answer on screen is `0m` next
 * to a flag for review — not `-17m`, which looks like a bug in the app and
 * quietly poisons every total it is added to.
 */
export function minutesBetween(from: Date, to: Date): number {
  const milliseconds = to.getTime() - from.getTime()
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return 0
  return Math.floor(milliseconds / 60_000)
}
