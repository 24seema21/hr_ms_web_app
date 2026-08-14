import { WEEKDAYS } from '../types'
import type { LeaveApplicability, WeekdayKey } from '../types'
import { LEAVE_APPLICABILITY } from '../types'

const WEEKDAY_LABELS = new Map(WEEKDAYS.map((day) => [day.key, day.label]))
const WEEKDAY_ORDER = WEEKDAYS.map((day) => day.key)

/**
 * `['mon','tue','wed','thu','fri']` → `'Mon–Fri'`, and anything non-contiguous
 * → `'Mon, Wed, Fri'`.
 *
 * Sorted into week order first, because the toggle group hands back whatever
 * order the buttons were pressed in — an office that works `Fri, Mon, Tue`
 * would otherwise render exactly like that.
 */
export function formatWorkingDays(days: WeekdayKey[]): string {
  if (days.length === 0) return '—'

  const indices = days
    .map((day) => WEEKDAY_ORDER.indexOf(day))
    .sort((a, b) => a - b)

  const isContiguous = indices.every(
    (value, position) => position === 0 || value === indices[position - 1] + 1,
  )

  if (isContiguous && indices.length > 2) {
    const first = WEEKDAY_LABELS.get(WEEKDAY_ORDER[indices[0]])
    const last = WEEKDAY_LABELS.get(
      WEEKDAY_ORDER[indices[indices.length - 1]],
    )
    return `${first}–${last}`
  }

  return indices
    .map((index) => WEEKDAY_LABELS.get(WEEKDAY_ORDER[index]))
    .join(', ')
}

/** `0` → `'On joining'`, `1` → `'Within 1 day'`, `n` → `'Within n days'`. */
export function formatDueIn(days: number): string {
  if (days === 0) return 'On joining'
  return `Within ${days} ${days === 1 ? 'day' : 'days'}`
}

/** `null` renders as uncapped rather than as a missing value. */
export function formatQuota(days: number | null): string {
  if (days === null) return 'Uncapped'
  return `${days} ${days === 1 ? 'day' : 'days'}`
}

const APPLICABILITY_LABELS = new Map<LeaveApplicability, string>(
  LEAVE_APPLICABILITY.map((option) => [option.value, option.label]),
)

export function formatApplicability(value: LeaveApplicability): string {
  return APPLICABILITY_LABELS.get(value) ?? value
}
