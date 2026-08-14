import { z } from 'zod'

/*
  Numeric settings are carried through the forms as *strings*, then converted on
  submit.

  Two reasons. `valueAsNumber` hands Zod a `NaN` for an empty input, which
  surfaces as "expected number, received NaN" — a message no HR administrator
  should ever read. And every form in this codebase already keeps its values as
  strings (see `EMPTY_EMPLOYEE_FORM`), so a controlled input is never handed
  `undefined`.
*/

/** A required whole number of days, within an inclusive range. */
export function dayCountField(label: string, min: number, max: number) {
  return z
    .string()
    .trim()
    // Ordered so an empty field says "required" rather than "must be a number".
    .min(1, `${label} is required`)
    .regex(/^\d+$/, `${label} must be a whole number`)
    .refine(
      (value) => Number(value) >= min && Number(value) <= max,
      `${label} must be between ${min} and ${max}`,
    )
}

/** The same, but an empty string is allowed and means "not set". */
export function optionalDayCountField(label: string, min: number, max: number) {
  return z
    .string()
    .trim()
    .refine(
      (value) => value === '' || /^\d+$/.test(value),
      `${label} must be a whole number`,
    )
    .refine(
      (value) =>
        value === '' || (Number(value) >= min && Number(value) <= max),
      `${label} must be between ${min} and ${max}`,
    )
}

/** `'12'` → `12`, `''` → `null`. */
export function toNumberOrNull(value: string): number | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : Number(trimmed)
}
